import React, { useContext, useState } from 'react';

import InputField from './InputField'

import '../../styles/OverlayForm.css'
import { ApplicationContext } from '../../context/ApplicationContext';

export default function EditProfileOverlay(props) {
    const { darkMode } = useContext(ApplicationContext)

    const { profileData, onCancel, onSubmit } = props
    
    const [firstName, setFirstName] = useState(profileData.firstName)
    const [lastName, setLastName] = useState(profileData.lastName)
    const [username, setUsername] = useState(profileData.username)
    const [password, setPassword] = useState('')

    const [validFirstName, setValidFirstName] = useState(true)
    const [validLastName, setValidLastName] = useState(true)
    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(false)

    const inputRegex = /[^A-Za-z0-9]/

    function ApplyChanges() {
        if(validUsername === false || validFirstName === false || validLastName === false || validPassword === false) return

        onSubmit(firstName, lastName, username, password)
    }

    return (
        <div className='fullpage-blur'>
            <div className='overlayForm fadeIn' id={darkMode ? 'darkForm':''}>
                <div className="closeButton" onClick={onCancel}>
                    <div></div><div></div>
                </div>
                <InputField
                    title='First Name'
                    value={firstName}
                    required={true}
                    warningMessage={firstName !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a first name.'}
                    maxLength={30}
                    regex={inputRegex}
                    onChange={(value) => setFirstName(value)}
                    onValidityChange={valid => setValidFirstName(valid)}
                    />
                <InputField
                    title='Last Name'
                    warningMessage={lastName !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a last name.'}
                    maxLength={30}
                    regex={inputRegex}
                    value={lastName}
                    required={true}
                    onChange={(value) => setLastName(value)}
                    onValidityChange={valid => setValidLastName(valid)}
                    />
                <InputField
                    title='Username'
                    warningMessage={lastName !== '' ? 'Cannot contain special characters or exceed a length of 15.' : 'You must enter a username.'}
                    maxLength={15}
                    regex={inputRegex}
                    value={username}
                    required={true}
                    onChange={(value) => setUsername(value)}
                    onValidityChange={valid => setValidUsername(valid)}
                    />
                <InputField
                    title='Password'
                    warningMessage={'You must enter your password.'}
                    value={password}
                    required={true}
                    secure={true}
                    onChange={(value) => setPassword(value)}
                    onValidityChange={valid => setValidPassword(valid)}
                    />
                <div className="horizontal-flex-center-spread formButtons">
                    <div onClick={ApplyChanges}>Save</div>
                    <div onClick={onCancel}>Cancel</div>
                </div>
            </div>
        </div>
    );
}