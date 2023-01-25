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
} = require('../websocket')

async function GetResponseSession(sessionID) {
    const session = await Session.findById(sessionID, 'title topic difficulty key')
    if(!session) return { success: false, message: `No Session with ID: ${sessionID}.` }

    return { success: true, session: session }
}

async function FindAndValidateUser(userID, authKey) {
    const user = await User.findById(userID)
    if(!user) return { success: false, message: `No User with ID: ${userID}.` }
    if(user.authentication.key !== authKey) return { success: false, message: 'AuthKey Mismatch.' }

    return { success: true, user: user }
}

async function GetUserAndSession(userID, sessionID) {
    const user = await User.findById(userID)
    if(!user) return { success: false, message: `No User with ID: ${userID}.` }
    const session = await Session.findById(sessionID)
    if(!session) return { success: false, message: `No Session with ID: ${sessionID}.` }

    return { success: true, user, session }
}

async function AddHostedSessionToUser(userID, sessionID) {
    const response = await GetUserAndSession(userID, sessionID)    
    if(response.success === false) return response

    response.user.hosted_sessions.push(response.session._id)
    await response.user.save()

    return { success: true }
}

async function RemoveSessionFromUserHost(userID, sessionID) {
    const response = await GetUserAndSession(userID, sessionID)    
    if(response.success === false) return response

    const user = response.user
    user.hosted_sessions = user.hosted_sessions.filter(session => String(session) !== String(sessionID))
    await user.save()

    return { success: true }
}

async function AddConnectedUser(userID, sessionID) {
    const response = await GetUserAndSession(userID, sessionID)    
    if(response.success === false) return response

    const user = response.user
    const session = response.session

    user.connected_sessions.push(session._id)
    await user.save()
    session.connected_users.push(user._id)
    await session.save()

    return { success: true }
}

async function RemoveConnectedUser(userID, sessionID) {
    const response = await GetUserAndSession(userID, sessionID)    
    if(response.success === false) return response

    const user = response.user
    const session = response.session

    user.connected_sessions = user.connected_sessions.filter(s => String(s) !== String(sessionID))
    await user.save()
    session.connected_users = session.connected_users.filter(u => String(u) !== String(userID))
    await session.save()

    return { success: true }
}

async function ScrubInvite(inviteID) {
    const invite = await Invite.findById(inviteID)
    if(!invite) return { success: false, message: `Unable to find invite with ID: ${inviteID}.` }
        
    const sender = await User.findById(invite.sender)
    if(sender) {
        sender.invitesSent = sender.invitesSent.filter(i => String(i._id) !== String(invite._id))
        await sender.save()
    }
    const recipient = await User.findById(invite.recipient)
    if(recipient) {
        recipient.invitesSent = recipient.invitesSent.filter(i => String(i._id) !== String(invite._id))
        await recipient.save()
    }

    await invite.delete()

    return { success: true }
}

async function ScrubSession(sessionID) {
    const session = await Session.findById(sessionID)
    if(!session) return { success: false, message: `No session with ID: ${sessionID}.` }

    const connected = session.connected_users
    const invites = session.invites

    for (let i = 0; i < connected.length; i++) {
        const user = await User.findById(connected[i])
        if(!user) continue

        user.connected_sessions.filter(s => String(s) !== String(sessionID))
        await user.save()
    }

    for (let i = 0; i < invites.length; i++) {
        await ScrubInvite(invites[i]._id)
    }

    const host = await User.findById(session.host)
    if(host) {
        host.hosted_sessions = host.hosted_sessions.filter(s => String(s) !== String(sessionID))
        await host.save()
    }

    await session.delete()
}

async function DeleteSession(userID, authKey, sessionID) {
    const valid = await FindAndValidateUser(userID, authKey)
    if(valid.success === false) {
        return valid
    }

    const foundSession = await FindSession(sessionID)
    if(foundSession.success === false) {
        return foundSession
    }

    if(String(foundSession.session.host) !== String(valid.user._id)) {
        return { success: false, message: 'User is not host.' }
    }

    await ScrubSession(sessionID)

    return { success: true, message: 'Successfully deleted session.' }
}

