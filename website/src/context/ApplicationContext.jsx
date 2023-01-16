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
    
    function Loading(active) {
        if(active) {
            setIsLoading(true)
        }else{
            setTimeout(() => setIsLoading(false), 500)
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
        axios.post(`${API_URL}/users/logout`, userData)
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

    function Register(firstName, lastName, username, password) {
        Loading(true)
        axios.post(`${API_URL}/users/register`, { firstName, lastName, username, password })
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

    function EditProfile(firstName, lastName, username, password) {
        Loading(true)
        axios.post(`${API_URL}/users/${userData.username}/edit`, { firstName, lastName, username, oldUser: userData.username, password })
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
            console.log(`Login Error: ${e}`)
            Loading(false)
        })
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
        <ApplicationContext.Provider value={{ darkMode, isLoading, loggedIn, userData, ToggleDarkMode, Loading, Login, Logout, Register, EditProfile }}>
            {children}
        </ApplicationContext.Provider>
    )
}