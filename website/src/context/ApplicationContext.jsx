import React, { createContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from "axios";


import { API_URL } from '../IGNORE/URLs'


export const ApplicationContext = createContext()

export const ApplicationProvider = ({ children }) => {
    const navigate = useNavigate()

    const [cookies, setCookies] = useCookies('triva')

    const [darkMode, setDarkMode] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [userData, setUserData] = useState()
    const [loggedIn, setLoggedIn] = useState(false)

    const [notification, setNotification] = useState({
        active: false,
        body: '',
        options: [],
        onClose: undefined
    })
    
    function Loading(active) {
        if(active) {
            setIsLoading(true)
        }else{
            setTimeout(() => setIsLoading(false), 200)
        }
    }

    function ToggleDarkMode(active) {
        setDarkMode(active)
        setCookies('display', active ? 'dark':'light', {
            path: '/'
        })
    }

    function LoginWithAuth(username, authKey) {
        axios.post(`${API_URL}/users/loginwithauth`, { username, authKey })
        .then(res => {
            if(res.data.success === true) {
                setUserData(res.data.user)
                setCookies('username', res.data.user.username, { path: '/' })
                setCookies('authKey', res.data.user.authKey, { path: '/' })
                setLoggedIn(true)
                navigate('/')
            } else {
                console.log(res.data.message)
                setLoggedIn(false)
            }
        }).catch(e => {
            console.log(`Login Error: ${e}`)
            setLoggedIn(false)
        })
    }

    function Login(username, password) {
        Loading(true)
        axios.post(`${API_URL}/users/login`, { username, password })
        .then(res => {
            if(res.data.success === true) {
                setUserData(res.data.user)
                setCookies('username', res.data.user.username, { path: '/' })
                setCookies('authKey', res.data.user.authKey, { path: '/' })
                setLoggedIn(true)
                navigate('/')
            } else {
                console.log(res.data.message)
            }
            Loading(false)
        }).catch(e => {
            console.log(`Login Error: ${e}`)
            Loading(false)
        })
    }

    function Logout() {
        Loading(true)
        axios.post(`${API_URL}/users/logout`, { userID: userData._id, authKey: userData.authKey })
        .then(res => {
            if(res.data.success === false) {
                console.log(res.data.message)
            }
            setUserData(undefined)
            setCookies('username', '', { path: '/' })
            setCookies('authKey', '', { path: '/' })
            setLoggedIn(false)
            navigate('/login')
            Loading(false)
        }).catch(e => {
            console.log(`Login Error: ${e}`)
            Loading(false)
        })
    }

    function Register(name, username, password) {
        Loading(true)
        axios.post(`${API_URL}/users/register`, { name, username, password })
        .then(res => {
            if(res.data.success === true) {
                setUserData(res.data.user)
                setCookies('username', res.data.user.username, { path: '/' })
                setCookies('authKey', res.data.user.authKey, { path: '/' })
                setLoggedIn(true)
                navigate('/')
            } else {
                console.log(res.data.message)
            }
            Loading(false)
        }).catch(e => {
            console.log(`Registration Error: ${e}`)
            Loading(false)
        })
    }

    function EditProfile(name, username, password) {
        Loading(true)
        axios.post(`${API_URL}/users/${userData.username}/edit`, { userID: userData._id, name, username, oldUser: userData.username, password })
        .then(res => {
            if(res.data.success === true) {
                setUserData(res.data.user)
                setCookies('username', res.data.user.username, { path: '/' })
                setCookies('authKey', res.data.user.authKey, { path: '/' })
                setLoggedIn(true)
                navigate(`/profile/${res.data.user.username}`)
            } else {
                console.log(res.data.message)
            }
            Loading(false)
        }).catch(e => {
            console.log(`Edit Profile Error: ${e}`)
            Loading(false)
        })
    }

    function CloseNotification() {
        let temp = notification
        temp.active = false
        setNotification(temp)
    }

    function Notify(body, duration = 0, options = [], onClick = undefined) {
        setNotification({
            active: true,
            body,
            options,
            onClose: CloseNotification
        })

        if(duration > 0) {
            setTimeout(CloseNotification, duration)
        }
    }


    useLayoutEffect(() => {
        setDarkMode(cookies.display === 'dark' ? true : false)
        const username = cookies.username
        const authKey = cookies.authKey

        //console.log(`Username: ${username} Auth: ${authKey}`)

        if(username !== undefined && username !== '' && authKey !== undefined && authKey !== '')
        {
            LoginWithAuth(username, authKey)
        }
    }, [])
    
    return (
        <ApplicationContext.Provider value={{
            darkMode,
            isLoading,
            loggedIn,
            userData,
            notification,
            ToggleDarkMode,
            navigate,
            Loading,
            Login,
            Logout,
            Register,
            EditProfile,
            Notify,
            CloseNotification
        }}>
            {children}
        </ApplicationContext.Provider>
    )
}