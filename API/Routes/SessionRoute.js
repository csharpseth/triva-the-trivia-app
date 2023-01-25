const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid')

const mongoose = require('mongoose')

const Session = require('../Models/Session')
const User = require('../Models/User')
const { Invite } = require('../Models/Invite')
const { Topics } = require('../Data/ConfigData')
const {
    AlertUserOfGameInvite,
    CreateOrJoinRoom,
    DeleteRoom,
    LeaveRoom,
    UserJoinedGame,
    UserLeftGame
} = require('../websocket')

function ConstructSessionResponse(session) {
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

router.get('/verify/:sessionID/:userID', async (req, res) => {
    const sessionId = req.params.sessionID
    const userID = req.params.userID

    try {
        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No session with ID: ${sessionId}.` })
            return
        }

        const user = await User.findById(userID)
        if(!user) {
            console.log(`Session Verify :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        let userConnected = String(session.host) === String(userID)
        if(userConnected === false) {
            for (let i = 0; i < session.connected_users.length; i++) {
                const connectedUser = session.connected_users[i];
                if(String(connectedUser) === String(userID)) {
                    userConnected = true
                    break
                }
            }
        }

        if(userConnected === false) {
            user.connected_sessions = await user.connected_sessions.filter(s => String(s) !== String(session._id))
            await user.save()
            console.log(`Session Verify :: User: ${userID} wasn't connected to session ${sessionId}.`)
            res.json({ success: false, message: 'User Not Connected.' })
            return
        }

        const resSession = await ConstructSessionResponse(session)
        res.json(resSession)

    } catch (error) {
        console.log(`Session Verify :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.get('/users/:sessionID', async (req, res) => {
    const sessionId = req.params.sessionID

    try {
        const session = await Session.findById(sessionId)
        if(!session) {
            console.log(`Session Get Connected Users :: No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No session with ID: ${sessionId}.` })
            return
        }

        const connectedUsers = await User.find({ connected_sessions: { $in: [session._id] } }, 'name username score')
        res.json({ success: true, users: connectedUsers })
    } catch (error) {
        console.log(`Session Get Connected Users :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.get('/:userID/:authKey', async (req, res) => {
    const userID = req.params.userID
    const authKey = req.params.authKey

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Session Verify :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`Session Verify :: AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        let hostedSessions = []

        for (let i = 0; i < user.hosted_sessions.length; i++) {
            const session = await Session.findById(user.hosted_sessions[i])
            if(!session) continue

            hostedSessions.push(ConstructSessionResponse(session).session)
        }

        let connectedSessions = []

        for (let i = 0; i < user.connected_sessions.length; i++) {
            const session = await Session.findById(user.connected_sessions[i])
            if(!session) continue

            connectedSessions.push(ConstructSessionResponse(session).session)
        }

        res.json({ success: true, hostedSessions, connectedSessions })

    } catch (error) {
        console.log(`Session Verify :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.post('/create', async (req, res) => {
    const hostID = req.body.userID
    const sessionTitle = req.body.title
    const sessionTopic = req.body.topic
    const sessionDifficulty = req.body.difficulty

    try {
        const user = await User.findById(hostID)
        if(user === undefined || user === null) {
            console.log(`Session Create :: Unable to finder user: ${hostID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }
        
        let uniqueKey = `${uuid()}`.toUpperCase()
        uniqueKey = uniqueKey.slice(0, 6)

        const newSession = new Session({
            host: user._id,
            title: sessionTitle,
            topic: Topics[sessionTopic],
            difficulty: sessionDifficulty,
            key: uniqueKey,
        })

        await newSession.save()

        user.hosted_sessions.push(newSession._id)
        user.save()

        CreateOrJoinRoom(user.socket_id, uniqueKey)

        const resSession = ConstructSessionResponse(newSession)

        res.json(resSession)

    } catch (error) {
        console.log(`Session Create :: ${error}`)
        res.json({ success: false, message: error })
    }
})

router.post('/join', async (req, res) => {
    const userID = req.body.userID
    const sessionKey = req.body.key

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Session Join :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        const session = await Session.findOne({ key: sessionKey })
        if(!session) {
            console.log(`Session Join :: No session with Key: ${sessionKey}.`)
            res.json({ success: false, message: `No Session Found.` })
            return
        }

        session.connected_users.push(user._id)
        await session.save()
        user.connected_sessions.push(session._id)
        await user.save()

        CreateOrJoinRoom(user.socket_id, sessionKey)
        UserJoinedGame(user, sessionKey)

        const resSession = ConstructSessionResponse(session)

        res.json(resSession)


    } catch (error) {
        console.log(`Session Join :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }

})

router.post('/leave', async (req, res) => {
    const userID = req.body.userID
    const sessionId = req.body.sessionId

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Session Leave :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`No session with Key: ${sessionId}.`)
            res.json({ success: false, message: `No session with Key: ${sessionId}.` })
            return
        }

        session.connected_users = session.connected_users.filter(e => String(e) !== String(user._id))
        await session.save()
        user.connected_sessions = user.connected_sessions.filter(e => String(e) !== String(sessionId))
        await user.save()

        LeaveRoom(user.socket_id, session.key)
        UserLeftGame(user, session.key)

        res.json({ success: true, message: 'Successfully left session.' })


    } catch (error) {
        console.log(`Session Leave :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }

})

router.post('/delete', async (req, res) => {
    const hostID = req.body.userID
    const hostAuthKey = req.body.authKey
    const sessionId = req.body.sessionId

    try {
        const user = await User.findById(hostID)
        if(user === undefined || user === null) {
            console.log(`Session Delete :: Unable to finder user: ${hostID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        if(user.authentication.key !== hostAuthKey) {
            console.log(`Session Delete :: AuthKey mismatch.`)
            res.json({ success: false, message: 'AuthKey mismatch.' })
            return
        }

        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`Session Delete :: No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No Session Found.` })
            return
        }

        if(String(session.host) !== String(user._id)) {
            console.log(`Session Delete :: User: ${user.username} is not the host of session: ${sessionId}.`)
            res.json({ success: false, message: `You are not the host of session: ${sessionId}.` })
            return
        }
        
        for (let i = 0; i < session.connected_users.length; i++) {
            const connectedUser = await User.findById(session.connected_users[i])
            if(!connectedUser) continue

            connectedUser.connected_sessions = connectedUser.connected_sessions.filter(e => String(e) !== String(sessionId))
            await connectedUser.save()
        }

        const invites = await Invite.find({ session: session._id })
        for (let i = 0; i < invites.length; i++) {
            const inv = invites[i];
            const sender = await User.findById(inv.sender)
            const recipient = await User.findById(inv.recipient)

            sender.invitesSent = sender.invitesSent.filter(e => String(e._id) !== String(inv._id))
            await sender.save()
            recipient.invitesReceived = recipient.invitesReceived.filter(e => String(e._id) !== String(inv._id))
            await recipient.save()
            await inv.delete()
        }

        await session.delete()
        user.hosted_sessions = user.hosted_sessions.filter(e => String(e) !== String(sessionId))
        await user.save()

        DeleteRoom(session.key)

        res.json({ success: true, message: 'Successfully deleted session.' })

    } catch (error) {
        console.log(`Session Delete :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.post('/invite', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const sessionId = req.body.sessionId
    const userToInviteID = req.body.userToInviteID

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Session Invite :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`Session Invite :: AuthKey mismatch.`)
            res.json({ success: false, message: 'AuthKey mismatch.' })
            return
        }

        const session = await Session.findById(sessionId)
        if(session === undefined || session === null) {
            console.log(`Session Invite :: No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No Session Found.` })
            return
        }

        if(session.allowUserInvites === false && String(session.host) !== userID) {
            console.log(`Session Invite :: Failed To Invite, Not Permitted By Sesion`)
            res.json({ success: false, message: 'Invalid Permissions.' })
            return
        }

        const userToInvite = await User.findById(userToInviteID)
        if(!userToInvite) {
            console.log(`Session Invite :: Unable to finder user to invite: ${userID}.`)
            res.json({ success: false, message: 'No User To Invite Found.' })
            return
        }

        const existingInvite = await Invite.findOne({
            $and: [
                {
                    session: session._id
                },
                {
                    $or: [
                        {
                            sender: user._id,
                            recipient: userToInvite._id
                        },
                        {
                            sender: userToInvite._id,
                            recipient: user._id
                        }
                    ]
                }
            ]
        })

        if(existingInvite) {
            console.log(`Session Invite :: One Already Exists.`)
            res.json({ success: false })
            return
        }
        
        const newInvite = new Invite({
            session: session._id,
            sender: user._id,
            senderUsername: user.username,
            senderName: user.name,
            recipient: userToInvite._id,
            recipientUsername: userToInvite.username,
            recipientName: userToInvite.name,
        })
        await newInvite.save()

        session.invites.push(newInvite)
        await session.save()
        user.invitesSent.push(newInvite)
        await user.save()
        userToInvite.invitesReceived.push(newInvite)
        await userToInvite.save()

        AlertUserOfGameInvite(userToInvite.socket_id, user, newInvite)

        res.json({ success: true })

    } catch (error) {
        console.log(`Session Invite Create :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.post('/invite/accept', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const inviteID = req.body.inviteID

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Session Invite :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`Session Invite :: AuthKey mismatch.`)
            res.json({ success: false, message: 'AuthKey mismatch.' })
            return
        }

        const existingInvite = await Invite.findById(inviteID)
        if(!existingInvite) {
            console.log(`Session Invite :: No Invite Exists.`)
            res.json({ success: false })
            return
        }

        const session = await Session.findById(existingInvite.session)
        if(session === undefined || session === null) {
            console.log(`Session Invite :: No session with ID: ${existingInvite.session}.`)
            res.json({ success: false, message: `No Session Found.` })
            return
        }

        const userSent = await User.findById(existingInvite.sender)
        if(!userSent) {
            console.log(`Session Invite :: Unable to finder user to invite: ${existingInvite.sender}.`)
            res.json({ success: false, message: 'No User To Invite Found.' })
            return
        }

        
        session.invites = await session.invites.filter(invite => String(invite._id) !== String(existingInvite._id))
        session.connected_users.push(user._id)
        await session.save()
        user.invitesReceived = await user.invitesReceived.filter(invite => String(invite._id) !== String(existingInvite._id))
        user.connected_sessions.push(session._id)
        await user.save()
        userSent.invitesSent = await userSent.invitesSent.filter(invite => String(invite._id) !== String(existingInvite._id))
        await userSent.save()

        await existingInvite.delete()

        const resSession = await ConstructSessionResponse(session)
        
        CreateOrJoinRoom(user.socket_id, session.key)
        UserJoinedGame(user, session.key)

        res.json(resSession)

    } catch (error) {
        console.log(`Session Invite Accept :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.post('/invite/remove', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const inviteID = req.body.inviteID

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Session Invite Remove :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`Session Invite Remove :: AuthKey mismatch.`)
            res.json({ success: false, message: 'AuthKey mismatch.' })
            return
        }

        const existingInvite = await Invite.findById(inviteID)
        if(!existingInvite) {
            console.log(`Session Invite Remove :: No Invite Exists.`)
            res.json({ success: false })
            return
        }

        const session = await Session.findById(existingInvite.session)
        if(session === undefined || session === null) {
            console.log(`Session Invite Remove :: No session with ID: ${existingInvite.session}.`)
            res.json({ success: false, message: `No Session Found.` })
            return
        }

        const otherUserID = String(existingInvite.sender) === userID ? existingInvite.recipient : existingInvite.sender

        const otherUser = await User.findById(otherUserID)
        if(!otherUser) {
            console.log(`Session Invite Remove :: Unable to finder user to invite: ${otherUserID}.`)
            res.json({ success: false, message: 'No User To Invite Found.' })
            return
        }

        session.invites = await session.invites.filter(invite => String(invite._id) !== String(existingInvite._id))
        await session.save()
        user.invitesSent = await user.invitesSent.filter(invite => String(invite._id) !== String(existingInvite._id))
        user.invitesReceived = await user.invitesReceived.filter(invite => String(invite._id) !== String(existingInvite._id))
        await user.save()
        otherUser.invitesSent = await otherUser.invitesSent.filter(invite => String(invite._id) !== String(existingInvite._id))
        otherUser.invitesReceived = await otherUser.invitesReceived.filter(invite => String(invite._id) !== String(existingInvite._id))
        await otherUser.save()

        await existingInvite.delete()

        res.json({ success: true })

    } catch (error) {
        console.log(`Session Invite Remove :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

module.exports = router