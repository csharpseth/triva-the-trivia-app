const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid')

const mongoose = require('mongoose')

const Session = require('../Models/Session')
const User = require('../Models/User')

const ConstructAuthenticatedSessionResponse = async(title, topic, key) => {
    return {
        success: true,
        session: {
            title,
            topic,
            key
        }
    }
}

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
        
        let uniqueKey = `${uuid()}`
        uniqueKey = uniqueKey.slice(0, 6)

        const newSession = new Session({
            host: user._id,
            title: sessionTitle,
            topic: sessionTopic,
            key: uniqueKey,
        })

        await newSession.save()
        const resSession = await ConstructAuthenticatedSessionResponse(sessionTitle, sessionTopic, uniqueKey)

        res.json(resSession)

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

module.exports = router