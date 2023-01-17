import React, { useContext, useState } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';
import InputField from '../components/InputField'
import InputButton from '../components/Button';

import '../../styles/Home.css'
import Divider from '../components/Divider';
import DropDownMenu from '../components/DropDownMenu';
import { SessionContext } from '../../context/SessionContext';

export default function HomeScreen(props) {

    const { userData, darkMode } = useContext(ApplicationContext)
    const { topics, CreateSession } = useContext(SessionContext)

    const [createFormActive, setCreateFormActive] = useState(false)
    const [joinFormActive, setJoinFormActive] = useState(false)

    const [createFormTitle, setCreateFormTitle] = useState('')
    const [createFormTopic, setCreateFormTopic] = useState('')

    function SubmitCreateSession() {
        if(createFormTitle === '' || createFormTopic === '') return

        CreateSession(createFormTitle, createFormTopic, userData.username)
    }

    return (
        <>
        <div className={createFormActive ? 'home-page-container slide-out-left' : ( joinFormActive ? 'home-page-container slide-out-right':'home-page-container' )} id='fadeIn'>
            <div className="section joinSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Join Game</h1>
                <div className='horizontal-flex-center-spread'>
                    <InputField />
                    <InputButton value='Join!' onPush={() => setJoinFormActive(true)} />
                </div>
            </div>
            <Divider />
            <div className="section createSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Create Game</h1>
                <InputButton value='Create!' onPush={() => setCreateFormActive(true)} />
                
            </div>
        </div>

        <div className={joinFormActive ? 'home-page-container' : 'home-page-container slide-out-left'}>
            <div className="section joinSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Join Game</h1>
                <div className='horizontal-flex-center-spread'>
                    <InputField />
                    <InputButton value='Join!' onPush={() => setJoinFormActive(false)} />
                </div>
            </div>
        </div>

        <div className={createFormActive ? 'home-page-container' : 'home-page-container slide-out-right'}>
            <div className="section createSection" id={darkMode ? 'sectionDark' : ''}>
                <h1>Create Game</h1>
                <InputField title='Title' value={createFormTitle} onChange={value => setCreateFormTitle(value)} />
                <DropDownMenu options={topics} value={createFormTopic} onChange={value => setCreateFormTopic(value)} />
                <InputButton value='Create!' onPush={SubmitCreateSession} />
            </div>
        </div>
        </>
    )
}