const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { v4: uuid } = require('uuid')

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const mongoose = require('mongoose')

const User = require('../Models/User')
const { FriendRequest } = require('../Models/FriendRequest')
const { Invite } = require('../Models/Invite')
const { DisconnectSocket } = require('../websocket')


const saltRounds = 8

const ConstructAuthenticatedResponseUser = (user) => {
    let resUser = {
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            score: user.score,
            friends: user.friends,
            createdAt: user.createdAt,
            authKey: user.authentication.key,
        }
    }

    return resUser
}

const ConstructResponseUser = (user) => {
    let resUser = {
        success: true,
        user: {
            _id: user._id,
            name: user.name,
            username: user.username,
            score: user.score,
            friends: user.friends,
            createdAt: user.createdAt,
        }
    }

    return resUser
}

const determineRelationship = async (primary, secondary) => {
    const request = await FriendRequest.findOne({ $or: [{ sender: primary._id, recipient: secondary._id }, { sender: secondary._id, recipient: primary._id }] })
    if(!request) {
        for (let i = 0; i < primary.friends.length; i++) {
            const friend = primary.friends[i];
            if(String(friend) === String(secondary._id)) {
                return 'friend'
            }
        }

        return 'none'
    }

    if(String(request.sender) === String(primary._id)) return 'pending'

    return 'waiting'
}

const SearchUsers = async(query, exclude) => {
    const reg = new RegExp(query, 'i')
    let results = await User.find({$or: [{name: {$regex: reg}}, {username: {$regex: reg}}]}, 'name username friends score')
    const userSearching = await User.findById(exclude)
    let final = []
    for (let i = 0; i < results.length; i++) {
        const user = results[i];
        if(String(user._id) === String(exclude)) continue

        relationship = await determineRelationship(userSearching, user)

        final.push({
            _id: user._id,
            name: user.name,
            username: user.username,
            score: user.score,
            friends: user.friends,
            relationship
        })
    }
    return final
}

const SearchFriends = async(user, query) => {
    const reg = new RegExp(query, 'i')
    let results = await user.friends.filter(f => {
        return reg.test(f.username) || reg.test(f.name)
    })
    
    return results
}

const downloadAvatarImage = async(username) => {
    const url = `https://api.multiavatar.com/${username}.png`
    const fileName = `${username}.png`
    const localPath = path.resolve(__dirname, '../public', 'avatar', fileName)
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
        });

        const write = await response.data.pipe(fs.createWriteStream(localPath))
    } catch (error) {
        console.log(error)
    }
}

router.get('/findall/:query', async (req, res) => {
    let temp = await SearchUsers(req.params.query)
    res.json(temp)
})

router.get('/:username', async (req, res) => {
    const username = req.params.username.toLowerCase()

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }

        const responseUser = ConstructResponseUser(user)

        res.json(responseUser)

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.get('/socket/:userId', async (req, res) => {
    const userId = req.params.userId

    try {
        const user = await User.findById(userId)
        if(user === undefined || user === null) {
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }

        res.json({ success: true, socket_id: user.socket_id, user: ConstructResponseUser(user) })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.get('/notifications/:userID/:authKey', async (req, res) => {
    const userID = req.params.userID
    const authKey = req.params.authKey

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Notifications :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`Notifications :: AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        let friendRequests = user.friendRequestReceived

        friendRequests = friendRequests.sort((a, b) => {
            return a.createdAt - b.createdAt
        })

        res.json({ success: true, friendRequests })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/findall', async (req, res) => {
    let temp = await SearchUsers(req.body.query, req.body.userID)
    res.json(temp)
})

router.post('/:userID/findfriends', async (req, res) => {
    const userID = req.params.userID

    const user = User.findById(userID)
    if(!user) {
        console.log(`Find Friends :: Unable to finder user: ${userID}.`)
        res.json({ success: false, message: 'No User Found.' })
        return
    }

    const query = req.body.query

    const results = await SearchFriends(user, query)
    console.log('Success');
    res.json({ success: true, results })
})

router.post('/:username/edit', async (req, res) => {
    const userID = req.body.userID
    const oldUsername = req.body.oldUser.toLowerCase()
    const password = req.body.password

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Edit :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User Found.' })
            return
        }
        
        bcrypt.compare(password, user.passwordHash, async (error, result) => {
            if(result === false) {
                console.log(`Incorrect Password!`)
                res.json({ success: false, message: 'Incorrect Password!' })
                return
            }

            const newUsername = req.body.username.toLowerCase()
            const name = req.body.name

            user.username = newUsername
            user.name = name

            await user.save()

            if(newUsername !== oldUsername) {
                const oldPath = path.resolve(__dirname, '../public', 'avatar', `${oldUsername}.png`)
                const newPath = path.resolve(__dirname, '../public', 'avatar', `${newUsername}.png`)
                await fs.rename(oldPath, newPath, (err) => {
                    if(err !== null) {
                        console.log(err)
                    }
                })
            }

            const responseUser = ConstructAuthenticatedResponseUser(user)

            res.json(responseUser)
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }

    
})

router.post('/set_socket_id', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey
    const socket_id = req.body.socket_id

    try {
        const user = await User.findById(userID)
        if(!user) {
            console.log(`Socket :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`Socket :: AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        user.socket_id = socket_id
        await user.save()

        res.json({ success: true })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/login', async (req, res) => {
    const username = req.body.username.toLowerCase()
    const password = req.body.password

    try {
        const user = await User.findOne({ username })
        if(!user) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }
        
        bcrypt.compare(password, user.passwordHash, async (error, result) => {
            if(result === false) {
                console.log(`Incorrect Password!`)
                res.json({ success: false, message: 'Incorrect Password!' })
                return
            }

            user.authentication.loggedIn = true
            user.authentication.key !== '' ? '' : user.authentication.key = uuid()

            await user.save()

            const responseUser = ConstructAuthenticatedResponseUser(user)
            res.json(responseUser)
        })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/loginwithauth', async (req, res) => {
    const username = req.body.username.toLowerCase()
    const authKey = req.body.authKey

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Login With Auth :: Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`Login With Auth :: AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }
        user.authentication.loggedIn = true

        await user.save()

        const responseUser = ConstructAuthenticatedResponseUser(user)
        res.json(responseUser)

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/logout', async (req, res) => {
    const userID = req.body.userID
    const authKey = req.body.authKey

    try {
        const user = await User.findById(userID)
        if(user === undefined || user === null) {
            console.log(`Logout :: Unable to finder user: ${userID}.`)
            res.json({ success: false, message: 'No User With That ID Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`User AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        DisconnectSocket(user.socket_id)

        user.authentication.loggedIn = false
        user.authentication.key = ''
        user.socket_id = ''

        await user.save()

        res.json({ success: true })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/register', async (req, res) => {
    const name = req.body.name
    const username = req.body.username.toLowerCase()
    const password = req.body.password

    try {
        const user = await User.exists({ username: username })

        if(user === true) {
            console.log(`Register :: ${username} already exists.`)
            res.json({ success: false, message: 'Username Taken.' })
            return
        }

        bcrypt.hash(password, saltRounds, async (err, passwordHash) => {
            if(err)
            {
                console.log(err)
                res.json({ success: false, message: err })
                return
            }
            
            const key = uuid()

            const newUser = new User({
                name,
                username,
                passwordHash,
                authentication: {
                    loggedIn: true,
                    key,
                },
            })
            await newUser.save()
            await downloadAvatarImage(username)

            const responseUser = ConstructAuthenticatedResponseUser(newUser)
            res.json(responseUser)
        })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

module.exports = router