async function CreateInvite(userID, authKey, userToInviteID, sessionID) {
    const validUser = await FindAndValidateUser(userID, authKey)
    if(validUser.success === false) return validUser

    const validSession = await FindSession(sessionID)
    if(validSession.success === false) return validSession

    const user = validUser.user
    const session = validSession.session
    const userToInvite = await User.findById(userToInviteID)
    if(!userToInvite) return { success: false, message: `User to invite ID: ${userToInviteID} doesn't exist.` }

    const existingInvite = await Invite.findOne({
        session: sessionID,
        recipientUsername: userToInvite.username,
        senderUsername: user.username
    })

    if(existingInvite) {
        return { success: false, message: `User ID: ${userToInviteID} has already been invited.` }
    }

    const invite = new Invite({
        session: session._id,
        
        sender: user._id,
        senderName: user.name,
        senderUsername: user.username,

        recipient: userToInvite._id,
        recipientName: userToInvite.name,
        recipientUsername: userToInvite.username,
    })

    await invite.save()

    user.invitesSent.push(invite)
    await user.save()
    userToInvite.invitesReceived.push(invite)
    await userToInvite.save()
    session.invites.push(invite)
    await session.save()

    return { success: true, user: user, userToInvite: userToInvite, invite: invite }
}

async function FindSession(sessionID) {
    const session = await Session.findById(sessionID)
    if(!session) return { success: false, message: `No Session with ID: ${sessionID}.` }

    return { success: true, session: session }
}

router.get('/verify/:sessionID/:userID', async (req, res) => {
    
})

router.get('/get/users/:sessionID', async (req, res) => {
    const sessionId = req.params.sessionID
    console.log(req.params.sessionID)
    try {
        const session = await Session.findOne({ key: sessionId })
        if(!session) {
            console.log(`Get Connected Session Users :: No session with ID: ${sessionId}.`)
            res.json({ success: false, message: `No session with ID: ${sessionId}.` })
            return
        }

        const connectedUsers = await User.find({ connected_sessions: { $in: [session._id] } }, 'name username score')
        res.json({ success: true, users: connectedUsers })
    } catch (error) {
        console.log(`Get Connected Session Users :: ${error.message}`)
        res.json({ success: false, message: error.message })
    }
})

router.get('/:userID/:authKey', async (req, res) => {
    
})

router.post('/create', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey

        const title = req.body.title
        const topic = req.body.topic
        const difficulty = req.body.difficulty


        let user = await FindAndValidateUser(userID, authKey)
        if(user.success === false) {
            console.log(`Create Session Error :: ${user.message}`)
            res.json(user)
            return
        }
        user = user.user

        const key = `${uuid()}`.slice(0, 6).toUpperCase()

        if(!CreateOrJoinRoom(user, key)) {
            console.log(`Create Session Error :: Failed to establish socket room.`)
            res.json({ success: false, message: 'Failed to establish socket room.' })
            return
        }

        const session = new Session({
            host: user._id,
            title,
            topic,
            difficulty,
            key
        })

        await session.save()

        const addHostResponse = await AddHostedSessionToUser(userID, session._id)
        if(addHostResponse.success === false) {
            console.log(`Create Session Error :: ${addHostResponse.message}`)
            res.json({ success: false, message: addHostResponse.message })
            return
        }

        const response = await GetResponseSession(session._id)
        res.json(response)
    } catch (err) {
        console.log(`Create Session Error :: ${err}`)
        res.json({ success: false, message: 'Create Session Error.' })
    }
})

router.post('/delete', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey
        const sessionID = req.body.sessionID

        const session = await FindSession(sessionID)
        if(session.success === false) {
            console.log(`Delete Session Error :: ${session.message}`)
            return
        }

        const response = await DeleteSession(userID, authKey, sessionID)
        if(response.success === false) {
            console.log(`Delete Session Error :: ${response.message}`)
        }

        DeleteRoom(session.key)

        res.json(response)

    } catch (err) {
        console.log(`Delete Session Error :: ${err}`)
        res.json({ success: false, message: 'Delete Session Error.' })
    }
})

router.post('/join', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey
        const sessionKey = req.body.sessionKey

        const session = await Session.findOne({ key: sessionKey })
        if(!session) {
            console.log(`Join Session Error :: No session with Key: ${sessionKey}.`)
            res.json({ success: false, message: `No session with Key: ${sessionKey}.` })
            return
        }

        const validUser = await FindAndValidateUser(userID, authKey)
        if(validUser.success === false) {
            console.log(`Join Session Error :: ${validUser.message}`)
            res.json(validUser)
            return
        }

        const user = validUser.user

        const response = await AddConnectedUser(userID, session._id)
        if(response.success === false) {
            console.log(`Join Session Error :: ${response.message}`)
            res.json(response)
            return
        }

        if(!CreateOrJoinRoom(user, session.key)) {
            console.log(`Join Session Error :: Failed to establish socket room.`)
            res.json({ success: false, message: 'Failed to establish socket room.' })
            return
        }

        const responseSession = await GetResponseSession(session._id)

        res.json(responseSession)
    } catch (err) {
        console.log(`Join Session Error :: ${err}`)
        res.json({ success: false, message: 'Join Session Error.' })
    }
})

