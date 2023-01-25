import React, { useContext, useState } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';
import InputField from '../components/InputField'
import {InputButton} from '../components/Button';

import '../../styles/Home.css'
import DropDownMenu from '../components/DropDownMenu';
import { SessionContext } from '../../context/SessionContext';
import UserInviteOverlay from '../components/UserInviteOverlay';

export default function HomeScreen(props) {

    const { darkMode } = useContext(ApplicationContext)
    const { topics, difficulties, activeSession, CreateSession, JoinSession, GoToActiveSession } = useContext(SessionContext)

    const [createFormActive, setCreateFormActive] = useState(false)

    const [joinKey, setJoinKey] = useState('')

    const [createFormTitle, setCreateFormTitle] = useState('')
    const [createFormTopic, setCreateFormTopic] = useState(0)
    const [createFormDifficulty, setCreateFormDifficulty] = useState(0)

    function SubmitCreateSession() {
        if(createFormTitle === '') return

        CreateSession(createFormTitle, createFormTopic, createFormDifficulty)
    }

    function SubmitJoinSession() {
        if(joinKey.length !== 6) return

        JoinSession(joinKey)
    }

    return (
        <>
        <div className={createFormActive ? 'home-page-container fadeOut' : 'home-page-container fadeIn'}>
            <div className="section joinSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Join Game</h1>
                <div className='joinField'>
                    <InputField
                        value={joinKey}
                        placeholder='Session Key...'
                        onChange={value => setJoinKey(value)}
                    />
                    <div className="horizontal-flex-center">
                        <InputButton
                            value='Join!'
                            styling='positive'
                            onPush={SubmitJoinSession}
                        />
                        {activeSession ? <InputButton value='Active Session' onPush={GoToActiveSession} /> : ''}
                    </div>
                </div>
            </div>
            <div className="section createSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Create Game</h1>
                <InputButton
                    value='Create!'
                    onPush={() => setCreateFormActive(true)}
                />
            </div>
        </div>

        <div className={createFormActive ? 'home-page-container' : 'home-page-container slide-out-left'}>
            <div className="section createSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Create Game</h1>
                <InputField
                    title='Title'
                    value={createFormTitle}
                    onChange={value => setCreateFormTitle(value)}
                />
                <DropDownMenu
                    title='Topic'
                    options={topics}
                    value={topics[createFormTopic]}
                    onChange={(value, index) => setCreateFormTopic(index)}
                />
                <DropDownMenu
                    title='Difficulty'
                    options={difficulties}
                    value={difficulties[createFormDifficulty]}
                    onChange={(value, index) => setCreateFormDifficulty(index)}
                />
                
                <div className="horizontal-flex-center">
                    <InputButton
                        value='Back'
                        styling='negative'
                        onPush={() => setCreateFormActive(false)}
                    />
                    <InputButton
                        value='Create!'
                        styling='positive'
                        onPush={SubmitCreateSession}
                    />
                </div>
            </div>
        </div>
        </>
    )
}