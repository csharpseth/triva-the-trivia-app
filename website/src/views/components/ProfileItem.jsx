import React from 'react';
import { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';

import { API_URL } from '../../IGNORE/URLs';
import { InputButton } from './Button';

export default function ProfileItem(props) {

    const { data } = props
    const { darkMode } = useContext(ApplicationContext)

    return (
        <div className='profileItem'>
            <img className='profileAvatar' src={`${API_URL}/avatar/${data.username}.png`} />
            <div className="profileData">
                <h1 className='profileName'>{data.name}</h1>
                <h2 className='profileUsername' id={darkMode ? 'profileUsernameDark' : ''}>{data.username}</h2>
                <div className='horizontal-flex-left-spread'>
                    <h3 className='profileStat'>Score: {data.score}</h3>
                    <h3 className='profileStat'>Friends: {data.friends.length}</h3>
                </div>
            </div>
            <InputButton value='Add Friend' />
        </div>
    );
}