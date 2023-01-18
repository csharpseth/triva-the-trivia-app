import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'  
import axios from "axios";

import { API_URL, SOCKET_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const SocketContext = createContext()

var socket = null

export const SocketProvider = ({ children }) => {
    const navigate = useNavigate()

    const { userData } = useContext(ApplicationContext)

    useLayoutEffect(() => {
        if(socket === null && userData !== undefined) {
            socket = io('http://localhost:4000')

            socket.on('connect', () => {
                axios.post(`${API_URL}/users/set_socket_id`, 
                {
                    username: userData.username,
                    socket_id: socket.id
                }).then(res => {
                    console.log(res.data)
                }).catch(e => {
                    console.log(e)
                })
            })
        }
    }, [])

    return (
        <SocketContext.Provider value={{  }}>
            {children}
        </SocketContext.Provider>
    )
}