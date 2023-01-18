import React, { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

import '../../styles/Form.css'

export default function ModalWindow({ children }) {

    const { darkMode } = useContext(ApplicationContext)

    return (
        <div className='fullpage-blur'>
            <div className='page-container-centered'>
                <div className='form' id={darkMode ? 'formDark':''}>
                    {children}
                </div>
            </div>
        </div>
    );
}