const axios = require('axios')
const io = require('socket.io')(4000, {
    cors: {
        origin: ['http://localhost:5173', 'http://192.168.1.6:5173'],
    }
})

function AlertUserOfFriendRequest(socketID, userWhoRequested) {
    const message = {
        name: userWhoRequested.name,
        username: userWhoRequested.username,
        userID: userWhoRequested._id
    }
    io.to(socketID).emit('notify-request-friend', message)
}

function AlertUserFriendAccept(socketID, userWhoRequested) {
    const message = {
        name: userWhoRequested.name,
        username: userWhoRequested.username,
    }

    io.to(socketID).emit('notify-accept-friend', message)
}

function AlertUserOfGameInvite(socketID, userWhoInvited, invite) {
    const message = {
        name: userWhoInvited.name,
        username: userWhoInvited.username,
        inviteID: invite._id
    }
    io.to(socketID).emit('notify-game-invite', message)
}

function CreateOrJoinRoom(socketID, roomKey) {
    const socket = io.sockets.sockets.get(socketID)
    console.log(`${socketID} created/joined room: ${roomKey}`);
    socket.join(roomKey)
}

function DeleteRoom(roomKey) {
    io.socketsLeave(roomKey)
}

function LeaveRoom(socketID, roomKey) {
    const socket = io.sockets.sockets.get(socketID)
    socket.leave(roomKey)
}

function UserJoinedGame(user, roomKey) {
    const message = {
        name: user.name,
        username: user.username,
    }

    console.log(`${user.name} joined room: ${roomKey}`);

    io.to(roomKey).emit('user-join-game', message)
}

function UserLeftGame(user, roomKey) {
    const message = {
        name: user.name,
        username: user.username,
    }

    console.log(`${user.name} left room: ${roomKey}`);

    io.to(roomKey).emit('user-leave-game', message)
}

function DisconnectSocket(socketID) {
    if(!socketID) return

    io.in(socketID).disconnectSockets(true)
}

module.exports = {
    AlertUserOfFriendRequest,
    AlertUserFriendAccept,
    AlertUserOfGameInvite,

    CreateOrJoinRoom,
    DeleteRoom,
    LeaveRoom,
    
    UserJoinedGame,
    UserLeftGame,
    
    DisconnectSocket,
}