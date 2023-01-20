import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'  
import axios from "axios";

import { API_URL, SOCKET_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const FriendsContext = createContext()

var socket = null

export const FriendsProvider = ({ children }) => {
    const navigate = useNavigate()

    const { userData, Loading, AcceptFriend, DeclineFriendRequest, Notify } = useContext(ApplicationContext)

    const [receivedFriendRequests, setReceivedRequests] = useState([])
    const [sentFriendRequests, setSentRequests] = useState([])
    const [friends, setFriends] = useState([])
    
    function LoadAllFriends() {
        Loading(true)
        axios.get(`${API_URL}/friends/${userData._id}/${userData.authKey}`)
        .then(res => {
            if(res.data.success === true) {
                setReceivedRequests(res.data.receivedUsers)
                setSentRequests(res.data.sentUsers)
                setFriends(res.data.friends)
            }
            Loading(false)
        })
        .catch(e => {
            console.log(e.message)
            Loading(false)
        })
    }

    function SearchForUsers(query, callback) {
        axios.post(`${API_URL}/users/findall`, { query, userID: userData._id })
        .then(res => {
            callback ? callback(res.data) : ''
        }).catch(e => {
            console.log(e)
        })
    }

    useLayoutEffect(() => {
        LoadAllFriends()
    }, [])

    return (
        <FriendsContext.Provider value={{ receivedFriendRequests, sentFriendRequests, friends, LoadAllFriends, SearchForUsers }}>
            {children}
        </FriendsContext.Provider>
    )
}