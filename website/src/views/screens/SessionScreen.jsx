import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';
import { SessionContext } from '../../context/SessionContext';
import {InputButton} from '../components/Button';
import UserInviteOverlay from '../components/UserInviteOverlay';

import '../../styles/Session.css'
import ProfileItem from '../components/ProfileItem';
import { API_URL } from '../../IGNORE/URLs';

export default function SessionScreen(props) {

    const { darkMode } = useContext(ApplicationContext)
    const {
        activeSession,
        activeSessionUsers,
        activeSessionHosted,
        DeleteSession,
        VerifySession,
        LeaveSession,
    } = useContext(SessionContext)

    const [ overlayActive, setOverlayActive ] = useState(false)

    useEffect(() => {
        VerifySession()
    }, [])

    return (
        <>
        {overlayActive ? <UserInviteOverlay onClose={() => setOverlayActive(false)} />:''}
        <div className='session'>
            <div className='sessionConfig'>
            <h1 className='noselect'>{activeSession.title}</h1>
            <h3 className='noselect'>{activeSession.topic}</h3>
            <h2>{activeSession.key}</h2>
            <InputButton
                value='Invite'
                onPush={() => setOverlayActive(true)}
            />
            {activeSessionHosted ?
            <>
                <InputButton
                    value='Start'
                    styling='positive'
                />
                <InputButton
                    value='Delete'
                    styling='negative'
                    onPush={() => DeleteSession(activeSession._id)}
                />
                </>
                :
                <>
                <InputButton
                    value='Leave'
                    styling='negative'
                    onPush={() => LeaveSession(activeSession._id)}
                />
            </>
            }
            </div>
            
            <div className="sessionConnectedUsers" id={darkMode ? 'dark' : ''}>
                {activeSessionUsers && activeSessionUsers.length > 0 ?
                    activeSessionUsers.map(user => {
                        return (
                            <>
                            <div key={user._id} className="sessionUser noselect" id={darkMode ? 'dark' : ''}>
                                <img className='sessionUserAvatar' src={`${API_URL}/avatar/${user.username}.png`}/>
                                <span className='sessionUserName'>{user.name}</span>
                            </div>
                            </>
                        )
                    })
                :''}
            </div>

        </div>
        </>
    );
}