router.post('/leave', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey
        const sessionID = req.body.sessionID

        const session = await Session.findById(sessionID)
        if(!session) {
            console.log(`Leave Session Error :: No session with ID: ${sessionKey}.`)
            res.json({ success: false, message: `No session with ID: ${sessionKey}.` })
            return
        }

        const validUser = await FindAndValidateUser(userID, authKey)
        if(validUser.success === false) {
            console.log(`Leave Session Error :: ${validUser.message}`)
            res.json(validUser)
            return
        }

        const user = validUser.user
        LeaveRoom(user, session.key)

        const response = await RemoveConnectedUser(userID, session._id)
        if(response.success === false) {
            console.log(`Leave Session Error :: ${response.message}`)
            res.json(response)
            return
        }

        res.json({ success: true, message: 'Successfully left session.' })
    } catch (err) {
        console.log(`Leave Session Error :: ${err}`)
        res.json({ success: false, message: 'Leave Session Error.' })
    }
})

router.post('/invite', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey
        const sessionID = req.body.sessionID
        const userToInviteID = req.body.userToInviteID

        const response = await CreateInvite(userID, authKey, userToInviteID, sessionID)
        if(response.success === false) {
            console.log(`Invite To Session Error :: ${response.message}`)
            res.json(response)
            return
        }

        AlertUserOfGameInvite(response.userToInvite.socket_id, response.user, response.invite)
        res.json({ success: true, message: 'Successfully invited user.' })
    } catch (err) {
        console.log(`Invite To Session Error :: ${err}`)
        res.json({ success: false, message: 'Invite To Session Error.' })
    }
})

router.post('/invite/accept', async (req, res) => {
    try {
        const userID = req.body.userID
        const authKey = req.body.authKey
        const inviteID = req.body.inviteID

        const validUser = await FindAndValidateUser(userID, authKey)
        if(validUser.success === false) {
            console.log(`Accept Session Invite Error :: ${validUser.message}`)
            res.json(validUser)
            return
        }
        const user = validUser.user

        const invite = await Invite.findById(inviteID)
        if(!invite) {
            console.log(`Accept Session Invite Error :: No invite with ID: ${inviteID}.`)
            res.json({ success: false, message: `No invite with ID: ${inviteID}.` })
            return
        }

        if(String(invite.recipient) !== String(userID)) {
            console.log(`Accept Session Invite Error :: User ID: ${userID} is not the recipient of Invite ID: ${inviteID}.`)
            res.json({ success: false, message: `User ID: ${userID} is not the recipient of Invite ID: ${inviteID}.` })
            return
        }
        
        const session = await Session.findById(invite.session)
        if(!session) {
            console.log(`Accept Session Invite Error :: No session with ID: ${invite.session}.`)
            res.json({ success: false, message: `No session with ID: ${invite.session}.` })
            return
        }

        const scrubbed = await ScrubInvite(inviteID)
        if(scrubbed.success == false) {
            console.log(`Accept Session Invite Error :: ${scrubbed.message}`)
            res.json(scrubbed)
            return
        }

        const response = await AddConnectedUser(userID, session._id)
        if(response.success === false) {
            console.log(`Accept Session Invite Error :: ${response.message}`)
            res.json(response)
            return
        }

        if(!CreateOrJoinRoom(user, session.key)) {
            console.log(`Accept Session Invite Error :: Failed to establish socket room.`)
            res.json({ success: false, message: 'Failed to establish socket room.' })
            return
        }

        const responseSession = await GetResponseSession(session._id)

        res.json(responseSession)
    } catch (err) {
        console.log(`Accept Session Invite Error :: ${err}`)
        res.json({ success: false, message: 'Session Invite Accept Error.' })
    }
})

router.post('/invite/remove', async (req, res) => {
    try {
        const inviteID = req.body.inviteID
        const response = await ScrubInvite(inviteID)
        res.json(response)
    } catch (err) {
        console.log(`Session Invite Remove Error :: ${err}`)
        res.json({ success: false, message: 'Session Invite Remove Error.' })
    }
})

module.exports = router