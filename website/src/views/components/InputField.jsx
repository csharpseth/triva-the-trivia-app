import React, { useState, useContext } from 'react';

import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/InputField.css'

export default function InputField(props) {
    
    const { title, value, placeholder, warningMessage, warn, secure, regex, maxLength, required, tabIndex, onChange, onValidityChange } = props

    const { darkMode } = useContext(ApplicationContext)
    const [show, setShow] = useState(!secure)

    const [internalWarn, setInternalWarn] = useState(false)

    function MarkValidity(valid) {
        setInternalWarn(!valid)
        if(onValidityChange !== undefined){
            onValidityChange(valid)
        }
    }

    function HandleValueChange(e) {
        const v = e.target.value
        MarkValidity(true)

        if(regex !== undefined && regex !== '') {
            if(regex.test(v))
            {
                MarkValidity(false)
            }
        }

        if(maxLength !== undefined && maxLength > 0) {
            if(v.length > maxLength) {
                MarkValidity(false)
            }
        }

        if(required === true) {
            if(v === '') {
                MarkValidity(false)
            }
        }

        if(onChange !== undefined) {
            onChange(v)
        }
    }


    return (
        <div className='inputField' id={darkMode ? 'inputFieldDark' : ''}>
            <h3>{title}</h3>
            <div className={warn || internalWarn ? 'field invalidField':'field'} id={darkMode ? 'fieldDark' : ''}>
            <input
                className='input'
                id={darkMode ? 'inputDark':''}
                tabIndex={tabIndex}
                placeholder={placeholder}
                onChange={HandleValueChange}
                value={value}
                type={secure && show === false ? 'password' : 'text'}
            />
            {secure ?
            <button className='revealButton' id={darkMode ? 'revealButtonDark' : ''} tabIndex={-1} onClick={() => { setShow(!show); }}>
                {show ?
                    'hide'
                    :
                    'show'
                }
            </button>
            : ''}
            </div>
            <span className={warn || internalWarn?'warning':'warning invisibleText'}>- {warningMessage}</span>
        </div>
    );
}