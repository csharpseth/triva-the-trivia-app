import React, { useContext, useState } from 'react';
import InputField from '../components/InputField';

import '../../styles/Form.css'
import { Link } from 'react-router-dom';
import { ApplicationContext } from '../../context/ApplicationContext';

export default function RegistrationScreen(props) {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [validFirstName, setValidFirstName] = useState(true)
    const [validLastName, setValidLastName] = useState(true)
    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(true)
    const [validConfirmPassword, setValidConfirmPassword] = useState(true)

    const { darkMode, Register } = useContext(ApplicationContext)

    function TryRegister() {
        if(validFirstName === false && validLastName === false && validUsername === false && validPassword === false && validConfirmPassword === false) return
        
        if(confirmPassword !== password) {
            setValidConfirmPassword(false)
            return
        }

        Register(firstName, lastName, username, password)
    }

    return (
        <div id='register' className='page-container-centered'>
            <div className='form' id={ darkMode ? 'formDark' : '' }>
                <h1>Register</h1>
                <InputField title={'First Name'}
                    value={firstName}
                    warningMessage={firstName !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a first name.'}
                    required={true}
                    onValidityChange={valid => setValidFirstName(valid)}
                    onChange={value => setFirstName(value)}
                    />
                <InputField title={'Last Name'}
                    value={lastName}
                    warningMessage={lastName !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a last name.'}
                    required={true}
                    onValidityChange={valid => setValidLastName(valid)}
                    onChange={value => setLastName(value)}
                    />
                <InputField title={'Username'}
                    value={username}
                    warningMessage={username !== '' ? 'Cannot contain special characters or exceed a length of 15.' : 'You must enter a username.'}
                    required={true}
                    onValidityChange={valid => setValidUsername(valid)}
                    onChange={value => setUsername(value)}
                    />
                <InputField title={'Password'}
                    value={password}
                    warningMessage={password !== '' ? 'Must be at least 8 characters long.' : 'You must enter a password.'}
                    required={true}
                    secure={true}
                    onValidityChange={valid => setValidPassword(valid)}
                    onChange={value => setPassword(value)}
                    />
                <InputField title={'Confirm Password'}
                    value={confirmPassword}
                    warningMessage={'Does not match password...'}
                    warn={!validConfirmPassword}
                    required={true}
                    secure={true}
                    onValidityChange={valid => setValidConfirmPassword(valid)}
                    onChange={value => setConfirmPassword(value)}
                    />
                
                <div className='horizontal-flex-center'>
                    <span>Already have an account?</span><Link to='/login'>Login.</Link>
                </div>

                <div className='horizontal-flex-center-spread'>
                    <button className='formButton' onClick={TryRegister}>Register</button>
                </div>
            </div>
        </div>
    );
}