import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'  
import axios from "axios";

import { API_URL, SOCKET_URL } from '../IGNORE/URLs'

import { ApplicationContext } from "./ApplicationContext";
import { FriendsContext } from "./FriendsContext";
import { useEffect } from "react";

export const SocketContext = createContext()

var socket = null

export const SocketProvider = ({ children }) => {
    const navigate = useNavigate()

    const { userData, Notify, CloseNotification } = useContext(ApplicationContext)
    const { LoadAllFriends, AcceptFriend, DeclineFriendRequest } = useContext(FriendsContext)

    let connected = false

    function TryConnect() {
        if(socket === null) {
            console.log(`Attempting to connect to ${SOCKET_URL}...`);
            socket = io(SOCKET_URL)
            if(userData) {
                Setup()
            }
        }
    }

    function Setup() {
        socket.on('connect', () => {

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
        })

        socket.on('disconnect', () => {
            connected = false
            socket = null
            console.log('Socket Connection Terminated.')
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

    useEffect(() => {
        TryConnect()
    }, [])

    return (
        <SocketContext.Provider value={{  }}>
            {children}
        </SocketContext.Provider>
    )
}