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
import { FriendsContext } from '../../context/FriendsContext';
import { SessionContext } from '../../context/SessionContext';

export default function ProfileScreen(props) {

    const { user } = useParams()
    const { darkMode, userData, EditProfile } = useContext(ApplicationContext)
    const { AcceptFriend, DeclineFriendRequest } = useContext(FriendsContext)
    const { hostedSessions, connectedSessions, SetActiveSession, AcceptSessionInvite, RemoveSessionInvite } = useContext(SessionContext)

    const [profileData, setProfileData] = useState()
    const [profileInteractionOpen, setProfileInteractionOpen] = useState(false)

    const [isLocalProfile, setIsLocalProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(false)

    const [notificationData, setNotificationData] = useState()

    function OnEditSubmit(firstName, lastName, username) {
        setEditProfile(false)
        if(isLocalProfile === false) return

        EditProfile(firstName, lastName, username)
    }

    function GetProfileData() {
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
    }

    function GetNotificationData() {
        axios.get(`${API_URL}/users/notifications/${userData._id}/${userData.authKey}`)
        .then(res => {
            if(res.data.success === false) {
                setNotificationData(undefined)
            } else {
                setNotificationData(res.data.data)
            }
        }).catch(e => {
            console.log(e)
        })
    }

    function DetermineNotificationConfig(item, index) {
        let body = 'empty notification'
        let key = index
        let options = []
        let onClear = undefined

        switch (item.type) {
            case ('friend'):
                let friendRequest = notificationData.friendRequests[item.index]
                key = friendRequest._id
                body = `Friend Request From: ${friendRequest.senderName}.`
                options = [
                    {
                        value: 'Accept',
                        style: 'positive',
                        action: () => AcceptFriend(friendRequest.sender, GetNotificationData)
                    },
                ]
                onClear = () => DeclineFriendRequest(friendRequest.sender, GetNotificationData)
                break;
            case ('invite'):
                let invite = notificationData.invites[item.index]
                key = invite._id
                body = `Game Invite From: ${invite.senderName}.`
                options = [
                    {
                        value: 'Accept',
                        style: 'positive',
                        action: () => AcceptSessionInvite(invite._id, GetNotificationData)
                    },
                ]
                onClear = () => RemoveSessionInvite(invite._id, GetNotificationData)
                break;
            default:
                break;
        }

        return { key, body, options, onClear }
    }

    useLayoutEffect(() => {
        GetProfileData()
        GetNotificationData()
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

            <div className='container' id={darkMode?'dark':''}>
                <h1>Notifications</h1>
                <Divider />
                {notificationData && notificationData.ledger.length > 0 ? notificationData.ledger.map((item, index) => {
                    let config = DetermineNotificationConfig(item, index)
                    return (
                        <NotificationItem key={config.key} body={config.body} options={config.options} onClear={config.onClear} />
                    )
                })
                :
                <div className="horizontal-flex-center-spread">
                    <p className="notificationBody">No Notifications Yet...</p>
                </div>
                }
            </div>
            
            <div className="container" id={darkMode?'dark':''}>
                
                <h1>Hosted</h1>
                <Divider />
                <div className='sessionScroll'>
                {hostedSessions && hostedSessions.length > 0 ?
                    hostedSessions.map((session, index) => {
                        return (
                            <div key={session.key} className="sessionItem" id={darkMode?'dark':''}>
                                <h1>{session.title}</h1>
                                <span>{session.topic}</span>
                                <span>{session.key}</span>
                                <FittedButton value='Join' onPush={() => SetActiveSession(session, true)} />
                            </div>
                        )
                    })
                :
                <div className="sessionItem" id={darkMode?'dark':''}>
                    <h1>None</h1>
                </div>
                }
                </div>
            </div>
            <div className="container" id={darkMode?'dark':''}>
                <h1>Joined</h1>
                <Divider />
                <div className='sessionScroll'>
                {connectedSessions && connectedSessions.length > 0 ?
                    connectedSessions.map((session, index) => {
                        return (
                            <div key={session.key} className="sessionItem">
                                <h1>{session.title}</h1>
                                <span>{session.topic}</span>
                                <span>{session.key}</span>
                                <FittedButton value='Join' onPush={() => SetActiveSession(session, false)} />
                            </div>
                        )
                    }
                )
                :
                <div className="sessionItem" id={darkMode?'dark':''}>
                    <h1>None</h1>
                </div>
                }
                </div>
            </div>

            </>
            }
        </div>
    );
}

function NotificationItem(props) {

    const { darkMode } = useContext(ApplicationContext)
    const { body, options, onClear } = props

    return (
        <div className="notificationItem">
            <CloseButton onClose={onClear} />
            <div className="notificationBackground" id={darkMode ? 'notificationBackgroundDark':''} />
            <p className='notificationBody'>{body}</p>
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