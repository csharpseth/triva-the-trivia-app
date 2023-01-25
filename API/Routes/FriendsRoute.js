const express = require('express')
const router = express.Router()
const { v4: uuid } = require('uuid')

const mongoose = require('mongoose')

const User = require('../Models/User')
const { FriendRequest } = require('../Models/FriendRequest')
const { AlertUserOfFriendRequest, AlertUserFriendAccept } = require('../websocket')


async function ClearFriendRequests(userA, userB) {
    userA.friendRequestSent = userA.friendRequestSent.filter(request => String(request.recipient) !== String(userB._id))
    userA.friendRequestReceived = userA.friendRequestReceived.filter(request => String(request.sender) !== String(userB._id))
    await userA.save()

    userB.friendRequestSent = userB.friendRequestSent.filter(request => String(request.recipient) !== String(userA._id))
    userB.friendRequestReceived = userB.friendRequestReceived.filter(request => String(request.sender) !== String(userA._id))
    await userB.save()
}

router.get('/:userID/:authKey', async (req, res) => {
    const userID = req.params.userID
    const authKey = req.params.authKey

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const sentRequests = user.friendRequestSent
        const receivedRequests = user.friendRequestReceived

        let receivedUsers = []
        for (let i = 0; i < receivedRequests.length; i++) {
            const u = await User.findById(receivedRequests[i].sender, 'name username score createdAt')
            if(u) {
                receivedUsers.push(u)
            }
        }
        let sentUsers = []
        for (let i = 0; i < sentRequests.length; i++) {
            const u = await User.findById(sentRequests[i].recipient, 'name username score createdAt')
            if(u) {
                sentUsers.push(u)
            }
        }

        let friends = []
        for (let i = 0; i < user.friends.length; i++) {
            const u = await User.findById(user.friends[i], 'name username score createdAt')
            if(u) {
                friends.push(u)
            }
        }

        res.json({ 
            success: true,
            receivedUsers,
            sentUsers,
            friends
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/request', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const userToAddID = req.body.userToAddID

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const userToAdd = await User.findById(userToAddID)
        if(!userToAdd) {
            console.log(`User: ${userID} to add User: ${userToAddID} as a friend, no User with that ID.`)
            res.json({ success: false, message: `Unable to add user: ${userToAddID} as a friend, no User with that ID.` })
            return
        }

        const existingRequest = await FriendRequest.findOne({$or: [{ sender: user._id, recipient: userToAdd._id }, { sender: userToAdd._id, recipient: user._id }]})
        if(existingRequest) {
            console.log(`User: ${userID} already sent a friend request to: ${userToAddID}.`)
            res.json({ success: false, message: `Already sent a friend request to: ${userToAddID}.` })
            return
        }

        const newFriendRequest = new FriendRequest({
            sender: user._id,
            senderUsername: user.username,
            senderName: user.name,
            recipient: userToAdd._id,
            recipientUsername: userToAdd.username,
            recipientName: userToAdd.name
        })

        await newFriendRequest.save()

        user.friendRequestSent.push(newFriendRequest)
        await user.save()
        userToAdd.friendRequestReceived.push(newFriendRequest)
        await userToAdd.save()

        AlertUserOfFriendRequest(userToAdd.socket_id, user)

        res.json({ success: true, message: `Successfully sent friend request to: ${userToAdd.username}` })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/cancel', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const userToCancelID = req.body.userToCancelID

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const userToCancel = await User.findById(userToCancelID)
        if(!userToCancel) {
            console.log(`User: ${userID} failed to add User: ${userToCancel.username} as a friend, no User with that ID.`)
            res.json({ success: false, message: `Unable to add user: ${userToCancel.username} as a friend, no User with that ID.` })
            return
        }

        const existingRequest = await FriendRequest.findOne({$or: [{ sender: user._id, recipient: userToCancel._id }, { sender: userToCancel._id, recipient: user._id }]})
        
        if(!existingRequest) {
            console.log(`No friend request found from: ${userToCancel.username}.`)
            res.json({ success: false, message: `No valid friend request found.` })
            return
        }
        
        await ClearFriendRequests(user, userToCancel)

        await existingRequest.delete()

        res.json({ success: true, message: `Successfully canceled friend request to ${userToCancel.username}` })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/accept', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const userToAddID = req.body.userToAddID

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const userToAdd = await User.findById(userToAddID)
        if(!userToAdd) {
            console.log(`User: ${userID} failed to add User: ${userToAddID} as a friend, no User with that ID.`)
            res.json({ success: false, message: `Unable to add user: ${userToAddID} as a friend, no User with that ID.` })
            return
        }

        const existingRequest = await FriendRequest.findOne({ sender: userToAdd._id, recipient: user._id })
        if(!existingRequest) {
            console.log(`No friend request found from: ${userToAddID}.`)
            res.json({ success: false, message: `No valid friend request found.` })
            return
        }
        
        user.friends.push(userToAdd._id)
        user.friendRequestReceived = user.friendRequestReceived.filter(request => String(request.sender) !== String(userToAdd._id))
        await user.save()

        userToAdd.friends.push(user._id)
        userToAdd.friendRequestSent = userToAdd.friendRequestSent.filter(request => String(request.recipient) !== String(user._id))
        await userToAdd.save()

        await existingRequest.delete()
        
        AlertUserFriendAccept(userToAdd.socket_id, user)

        res.json({ success: true, message: `Successfully friended ${userToAdd.username}` })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/decline', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const userToDeclineID = req.body.userToDeclineID

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const userToDecline = await User.findById(userToDeclineID)
        if(!userToDecline) {
            console.log(`User: ${userID} failed to decline User: ${userToDeclineID} as a friend, no User with that ID.`)
            res.json({ success: false, message: `Unable to decline user: ${userToDeclineID}'s friend request, no User with that ID.` })
            return
        }

        const existingRequest = await FriendRequest.findOne({$or: [{ sender: user._id, recipient: userToDecline._id }, { sender: userToDecline._id, recipient: user._id }]})
        if(!existingRequest) {
            console.log(`No friend request found from: ${userToDeclineID}.`)
            res.json({ success: false, message: `No valid friend request found.` })
            return
        }
        
        ClearFriendRequests(user, userToDecline)

        await existingRequest.delete()

        res.json({ success: true, message: `Successfully declined ${userToDecline.username}'s friend request.` })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/remove', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const userToRemoveID = req.body.userToRemoveID

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Unable to find user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        const userToRemove = await User.findById(userToRemoveID)
        if(!userToRemove) {
            console.log(`User: ${userID} failed to remove User: ${userToRemoveID} as a friend, no User with that ID.`)
            res.json({ success: false, message: `Unable to remove user: ${userToRemoveID} as a friend, no User with that ID.` })
            return
        }

        user.friends = user.friends.filter(user => String(user) !== String(userToRemove._id))
        await user.save()

        userToRemove.friends = userToRemove.friends.filter(user => String(user) !== String(user._id))
        await userToRemove.save()

        res.json({ success: true, message: `Successfully removed ${userToRemove.username} as a friend.` })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})


module.exports = router