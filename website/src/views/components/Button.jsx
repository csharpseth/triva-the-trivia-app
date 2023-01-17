import React from 'react';

import '../../styles/Button.css'

export default function InputButton(props) {

    const { value, onPush } = props

    return (
        <div className='inputButton' onClick={onPush}>
            <span className='buttonText noselect'>{value}</span>
            <div className='buttonBackground'></div>
        </div>
    );
}