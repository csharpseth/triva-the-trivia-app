import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import Logo from '../../assets/triva-logo.png'

import '../../styles/NavBar.css'
import ToggleButton from './ToggleButton';
import { ApplicationContext } from '../../context/ApplicationContext'
import { useEffect } from 'react';

function NavItem(props) {

    const { value, active, onClick } = props

    return (
        <div className="navItem" onClick={onClick}>
            <div className="navItemBackground" id={active ? 'active' : ''} />
            <span className="navItemText">{value}</span>
        </div>
    )
}

export default function NavBar(props) {
    const navigate = useNavigate()

    const [navMenuOpen, setNavMenuOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    const { darkMode, ToggleDarkMode, userData, Logout } = useContext(ApplicationContext)


    function Navigate(to, index) {
        navigate(to)
        setNavMenuOpen(false)
        setActiveIndex(index)
    }

    const tabs = [
        {
            display: 'Play',
            path: '/',
        },
        {
            display: 'Profile',
            path: userData ? `/profile/${userData.username}` : '/',
        },
        {
            display: 'Friends',
            path: '/friends',
        },
        {
            display: 'Logout',
            onClick: Logout,
        },
    ]
    
    useEffect(() => {
        setActiveIndex(0)
        setNavMenuOpen(false)
    }, [userData])

    return (
        <div className='brandBar' id={darkMode ? 'dark':''}>
            <img onClick={() => navigate('/')} id='logo' src={Logo} />

            {userData ?
            <>
                <div className={navMenuOpen ? 'nav open-menu':'nav'} id={darkMode ? 'darkModeNav' : ''}>

                    {tabs.map((tab, index) => <NavItem
                        key={index}
                        value={tab.display}
                        onClick={() => {
                            tab.path ? Navigate(tab.path, index) : ''
                            tab.onClick ? tab.onClick() : ''
                    }} active={activeIndex === index} />)}

                    <div className='darkModeToggleSwitch'>
                    <ToggleButton value={darkMode} onToggleOn={() => ToggleDarkMode(true)} onToggleOff={() => ToggleDarkMode(false)} />
                    <span id={darkMode ? 'darkModeText' : ''}>{darkMode ? 'Dark':'Light'}</span>
                    </div>
                </div>

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