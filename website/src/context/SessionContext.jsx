import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from "axios";

import { API_URL, SESSION_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const SessionContext = createContext()


export const SessionProvider = ({ children }) => {
    const navigate = useNavigate()
    const [activeSession, setActiveSession] = useState()
    const [activeSessionUsers, setActiveSessionUsers] = useState([])
    const [activeSessionHosted, setActiveSessionHosted] = useState(false)

    const [hostedSessions, setHostedSessions] = useState()
    const [connectedSessions, setConnectedSessions] = useState()

    const [topics, setTopics] = useState([])
    const [difficulties, setDifficulties] = useState([])
    const { userData, Loading } = useContext(ApplicationContext)

    function SetActiveSession(session, hosted) {
        console.log(`Set Active Session :: ${session}`)

        setActiveSession(session)
        setActiveSessionHosted(hosted)
        navigate('/session')
    }

    function GoToActiveSession() {
        navigate('/session')
    }

    function CreateSession(title, topic, difficulty) {
        Loading(true)
        axios.post(`${SESSION_URL}/create`, {
            userID: userData._id,
            authKey: userData.authKey,
            title,
            topic,
            difficulty
        }).then(res => {
            if(res.data.success === true) {
                setActiveSession(res.data.session)
                setActiveSessionHosted(true)
                GoToActiveSession()
                console.log('Successfully created a new game.')
            }
            Loading(false)
        }).catch(error => {
            console.log(`Create Session Error :: ${error}`)
            Loading(false)
        })
    }

    function JoinSession(sessionKey) {
        Loading(true)
        axios.post(`${SESSION_URL}/join`, {
            userID: userData._id,
            authKey: userData.authKey,
            sessionKey
        }).then(res => {
            if(res.data.success === true) {
                setActiveSession(res.data.session)
                setActiveSessionHosted(false)
                GoToActiveSession()
                console.log('Successfully joined game.')
            }
            Loading(false)
        }).catch(error => {
            console.log(`Join Session Error :: ${error}`)
            Loading(false)
        })
    }

    function DeleteSession(sessionID) {
        Loading(true)
        axios.post(`${SESSION_URL}/delete`, {
            userID: userData._id,
            authKey: userData.authKey,
            sessionID
        }).then(res => {
            if(res.data.success === true) {
                setActiveSession()
                setActiveSessionHosted(false)
                navigate('/')
                console.log(`${res.data.message}`)
            }
            Loading(false)
        }).catch(error => {
            console.log(`Create Session Error :: ${error}`)
            Loading(false)
        })
    }

    function VerifySession(sessionID, userID) {
        
    }

    function LeaveSession(sessionID) {
        Loading(true)
        axios.post(`${SESSION_URL}/leave`, {
            userID: userData._id,
            authKey: userData.authKey,
            sessionID
        }).then(res => {
            if(res.data.success === true) {
                console.log('Successfully left game.')
            }
            setActiveSession()
            setActiveSessionHosted(false)
            navigate('/')
            Loading(false)
        }).catch(error => {
            console.log(`Leave Session Error :: ${error}`)
            Loading(false)
        })
    }

    function InviteToSession(userToInviteID, sessionID, callback) {
        axios.post(`${SESSION_URL}/invite`, {
            userID: userData._id,
            authKey: userData.authKey,
            userToInviteID,
            sessionID
        }).then(res => {
            if(res.data.success === true) {
                console.log(res.data.message)
                callback ? callback() : ''
            }
        }).catch(error => {
            console.log(`Invite To Session Error :: ${error}`)
        })
    }

    function AcceptInvite(inviteID, callback) {
        Loading(true)
        axios.post(`${SESSION_URL}/invite/accept`, {
            userID: userData._id,
            authKey: userData.authKey,
            inviteID
        }).then(res => {
            if(res.data.success === true) {
                setActiveSession(res.data.session)
                setActiveSessionHosted(false)
                GoToActiveSession()
                console.log('Successfully joined game.')

                callback ? callback() : ''
            }
            Loading(false)
        }).catch(error => {
            console.log(`Invite Accept Error :: ${error}`)
            Loading(false)
        })
    }

    function RemoveInvite(inviteID, callback) {
        axios.post(`${SESSION_URL}/invite/remove`, { inviteID })
        .then(res => {
            if(res.data.success === true) {
                console.log(res.data.message)
                callback ? callback() : ''
            }
        })
        .catch(error => {
            console.log(`Invite Remove Error :: ${error}`)
        })
    }

    function GetUserSessions() {
        
    }

    function GetConnectedUsers(key) {
        console.log(key);

        axios.get(`${SESSION_URL}/get/users/${key}`)
        .then(res => {
            if(res.data.success === true) {
                setActiveSessionUsers(res.data.users)
                console.log(res.data)
            } else {
                setActiveSessionUsers([])
            }
        }).catch(err => {
            console.log(`Failed To Fetch User Sessions: ${err}`)
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

        GetConnectedUsers(activeSession ? activeSession.key : 'none')
    }, [activeSession, activeSessionHosted])

    return (
        <SessionContext.Provider value={{
            topics,
            difficulties,
            activeSession,
            activeSessionUsers,
            activeSessionHosted,
            hostedSessions,
            connectedSessions,
            GoToActiveSession,
            SetActiveSession,
            CreateSession,
            DeleteSession,
            JoinSession,
            VerifySession,
            LeaveSession,
            GetConnectedUsers,
            InviteToSession,
            AcceptInvite,
            RemoveInvite
        }}>
            {children}
        </SessionContext.Provider>
    )
}