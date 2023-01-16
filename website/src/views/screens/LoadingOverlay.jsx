import React, { useState, useContext } from 'react';
import InputField from '../components/InputField';

import '../../styles/Form.css'
import { Link } from 'react-router-dom';
import { ApplicationContext } from '../../context/ApplicationContext';
import BubbleLoading from '../components/BubbleLoading';

export default function LoadingOverlay(props) {

    return (
        <div className='loadingPage'>
            <BubbleLoading />
        </div>
    );
}