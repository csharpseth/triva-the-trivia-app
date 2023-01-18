import React, { useState } from 'react';

import '../../styles/DropDownMenu.css'

export default function DropDownMenu(props) {

    const { value, title, options, onChange } = props

    const [menuOpen, setMenuOpen] = useState(false)

    function SetSelection(index) {
        if(index >= 0 && index < options.length) {
            const newValue = options[index]
            onChange ? onChange(newValue) : ''
        }
        setMenuOpen(false)
    }

    return (
        <div className='dropDownMenuField'>
            <h3>{title}</h3>

            <div className="dropDownMenu" id={menuOpen?'dropDownMenuOpen':''}>
                {options.map((opt, index) => <span key={index} className='selectionElement' onClick={() => SetSelection(index)}>{opt}</span>)}
            </div>
            
            <div className='selectionBody' onClick={() => setMenuOpen(!menuOpen)}>
            <span className='selectionText'>{value}</span>
            <span className="dropDownIcon">^</span>
            <div className='dropDownMenuFieldBackground'></div>
            </div>
        </div>
    );
}