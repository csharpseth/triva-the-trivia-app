import React, { useContext, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios'
import { ApplicationContext } from '../../context/ApplicationContext';
import { API_URL } from '../../IGNORE/URLs';

import '../../styles/Profile.css'
import EditProfileOverlay from '../components/EditProfileOverlay';
import Divider from '../components/Divider'
import CloseButton from '../components/CloseButton';
import { FittedButton } from '../components/Button';

export default function ProfileScreen(props) {

    const { user } = useParams()
    const { darkMode, userData, EditProfile } = useContext(ApplicationContext)

    const [profileData, setProfileData] = useState()
    const [profileInteractionOpen, setProfileInteractionOpen] = useState(false)

    const [isLocalProfile, setIsLocalProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(false)

    function OnEditSubmit(firstName, lastName, username) {
        setEditProfile(false)
        if(isLocalProfile === false) return

        EditProfile(firstName, lastName, username)
    }

    useLayoutEffect(() => {
        axios.get(`${API_URL}/users/${user}`)
        .then(res => {
            if(res.data.success === false) {
                setProfileData(undefined)
            } else {
                setProfileData(res.data.user)
                if(user === userData.username)
                {
                    setIsLocalProfile(true)
                }
            }
            
        }).catch(e => {
            console.log(e)
        })
    }, [user, userData])

    return (
        <div className='page-container-centered-top'>
            {profileData === undefined ?
            <h1>No User Found!</h1>
            :
            <>
            {editProfile ? <EditProfileOverlay profileData={profileData} onSubmit={OnEditSubmit} onCancel={() => setEditProfile(false)} /> : ''}
            <div className='profileHeading' id={darkMode ? 'profileHeadingDark' : ''}>
                <div className='profileAvatar' id={darkMode ? 'profileDataDark' : ''}>
                    <img src={`${API_URL}/avatar/${profileData.username}.png`} />
                </div>
                
                <div className='profileData' id={darkMode ? 'profileDataDark' : ''}>
                    <div className="profileDataHeader">
                        <h1 className='profileName'>{profileData.name}</h1>
                        {isLocalProfile ?
                        <div className="editProfileButton" id={darkMode ? 'profileHeadingDark' : ''} onClick={() => setEditProfile(true)}>Edit</div>
                        :
                        <>
                        <span className='profileInteractionButton' onClick={() => setProfileInteractionOpen(!profileInteractionOpen)}>{profileInteractionOpen?'-':'+'}</span>
                        <div className={profileInteractionOpen ? 'profileInteraction profileInteractionExpanded':'profileInteraction'}>
                        
                        <div>Follow</div>
                        <div>Invite</div>
                        </div>
                        </>
                        }
                    </div>
                    
                    <div className="horizontal-flex-center">
                        <h2 className='profileGeneralStat'>Friends: {profileData.friends.length}</h2>
                        <h2 className='profileGeneralStat'>Score: {profileData.score}</h2>
                    </div>
                    <h2 className='profileUsername' id={darkMode ? 'profileUsernameDark' : ''}>{profileData.username}</h2>
                    <h3 className='profileMinorStat'>Member Since: {profileData.createdAt}</h3>
                    
                </div>
            </div>

            <div className='notificationContainer' id={darkMode?'dark':''}>
                <h1>Notifications</h1>
                <Divider />
                <NotificationItem options={[
                    {
                        value: 'Test',
                        style: 'positive',
                        action: () => { console.log('trst') }
                    }
                ]} />
                <NotificationItem />
                <NotificationItem />
                <NotificationItem />
                <NotificationItem />
            </div>
            </>
            }
        </div>
    );
}

function NotificationItem(props) {

    const { options } = props

    return (
        <div className="notificationItem">
            <CloseButton />
            <div className="notificationBackground" />
            <p className='notificationBody'>hello world</p>
            <div className='notificationOptions'>
                {options ? options.map((opt, index) => {
                    return <FittedButton
                        key={index}
                        value={opt.value}
                        styling={opt.style}
                        onPush={() => opt.action(index)}
                    />
                }):''}
            </div>
        </div>
    )
}