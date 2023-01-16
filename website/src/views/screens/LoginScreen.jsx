import React, { useState, useContext } from 'react';
import InputField from '../components/InputField';

import '../../styles/Form.css'
import { Link } from 'react-router-dom';
import { ApplicationContext } from '../../context/ApplicationContext';

export default function LoginScreen(props) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(true)

    const { darkMode, Login } = useContext(ApplicationContext)

    const inputRegex = /[^A-Za-z0-9]/

    function HandleUsername(event) {
        const value = event.target.value
        setValidUsername(true)
        setUsername(value)
    }

    function HandlePassword(event) {
        setValidPassword(true)
        setPassword(event.target.value)
    }

    function TryLogin() {
        if(validUsername === false || validPassword === false) return

        Login(username, password)
    }

    return (
        <div id='register' className='page-container-centered'>
            <div className='form' id={ darkMode ? 'formDark' : '' }>
                <h1>Login</h1>
                <InputField
                    title='Username'
                    value={username}
                    required={true}
                    warningMessage={username !== '' ? 'Cannot contain special characters or exceed a length of 15.' : 'You must enter a username.'}
                    maxLength={30}
                    regex={inputRegex}
                    onChange={(value) => setUsername(value)}
                    onValidityChange={valid => setValidUsername(valid)}
                    />
                <InputField
                    title='Password'
                    value={password}
                    required={true}
                    secure={true}
                    warningMessage={'You must enter a password.'}
                    onChange={(value) => setPassword(value)}
                    onValidityChange={valid => setValidPassword(valid)}
                    />
                
                <div className='horizontal-container'>
                    <span>Don't have an account?</span><Link to='/register'>Register.</Link>
                </div>

                <div className='horizontal-flex-center-spread'>
                    <button className='formButton' onClick={TryLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}