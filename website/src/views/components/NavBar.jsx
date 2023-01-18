import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import Logo from '../../assets/triva-logo.png'

import '../../styles/NavBar.css'
import ToggleButton from './ToggleButton';
import { ApplicationContext } from '../../context/ApplicationContext'

export default function NavBar(props) {
    const navigate = useNavigate()

    const [navMenuOpen, setNavMenuOpen] = useState(false)

    const { darkMode, ToggleDarkMode, loggedIn, userData, Logout } = useContext(ApplicationContext)

    function Navigate(to) {
        navigate(to)
        setNavMenuOpen(false)
    }

    return (
        <div className={darkMode ? 'brandBar brandBarDark' : 'brandBar'}>
            <img onClick={() => navigate('/')} id='logo' src={Logo} />

            {loggedIn ?
            <>
                <ul className={navMenuOpen ? 'nav open-menu':'nav'} id={darkMode ? 'darkModeNav' : ''}>
                <li onClick={() => Navigate('/')}>Play</li>
                <li onClick={() => Navigate(`/profile/${userData.username}`)}>Profile</li>
                <li onClick={() => Navigate('/friends')}>Friends</li>
                <li onClick={Logout}>Logout</li>
                
                <div className='darkModeToggleSwitch'>
                <ToggleButton value={darkMode} onToggleOn={() => ToggleDarkMode(true)} onToggleOff={() => ToggleDarkMode(false)} />
                <span id={darkMode ? 'darkModeText' : ''}>{darkMode ? 'Dark':'Light'}</span>
                </div>
            </ul>

            <div className={navMenuOpen ? 'hamburger-menu-button open-menu-button':'hamburger-menu-button'}
                onClick={() => setNavMenuOpen(!navMenuOpen)}>
                <div></div> <div></div> <div></div>
            </div>
            </>
            :
            ''
            }

            
        </div>
    );
}