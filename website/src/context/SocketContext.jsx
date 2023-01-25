import React, { createContext, useContext, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'  
import axios from "axios";

import { API_URL, SOCKET_URL } from '../IGNORE/URLs'

import { ApplicationContext } from "./ApplicationContext";
import { FriendsContext } from "./FriendsContext";
import { SessionContext } from "./SessionContext";

export const SocketContext = createContext()

var socket = null

export const SocketProvider = ({ children }) => {
    const navigate = useNavigate()

    const { userData, Notify, CloseNotification } = useContext(ApplicationContext)
    const { LoadAllFriends, AcceptFriend, DeclineFriendRequest } = useContext(FriendsContext)
    const { activeSession, AcceptInvite, RemoveInvite, GetConnectedUsers } = useContext(SessionContext)

    let connected = false

    function TryConnect() {
        console.log(`Attempting to connect to ${SOCKET_URL}...`);
        socket = io(SOCKET_URL)
        if(userData) {
            Setup()
        }
    }

    function Setup() {
        if(socket === null) return
        socket.on('connect', () => {
            setTimeout(() => {
                axios.post(`${API_URL}/users/set_socket_id`, 
                {
                    userID: userData._id,
                    authKey: userData.authKey,
                    socket_id: socket.id
                }).then(res => {
                    if(res.data.success) {
                        connected = true
                        console.log('Successfully Connected.')
                    } else {
                        connected = false
                        socket = null
                        console.log('Failed To Connect.')
                    }
                }).catch(e => {
                    console.log(e)
                })
            }, 500)
        })

        socket.on('close', () => {
            connected = false
            socket = null
            console.log('Socket Connection Terminated.')
        })

        socket.on('notify-request-friend', (res) => {
            LoadAllFriends()
            Notify(`Friend Request From: ${res.name}.`, 5000, [
                {
                    value: 'Accept',
                    style: 'positive',
                    action: (index) => {
                        AcceptFriend(res.userID)
                        setTimeout(LoadAllFriends, 250)
                        CloseNotification()
                    }
                },
                {
                    value: 'Decline',
                    style: 'negative',
                    action: (index) => {
                        DeclineFriendRequest(res.userID)
                        setTimeout(LoadAllFriends, 250)
                        CloseNotification()
                    }
                }
            ])
        })

        socket.on('notify-accept-friend', (res) => {
            LoadAllFriends()
            Notify(`${res.name} accepted your friend request.`, 5000)
        })

        socket.on('notify-game-invite', (res) => {
            Notify(`Game Invite From: ${res.name}.`, 5000, [
                {
                    value: 'Accept',
                    style: 'positive',
                    action: (index) => {
                        AcceptInvite(res.inviteID)
                        CloseNotification()
                    }
                },
                {
                    value: 'Decline',
                    style: 'negative',
                    action: (index) => {
                        RemoveInvite(res.inviteID)
                        CloseNotification()
                    }
                }
            ])
        })

        socket.on('user-join-game', (res) => {
            Notify(`${res.name} joined your game.`, 3000)
            GetConnectedUsers(res.key)
        })

        socket.on('user-leave-game', (res) => {
            Notify(`${res.name} left your game.`, 3000)
            GetConnectedUsers(res.key)
        })
    }

    useEffect(() => {
        TryConnect()
    }, [])

    return (
        <SocketContext.Provider value={{  }}>
            {children}
        </SocketContext.Provider>
    )
}