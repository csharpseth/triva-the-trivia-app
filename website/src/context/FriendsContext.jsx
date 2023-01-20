import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import axios from "axios";

import { API_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const FriendsContext = createContext()

export const FriendsProvider = ({ children }) => {
    const navigate = useNavigate()

    const { userData, Loading, Notify } = useContext(ApplicationContext)

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

    function SearchForFriends(query) {
        const reg = new RegExp(query, 'i')
        let results = friends.filter(f => {
            return reg.test(f.username) || reg.test(f.name)
        })

        return results
    }

    function FriendRequest(userToAddID, callback) {
        Loading(true)
        axios.post(`${API_URL}/friends/request`, { userID: userData._id, authKey: userData.authKey, userToAddID })
        .then(res => {
            Loading(false)
            if(res.data.success === true) {
                callback ? callback() : ''
            }
        })
        .catch(e => {
            console.log('Friend Request Error: ' + e)
            Loading(false)
        })
    }

    function AcceptFriend(userToAddID, callback) {
        Loading(true)
        axios.post(`${API_URL}/friends/accept`, { userID: userData._id, authKey: userData.authKey, userToAddID })
        .then(res => {
            Loading(false)
            if(res.data.success === true) {
                callback ? callback() : ''
            }
        })
        .catch(e => {
            console.log('Add Friend Error: ' + e)
            Loading(false)
        })
    }

    function DeclineFriendRequest(userToDeclineID, callback) {
        Loading(true)
        axios.post(`${API_URL}/friends/decline`, { userID: userData._id, authKey: userData.authKey, userToDeclineID })
        .then(res => {
            Loading(false)
            if(res.data.success === true) {
                callback ? callback() : ''
            }
        })
        .catch(e => {
            console.log('Decline Friend Request Error: ' + e)
            Loading(false)
        })
    }

    function CancelFriendRequest(userToCancelID, callback) {
        Loading(true)
        axios.post(`${API_URL}/friends/cancel`, { userID: userData._id, authKey: userData.authKey, userToCancelID })
        .then(res => {
            Loading(false)
            if(res.data.success === true) {
                callback ? callback() : ''
            }
        })
        .catch(e => {
            console.log('Cancel Request Error: ' + e)
            Loading(false)
        })
    }

    function RemoveFriend(userToRemoveID, callback) {
        Loading(true)
        axios.post(`${API_URL}/friends/remove`, { userID: userData._id, authKey: userData.authKey, userToRemoveID })
        .then(res => {
            Loading(false)
            if(res.data.success === true) {
                callback ? callback() : ''
            }
        })
        .catch(e => {
            console.log('Remove Friend Error: ' + e)
            Loading(false)
        })
    }


    useLayoutEffect(() => {
        LoadAllFriends()
    }, [])

    return (
        <FriendsContext.Provider value={{
            receivedFriendRequests,
            sentFriendRequests,
            friends,
            LoadAllFriends,
            SearchForUsers,
            SearchForFriends,
            FriendRequest,
            AcceptFriend,
            DeclineFriendRequest,
            CancelFriendRequest,
            RemoveFriend,
        }}
        >
            {children}
        </FriendsContext.Provider>
    )
}