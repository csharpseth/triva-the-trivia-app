import React, { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

export default function Divider(props) {

    const { darkMode } = useContext(ApplicationContext)

    return <span className='divider' id={darkMode ? 'dividerDark':''} />
}