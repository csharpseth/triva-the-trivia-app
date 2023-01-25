import React from 'react';
import { useContext } from 'react';
import { ApplicationContext } from '../../context/ApplicationContext';
import { FriendsContext } from '../../context/FriendsContext';
import { SessionContext } from '../../context/SessionContext';

import { API_URL } from '../../IGNORE/URLs';
import { InputButton } from './Button';

export default function ProfileItem(props) {

    const { data, relationship, tabIndex, onActionTaken } = props
    
    const { darkMode } = useContext(ApplicationContext)
    const { activeSession, InviteToSession } = useContext(SessionContext)
    const {
        FriendRequest,
        AcceptFriend,
        DeclineFriendRequest,
        CancelFriendRequest,
        RemoveFriend
    } = useContext(FriendsContext)

    
    return (
        <div className='profileItem' id={darkMode?'dark':''} tabIndex={tabIndex}>
            <img className='profileAvatar' src={`${API_URL}/avatar/${data.username}.png`} />
            <div className="profileData">
                <h1 className='profileName'>{data.name}</h1>
                <h2 className='profileUsername' id={darkMode ? 'profileUsernameDark' : ''}>{data.username}</h2>
                <div className='horizontal-flex-left-spread'>
                    <h3 className='profileStat'>Score: {data.score}</h3>
                </div>
            </div>
            <div className='vertical-center'>
                {relationship !== 'friend' && relationship !== 'invite' ?
                <InputButton
                    value={relationship === 'pending' ? 'Pending' : (relationship === 'waiting' ? 'Accept' : 'Add Friend')}
                    styling={relationship === 'pending' ? 'disabled' : (relationship === 'waiting' ? 'positive' : 'neutral')}
                    onPush={() => {
                        switch (relationship) {
                            case ('pending'):
                                break;
                            case ('waiting'):
                                AcceptFriend(data._id, onActionTaken)
                                break;
                            default:
                                FriendRequest(data._id, onActionTaken)
                                break;
                    }
                }} />
                :
                (relationship === 'invite' ?
                <InputButton
                    value='Invite'
                    styling='neutral'
                    onPush={() => InviteToSession(data._id, activeSession._id, onActionTaken)}
                />
                :
                <InputButton
                    value='Remove Friend'
                    styling='negative'
                    onPush={() => RemoveFriend(data._id, onActionTaken)}
                />)
                }

                {relationship === 'pending' ?
                <InputButton
                    value='Cancel'
                    styling='negative'
                    onPush={() => CancelFriendRequest(data._id, onActionTaken)}
                />
                :''}

                {relationship === 'waiting' ? 
                <InputButton
                    value='Decline'
                    styling='negative'
                    onPush={() => DeclineFriendRequest(data._id, onActionTaken) }
                />
                :''}
            </div>
        </div>
    );
}