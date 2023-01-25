import React, { useState, useContext, useEffect } from 'react';

import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/ToggleButton.css'

export default function ToggleButton(props) {
    const [toggle, setToggle] = useState(false)

    const { darkMode } = useContext(ApplicationContext)

    const { className, id, onToggleOn, onToggleOff } = props

    function Toggle() {
        setToggle(!toggle)
        setToggle(toggle => {
            toggle ? onToggleOn() : onToggleOff()
            return toggle
        })
    }

    useEffect(() => {
        if(props.value !== toggle) {
            setToggle(props.value)
        }
    }, [])

    return (
        <div className={className} id={id} >
            <div className={darkMode ? 'toggleButton toggleButtonDark' : 'toggleButton'} onClick={Toggle}>
                <div className='toggleButtonIndicator' id={toggle ? 'toggleOn' : ''}></div>
            </div>
        </div>
    );
}