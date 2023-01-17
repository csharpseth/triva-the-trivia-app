const io = require('socket.io')(4000, {
    cors: {
        origin: ['http://localhost:5173'],
    }
})

io.on('connection', socket => {
    socket.on('message', (message) => {
        io.emit('receive-message', message)
    })
})