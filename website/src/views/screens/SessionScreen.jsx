import React, { useContext, useEffect } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';
import { SessionContext } from '../../context/SessionContext';
import {InputButton} from '../components/Button';

export default function SessionScreen(props) {

    const { darkMode } = useContext(ApplicationContext)
    const { activeSession, activeSessionHosted, DeleteActiveHostedSession, VerifyActiveSession, LeaveActiveSession } = useContext(SessionContext)

    function TryDeleteSession() {
        DeleteActiveHostedSession()
    }

    useEffect(() => {
        VerifyActiveSession()
    }, [])

    return (
        <div className='page-container-centered'>
            <h1>{activeSession.title}</h1>
            <h3>{activeSession.id}</h3>
            <h3>{activeSession.topic}</h3>
            <h2>{activeSession.key}</h2>
            <InputButton
                value='Invite'
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
                    onPush={TryDeleteSession}
                />
                </>
                :
                <>
                <InputButton
                    value='Leave'
                    styling='negative'
                    onPush={LeaveActiveSession}
                />
            </>
            }
        </div>
    );
}