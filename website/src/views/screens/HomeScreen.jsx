import React, { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/Home.css'

export default function HomeScreen(props) {

    const { userData, Logout } = useContext(ApplicationContext)

    return (
        <div className='page-container-centered'>
            <h1>Hello, {userData.username}</h1>
        </div>
    );
}