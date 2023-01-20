import React, { useContext, useState } from 'react';
import InputField from '../components/InputField';

import '../../styles/Form.css'
import { Link } from 'react-router-dom';
import { ApplicationContext } from '../../context/ApplicationContext';
import { FormButton } from '../components/Button';
import { NO_SPEC_CHAR, NO_SPEC_CHAR_ALLOW_SPACE } from '../../config/REGEX';

export default function RegistrationScreen(props) {
    const [name, setName] = useState('')
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

        Register(name, username, password)
    }

    return (
        <div id='register' className='page-container-centered'>
            <div className='form' id={ darkMode ? 'formDark' : '' }>
                <h1>Register</h1>
                <InputField title={'Name'}
                    value={name}
                    warningMessage={name !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a name.'}
                    required={true}
                    maxLength={30}
                    regex={NO_SPEC_CHAR_ALLOW_SPACE}
                    tabIndex={0}
                    onValidityChange={valid => setValidFirstName(valid)}
                    onChange={value => setName(value)}
                    />
                <InputField title={'Username'}
                    value={username}
                    warningMessage={username !== '' ? 'Cannot contain special characters or exceed a length of 15.' : 'You must enter a username.'}
                    required={true}
                    maxLength={15}
                    regex={NO_SPEC_CHAR}
                    tabIndex={0}
                    onValidityChange={valid => setValidUsername(valid)}
                    onChange={value => setUsername(value)}
                    />
                <InputField title={'Password'}
                    value={password}
                    warningMessage={password !== '' ? 'Must be at least 8 characters long.' : 'You must enter a password.'}
                    required={true}
                    secure={true}
                    tabIndex={0}
                    onValidityChange={valid => setValidPassword(valid)}
                    onChange={value => setPassword(value)}
                    />
                <InputField title={'Confirm Password'}
                    value={confirmPassword}
                    warningMessage={'Does not match password...'}
                    warn={!validConfirmPassword}
                    required={true}
                    secure={true}
                    tabIndex={0}
                    onValidityChange={valid => setValidConfirmPassword(valid)}
                    onChange={value => setConfirmPassword(value)}
                    />
                
                <div className='horizontal-flex-center'>
                    <span>Already have an account?</span><Link to='/login'>Login.</Link>
                </div>

                <div className='horizontal-flex-center-spread'>
                    <FormButton value='Register' tabIndex={0} onPush={TryRegister} />
                </div>
            </div>
        </div>
    );
}