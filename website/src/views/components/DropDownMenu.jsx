import React, { useState, useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/DropDownMenu.css'

export default function DropDownMenu(props) {

    const { value, title, options, onChange } = props

    const { darkMode } = useContext(ApplicationContext)

    const [menuOpen, setMenuOpen] = useState(false)

    function SetSelection(index) {
        if(index >= 0 && index < options.length) {
            const newValue = options[index]
            onChange ? onChange(newValue, index) : ''
        }
        setMenuOpen(false)
    }

    return (
        <div className='dropDownMenuField' id={darkMode ? 'darkText' : ''}>
            <h3>{title}</h3>

            <div className={menuOpen ? 'dropDownMenu dropDownMenuOpen' : 'dropDownMenu'} id={darkMode ? 'darkField' : ''}>
                {options.map((opt, index) => <span key={index} className='selectionElement' id={darkMode ? 'darkField' : ''} onClick={() => SetSelection(index)}>{opt}</span>)}
            </div>
            
            <div className='selectionBody' onClick={() => setMenuOpen(!menuOpen)}>
            <span className='selectionText' id={darkMode ? 'darkModeText' : ''}>{value}</span>
            <span className="dropDownIcon">^</span>
            <div className='dropDownMenuFieldBackground' id={darkMode ? 'darkField' : ''}></div>
            </div>
        </div>
    );
}