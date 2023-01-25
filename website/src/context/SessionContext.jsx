import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from "axios";


import { API_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
    const navigate = useNavigate()
    const [activeSession, setOggaBooga] = useState()
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

    function setActiveSession(session) {
        console.log(`Setting Session...`);
        console.log(`Setting Session :: ${session}`);
        setOggaBooga(session)
    }

    function GoToActiveSession() {
        navigate('/session')
    }

    function CreateSession(title, topic, difficulty) {
        Loading(true)
        axios.post(`${API_URL}/session/create`, { userID: userData._id, title, topic, difficulty })
        .then(res => {
            if(res.data.success === true) {
                console.log('Created Session');
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
                console.log('Joined Session');
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
                console.log('Delete Session');
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
                console.log('verify Session');
                setActiveSession(res.data.session)
            }else {
                console.log('verify Session failed');
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
            console.log('Leave Session');
            setActiveSession(undefined)
            navigate('/')
            Loading(false)
        }).catch(e => {
            console.log(`Session Delete Error: ${e}`)
            Loading(false)
        })
    }

    function InviteToSession(userToInviteID, callback) {
        if(!activeSession) {
            console.log('No active session to invite to.')
            return
        }
        Loading(true)
        axios.post(`${API_URL}/session/invite`, {
            userID: userData._id,
            authKey: userData.authKey,
            sessionId: activeSession.id,
            userToInviteID
        })
        .then(res => {
            if(res.data.success) {
                console.log('Successfully Invited User')
                callback ? callback() : ''
            }
            Loading(false)
        }).catch(e => {
            console.log(`Session Invite Error: ${e}`)
            Loading(false)
        })
    }

    function AcceptSessionInvite(inviteID, callback) {
        Loading(true)
        axios.post(`${API_URL}/session/invite/accept`, {
            userID: userData._id,
            authKey: userData.authKey,
            inviteID
        })
        .then(res => {
            if(res.data.success === true) {
                console.log('Accept Session Invite');
                setActiveSession(res.data.session)
                setActiveSessionHosted(false)
                navigate('/session')
                callback ? callback() : ''
            } else {
                console.log('Failed To Accept Invite.')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Invitiation Accept Error: ${e}`)
            Loading(false)
        })
    }

    function RemoveSessionInvite(inviteID, callback) {
        Loading(true)
        axios.post(`${API_URL}/session/invite/remove`, {
            userID: userData._id,
            authKey: userData.authKey,
            inviteID
        })
        .then(res => {
            if(res.data.success === true) {
                console.log('Successfully Removed Invite.')
                callback ? callback() : ''
            } else {
                console.log('Failed To Remove Invite.')
            }
            Loading(false)
        }).catch(e => {
            console.log(`Invitiation Remove Error: ${e}`)
            Loading(false)
        })
    }

    function GetUserSessions() {
        axios.get(`${API_URL}/session/${userData._id}/${userData.authKey}`)
        .then(res => {
            if(res.data.success === true) {
                setHostedSessions(res.data.hostedSessions)
                setConnectedSessions(res.data.connectedSessions)
            }
        }).catch(err => {
            console.log(`Failed To Fetch User Sessions: ${err}`)
        })
    }

    function GetConnectedUsers() {
        console.log(`Active Session Get Users: ${activeSession.id}`);
        axios.get(`${API_URL}/session/users/${activeSession.id}`)
        .then(res => {
            console.log(res.data);
            if(res.data.success === true) {
                setActiveSessionUsers(res.data.users)

            }
        }).catch(err => {
            console.log(`Failed To Fetch User Sessions: ${err}`)
        })
    }

    useLayoutEffect(() => {
        GetUserSessions()
        if(activeSession) {
            GetConnectedUsers()
        }
        axios.get(`${API_URL}/configdata`)
        .then(res => {
            setTopics(res.data.topics)
            setDifficulties(res.data.difficulties)
        }).catch(err => {
            console.log(`Failed To Fetch Topics: ${err}`)
        })
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
            DeleteActiveHostedSession,
            JoinSession,
            VerifyActiveSession,
            LeaveActiveSession,
            GetConnectedUsers,
            InviteToSession,
            AcceptSessionInvite,
            RemoveSessionInvite
        }}>
            {children}
        </SessionContext.Provider>
    )
}