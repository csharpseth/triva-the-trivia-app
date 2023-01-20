const axios = require('axios')
const io = require('socket.io')(4000, {
    cors: {
        origin: ['http://localhost:5173', 'http://192.168.1.6:5173'],
    }
})

io.on('connection', socket => {
    
    socket.on('setup-room', (roomKey) => {
        socket.join(roomKey)
    })

    socket.on('leave-room', (roomKey) => {
        socket.leave(roomKey)
    })
})

function AlertUserOfFriendRequest(socketID, userWhoRequested) {
    io.to(socketID).emit('notify-request-friend', userWhoRequested.name, userWhoRequested.username, userWhoRequested._id)
}

function AlertUserFriendAccept(socketID, userWhoRequested) {
    io.to(socketID).emit('notify-accept-friend', userWhoRequested.name, userWhoRequested.username, userWhoRequested._id)
}

function DisconnectSocket(socketID) {
    if(!socketID) return

    console.log(`Attempting to disconnect Socket: ${socketID}`);
    io.in(socketID).disconnectSockets(true)
}

module.exports = {
    AlertUserOfFriendRequest,
    AlertUserFriendAccept,
    DisconnectSocket
}