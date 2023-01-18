const axios = require('axios')
const io = require('socket.io')(4000, {
    cors: {
        origin: ['http://localhost:5173'],
    }
})

io.on('connection', socket => {
    //console.log('User Established WebSocket Connection Successfully')
    
})