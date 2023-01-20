import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from "axios";


import { API_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";
import { SocketContext } from "./SocketContext";

export const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
    const navigate = useNavigate()
    const [activeSession, setActiveSession] = useState()
    const [activeSessionHosted, setActiveSessionHosted] = useState(false)

    const [topics, setTopics] = useState([])
    const { userData, Loading } = useContext(ApplicationContext)
    const { EstablishSocketRoom } = useContext(SocketContext)

    function GoToActiveSession() {
        navigate('/session')
    }

    function CreateSession(title, topic, username) {
        Loading(true)
        axios.post(`${API_URL}/session/create`, { title, topic, username })
        .then(res => {
            if(res.data.success === true) {
                EstablishSocketRoom(res.data.session.key)
                setActiveSession(res.data.session)
                setActiveSessionHosted(true)
                navigate('/session')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Create Session Error: ${e}`)
            Loading(false)
        })
    }

    function JoinSession(sessionKey) {
        Loading(true)
        axios.post(`${API_URL}/session/join`, { username: userData.username, key: sessionKey })
        .then(res => {
            if(res.data.success === true) {
                EstablishSocketRoom(res.data.session.key)
                setActiveSession(res.data.session)
                setActiveSessionHosted(false)
                navigate('/session')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Create Session Error: ${e}`)
            Loading(false)
        })
    }

    function DeleteActiveHostedSession() {
        if(activeSessionHosted !== true) return
        Loading(true)
        axios.post(`${API_URL}/session/delete`, { username: userData.username, authKey: userData.authKey, sessionId: activeSession.id })
        .then(res => {
            if(res.data.success === true) {
                setActiveSession(undefined)
                setActiveSessionHosted(false)
                navigate('/')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Session Delete Error: ${e}`)
            Loading(false)
        })
    }

    function VerifyActiveSession() {
        Loading(true)
        axios.get(`${API_URL}/session/verify/${activeSession.id}`)
        .then(res => {
            if(res.data.success === true) {
                setActiveSession(res.data.session)
            }else {
                setActiveSession(undefined)
                navigate('/')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Session Delete Error: ${e}`)
            Loading(false)
        })
    }

    function LeaveActiveSession() {
        Loading(true)
        axios.post(`${API_URL}/session/leave`, { username: userData.username, sessionId: activeSession.id })
        .then(res => {
            setActiveSession(undefined)
            navigate('/')
            Loading(false)
        }).catch(e => {
            console.log(`Session Delete Error: ${e}`)
            Loading(false)
        })
    }

    useLayoutEffect(() => {
        axios.get(`${API_URL}/topics`)
        .then(res => {
            setTopics(res.data)
        }).catch(err => {
            console.log(`Failed To Fetch Topics: ${err}`)
        })
    }, [])

    return (
        <SessionContext.Provider value={{ topics, activeSession, activeSessionHosted, CreateSession, DeleteActiveHostedSession, GoToActiveSession, JoinSession, VerifyActiveSession, LeaveActiveSession }}>
            {children}
        </SessionContext.Provider>
    )
}