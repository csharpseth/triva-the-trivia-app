import React, { useContext, useState } from 'react';

import InputField from './InputField'

import { ApplicationContext } from '../../context/ApplicationContext';

import { FormButton } from '../components/Button'
import ModalWindow from './ModalWindow';
import { NO_SPEC_CHAR, NO_SPEC_CHAR_ALLOW_SPACE } from '../../config/REGEX';
import CloseButton from './CloseButton';

export default function EditProfileOverlay(props) {
    const { darkMode } = useContext(ApplicationContext)

    const { profileData, onCancel, onSubmit } = props
    
    const [name, setName] = useState(profileData.name)
    const [username, setUsername] = useState(profileData.username)
    const [password, setPassword] = useState('')

    const [validName, setValidName] = useState(true)
    const [validUsername, setValidUsername] = useState(true)
    const [validPassword, setValidPassword] = useState(false)

    function ApplyChanges() {
        if(validUsername === false || validName === false || validPassword === false) return

        onSubmit(name, username, password)
    }

    return (
        <ModalWindow>
            <h1>Edit Profile</h1>

            <CloseButton onClose={onCancel} />
            <InputField
                title='Name'
                value={name}
                required={true}
                warningMessage={name !== '' ? 'Cannot contain special characters or exceed a length of 30.' : 'You must enter a first name.'}
                maxLength={30}
                regex={NO_SPEC_CHAR_ALLOW_SPACE}
                onChange={(value) => setName(value)}
                onValidityChange={valid => setValidName(valid)}
                />
            <InputField
                title='Username'
                warningMessage={username !== '' ? 'Cannot contain special characters or exceed a length of 15.' : 'You must enter a username.'}
                maxLength={15}
                regex={NO_SPEC_CHAR}
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
                <FormButton value='Save' styling='positive' onPush={ApplyChanges} />
                <FormButton value='Cancel' styling='negative' onPush={onCancel} />
            </div>
        </ModalWindow>
    );
}