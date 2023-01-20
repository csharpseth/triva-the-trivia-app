import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'  
import axios from "axios";

import { API_URL, SOCKET_URL } from '../IGNORE/URLs'

import { ApplicationContext } from "./ApplicationContext";
import { FriendsContext } from "./FriendsContext";

export const SocketContext = createContext()

var socket = null

export const SocketProvider = ({ children }) => {
    const navigate = useNavigate()

    const [ID, setID] = useState()
    const { userData, AcceptFriend, DeclineFriendRequest, Notify, CloseNotification } = useContext(ApplicationContext)
    const { LoadAllFriends } = useContext(FriendsContext)

    function EstablishSocketRoom(roomKey) {
        socket.emit('setup-room', roomKey)
    }

    function Socket_FriendRequest(userID) {
        socket.emit('notify-request-friend', userID)
    }

    useLayoutEffect(() => {
        if(socket === null && userData !== undefined) {
            socket = io(SOCKET_URL)

            socket.on('connect', () => {
                axios.post(`${API_URL}/users/set_socket_id`, 
                {
                    username: userData.username,
                    socket_id: socket.id
                }).then(res => {
                    if(res.data.success) {
                        setID(socket.id)
                    }
                }).catch(e => {
                    console.log(e)
                })
            })

            socket.on('notify-request-friend', (name, username, userID) => {
                LoadAllFriends()
                Notify(`Friend Request From: ${username}.`, 5000, [
                    {
                        value: 'Accept',
                        style: 'positive',
                        action: (index) => {
                            AcceptFriend(userID)
                            setTimeout(LoadAllFriends, 250)
                            CloseNotification()
                        }
                    },
                    {
                        value: 'Decline',
                        style: 'negative',
                        action: (index) => {
                            DeclineFriendRequest(userID)
                            setTimeout(LoadAllFriends, 250)
                            CloseNotification()
                        }
                    }
                ])
            })

            socket.on('notify-accept-friend', (name, username, userID) => {
                LoadAllFriends()
                Notify(`${username} accepted your friend request.`, 5000)
            })
        }
    }, [])

    return (
        <SocketContext.Provider value={{ ID, EstablishSocketRoom, Socket_FriendRequest }}>
            {children}
        </SocketContext.Provider>
    )
}