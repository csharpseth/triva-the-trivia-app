const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

require('dotenv').config()
require('./websocket')

const mongoose = require('mongoose')
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser:true, useUnifiedTopology: true
}, (err) => {
    if(err) console.log(err)
    else console.log('Successfully connected to database!')
});

const usersRouter = require('./Routes/UsersRoute');
const friendsRouter = require('./Routes/FriendsRoute')
const sessionRoute = require('./Routes/SessionRoute');
const { Topics, Difficulties } = require('./Data/ConfigData')

const app = express()
const port = process.env.PORT | 3000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '20MB' }))
app.use(express.static('public'))

app.use('/users', usersRouter)
app.use('/friends', friendsRouter)
app.use('/session', sessionRoute)

app.get('/configdata', (req, res) => {
    res.json({ topics: Topics, difficulties: Difficulties })
})

app.listen(port, () => {
    console.log(`Server is Listening on ${port}`)
})