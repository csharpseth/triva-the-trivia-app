const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid')

const mongoose = require('mongoose')

const Session = require('../Models/Session')
const User = require('../Models/User')

const ConstructSessionResponse = async(session) => {
    return {
        success: true,
        session: {
            id: session._id,
            title: session.title,
            topic: session.topic,
            key: session.key,
        }
    }
}

router.get('/verify/:id', async (req, res) => {
    const sessionId = req.params.id

    try {
        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`No session with Key: ${sessionKey}.`)
            res.json({ success: false, message: `No session with Key: ${sessionKey}.` })
            return
        }

        const resSession = await ConstructSessionResponse(session)
        res.json(resSession)

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/create', async (req, res) => {
    const hostUsername = req.body.username
    const sessionTitle = req.body.title
    const sessionTopic = req.body.topic

    try {
        const user = await User.findOne({ username: hostUsername })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${hostUsername}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }
        
        let uniqueKey = `${uuid()}`.toUpperCase()
        uniqueKey = uniqueKey.slice(0, 6)

        const newSession = new Session({
            host: user._id,
            title: sessionTitle,
            topic: sessionTopic,
            key: uniqueKey,
        })

        await newSession.save()

        user.hosted_sessions.push(newSession._id)
        user.save()

        const resSession = await ConstructSessionResponse(newSession)

        res.json(resSession)

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/join', async (req, res) => {
    const username = req.body.username
    const sessionKey = req.body.key

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }

        const session = await Session.findOne({ key: sessionKey })
        if(session === undefined || session === null) {
            console.log(`No session with Key: ${sessionKey}.`)
            res.json({ success: false, message: `No session with Key: ${sessionKey}.` })
            return
        }

        session.connected_users.push(user._id)
        await session.save()
        user.connected_sessions.push(session._id)
        await user.save()

        const resSession = await ConstructSessionResponse(session)

        res.json(resSession)


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }

})

router.post('/leave', async (req, res) => {
    const username = req.body.username
    const sessionId = req.body.sessionId

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }

        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`No session with Key: ${sessionId}.`)
            res.json({ success: false, message: `No session with Key: ${sessionId}.` })
            return
        }

        const userConnections = [...session.connected_users]
        session.connected_users = userConnections.filter(e => String(e) !== String(user._id))
        await session.save()
        const sessionConnections = [...user.connected_sessions]
        user.connected_sessions = sessionConnections.filter(e => String(e) !== String(sessionId))
        await user.save()

        res.json({ success: true, message: 'Successfully left session.' })


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }

})

router.post('/delete', async (req, res) => {
    const hostUsername = req.body.username
    const hostAuthKey = req.body.authKey
    const sessionId = req.body.sessionId

    try {
        const user = await User.findOne({ username: hostUsername })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${hostUsername}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }

        if(user.authentication.key !== hostAuthKey) {
            console.log(`AuthKey mismatch.`)
            res.json({ success: false, message: 'AuthKey mismatch.' })
            return
        }

        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No session with ID: ${sessionId}.` })
            return
        }

        if(String(session.host) !== String(user._id)) {
            console.log(`You are not the host of session: ${sessionId}.`)
            res.json({ success: false, message: `You are not the host of session: ${sessionId}.` })
            return
        }
        
        for (let i = 0; i < session.connected_users.length; i++) {
            const connectedUser = await User.findById(session.connected_users[i])
            if(!connectedUser) continue

            let temp = [...connectedUser.connected_sessions]
            connectedUser.connected_sessions = temp.filter(e => String(e) !== String(sessionId))
            await connectedUser.save()
        }

        await session.delete()
        let newArray = [...user.hosted_sessions]
        user.hosted_sessions = newArray.filter(e => String(e) !== String(sessionId))
        await user.save()

        res.json({ success: true, message: 'Successfully deleted session.' })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

module.exports = router