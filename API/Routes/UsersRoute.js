const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const { v4: uuid } = require('uuid')

const fs = require('fs')
const path = require('path')
const axios = require('axios')

const mongoose = require('mongoose')

const User = require('../Models/User')


const saltRounds = 8

const ConstructAuthenticatedResponseUser = (user) => {
    let resUser = {
        success: true,
        user: {
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
            name: user.name,
            username: user.username,
            score: user.score,
            friends: user.friends,
            createdAt: user.createdAt,
        }
    }

    return resUser
}

const SearchUsers = async(query) => {
    const reg = new RegExp(query, 'i')
    let results = await User.find({$or: [{name: {$regex: reg}}, {username: {$regex: reg}}]}, 'name username friends score')
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

        const write = response.data.pipe(fs.createWriteStream(localPath))
        write.on('finish', () => {
            console.log('downloaded file!')
        })
    } catch (error) {
        console.log(error)
    }
}

router.get('/findall/:query', async (req, res) => {
    let temp = await SearchUsers(req.params.query)
    res.json(temp)
})

router.get('/:username', async (req, res) => {
    const username = req.params.username

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

router.post('/findall', async (req, res) => {
    let temp = await SearchUsers(req.body.query)
    res.json(temp)
})

router.post('/:username/edit', async (req, res) => {
    const oldUsername = req.body.oldUser
    const password = req.body.password

    try {
        const user = await User.findOne({ oldUsername })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${oldUsername}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }
        
        bcrypt.compare(password, user.passwordHash, async (error, result) => {
            if(result === false) {
                console.log(`Incorrect Password!`)
                res.json({ success: false, message: 'Incorrect Password!' })
                return
            }

            const newUsername = req.body.username
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
    const username = req.body.username
    const socket_id = req.body.socket_id

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
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
    const username = req.body.username
    const password = req.body.password

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
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
    const username = req.body.username
    const authKey = req.body.authKey

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }
        
        if(user.authentication.key !== authKey) {
            console.log(`AuthKey Mismatch.`)
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
    const username = req.body.username
    const authKey = req.body.authKey

    try {
        const user = await User.findOne({ username })
        if(user === undefined || user === null) {
            console.log(`Unable to finder user: ${username}.`)
            res.json({ success: false, message: 'No User With That Username Found.' })
            return
        }

        if(user.authentication.key !== authKey) {
            console.log(`User AuthKey Mismatch.`)
            res.json({ success: false, message: 'AuthKey Mismatch.' })
            return
        }

        user.authentication.loggedIn = false
        user.authentication.key = ''

        await user.save()

        res.json({ success: true })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
})

router.post('/register', async (req, res) => {
    const name = req.body.name
    const username = req.body.username
    const password = req.body.password

    try {
        const alreadyUser = await User.exists({ username: username })

        if(alreadyUser === true) {
            console.log(`Unable to create user: ${username}, one with that name already exists.`)
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