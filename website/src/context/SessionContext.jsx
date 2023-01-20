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
    const [difficulties, setDifficulties] = useState([])
    const { userData, Loading } = useContext(ApplicationContext)

    function GoToActiveSession() {
        navigate('/session')
    }

    function CreateSession(title, topic, difficulty) {
        Loading(true)
        axios.post(`${API_URL}/session/create`, { userID: userData._id, title, topic, difficulty })
        .then(res => {
            if(res.data.success === true) {
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
        axios.post(`${API_URL}/session/join`, { userID: userData._id, key: sessionKey })
        .then(res => {
            if(res.data.success === true) {
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
        axios.post(`${API_URL}/session/delete`, { userID: userData._id, authKey: userData.authKey, sessionId: activeSession.id })
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
        axios.get(`${API_URL}/session/verify/${activeSession.id}/${userData._id}`)
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
        axios.post(`${API_URL}/session/leave`, { userID: userData._id, sessionId: activeSession.id })
        .then(res => {
            setActiveSession(undefined)
            navigate('/')
            Loading(false)
        }).catch(e => {
            console.log(`Session Delete Error: ${e}`)
            Loading(false)
        })
    }

    function InviteToSession(userToInviteID) {
        axios.post(`${API_URL}/session/invite`, {
            userID: userData._id,
            authKey: userData.authKey,
            sessionId: activeSession.id,
            userToInviteID
        })
        .then(res => {
            if(res.data.success) {
                console.log('Successfully Invited User')
            }
        }).catch(e => {
            console.log(`Session Invite Error: ${e}`)
        })
    }

    function AcceptSessionInvite(inviteID) {
        Loading(true)
        axios.post(`${API_URL}/session/invite/accept`, {
            userID: userData._id,
            authKey: userData.authKey,
            inviteID
        })
        .then(res => {
            if(res.data.success === true) {
                setActiveSession(res.data.session)
                setActiveSessionHosted(false)
                navigate('/session')
            } else {
                console.log('Failed To Accept Invite.')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Invitiation Accept Error: ${e}`)
            Loading(false)
        })
    }

    function RemoveSessionInvite(inviteID) {
        Loading(true)
        axios.post(`${API_URL}/session/invite/remove`, {
            userID: userData._id,
            authKey: userData.authKey,
            inviteID
        })
        .then(res => {
            if(res.data.success === true) {
                console.log('Successfully Removed Invite.')
            } else {
                console.log('Failed To Remove Invite.')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Invitiation Remove Error: ${e}`)
            Loading(false)
        })
    }

    useLayoutEffect(() => {
        axios.get(`${API_URL}/configdata`)
        .then(res => {
            setTopics(res.data.topics)
            setDifficulties(res.data.difficulties)
        }).catch(err => {
            console.log(`Failed To Fetch Topics: ${err}`)
        })
    }, [])

    return (
        <SessionContext.Provider value={{
            topics,
            difficulties,
            activeSession,
            activeSessionHosted,
            GoToActiveSession,
            CreateSession,
            DeleteActiveHostedSession,
            JoinSession,
            VerifyActiveSession,
            LeaveActiveSession,
            InviteToSession,
            AcceptSessionInvite,
            RemoveSessionInvite
        }}>
            {children}
        </SessionContext.Provider>
    )
}