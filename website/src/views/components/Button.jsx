import React from 'react';

import '../../styles/Button.css'

function GetStylingConfig(styling) {
    if(!styling) return 'buttonBackground'

    switch(styling.toLowerCase()) {
        case('neutral'):
            return 'buttonBackground'
        case('positive'):
            return 'buttonBackground buttonPositive'
        case('negative'):
            return 'buttonBackground buttonNegative'
        default:
            return 'buttonBackground'
    }
}

function InputButton(props) {

    const { value, styling, onPush } = props

    return (
        <div className='button inputButton' onClick={onPush}>
            <span className='buttonText noselect'>{value}</span>
            <div className={GetStylingConfig(styling)}></div>
        </div>
    );
}

function FormButton(props) {

    const { value, styling, onPush } = props

    return (
        <div className='button formButton' onClick={onPush}>
            <span className='buttonText noselect'>{value}</span>
            <div className={GetStylingConfig(styling)}></div>
        </div>
    );
}

function FittedButton(props) {

    const { value, styling, onPush } = props

    return (
        <div className='button fittedButton' onClick={onPush}>
            <span className='buttonText noselect'>{value}</span>
            <div className={GetStylingConfig(styling)}></div>
        </div>
    );
}

export {
    InputButton,
    FormButton,
    FittedButton
}