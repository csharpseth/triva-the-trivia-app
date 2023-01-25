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

function CreateOrJoinRoom(user, roomKey) {
    const socket = io.sockets.sockets.get(user.socket_id)
    if(!socket) {
        console.log(`Socket Create/Join Room :: Unable to find socket with ID: ${user.socket_id}`)
        return false
    }

    socket.join(roomKey)

    const message = {
        name: user.name,
        username: user.username,
        key: roomKey
    }

    socket.to(roomKey).emit('user-join-game', message)
    return true
}

function DeleteRoom(roomKey) {
    try {
        io.socketsLeave(roomKey)
        return true
    } catch (error) {
        console.log(`Socket Delete Room :: ${error}`)
        return false
    }
}

function LeaveRoom(user, roomKey) {
    const socket = io.sockets.sockets.get(user.socket_id)
    if(!socket) {
        console.log(`Socket Leave Room :: Unable to find socket with ID: ${user.socket_id}`)
        return false
    }
    socket.leave(roomKey)

    const message = {
        name: user.name,
        username: user.username,
        key: roomKey
    }

    socket.to(roomKey).emit('user-leave-game', message)
    return true
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
    
    DisconnectSocket,
}