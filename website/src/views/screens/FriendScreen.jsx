import React, { useState, useContext, useLayoutEffect } from 'react';

import InputField from '../components/InputField';
import ProfileItem from '../components/ProfileItem';

import { ApplicationContext } from '../../context/ApplicationContext';
import { FriendsContext } from '../../context/FriendsContext';

import { NO_SPEC_CHAR_ALLOW_SPACE } from '../../config/REGEX';

import '../../styles/Friends.css'


export default function FriendScreen() {

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])

    const { darkMode } = useContext(ApplicationContext)
    const { receivedFriendRequests, sentFriendRequests, friends, LoadAllFriends, SearchForUsers } = useContext(FriendsContext)

    function OnQueryChange(value) {
        setSearchQuery(value)
        const regex = !NO_SPEC_CHAR_ALLOW_SPACE.test(value)

        if(value !== '' && regex) {
            SearchFor(value)
            return
        } else if(value !== '' && !regex) {
            setSearchResults([])
            return
        }

        setSearchResults([])
        LoadAllFriends(false)
    }
    
    function ReloadAllFriends() {
        LoadAllFriends(false)
        OnQueryChange(searchQuery)
    }

    function SearchFor(query) {
        SearchForUsers(query, (data) => {
            setSearchResults(data)
        })
    }

    useLayoutEffect(() => {
        LoadAllFriends()
    }, [])

    return (
        <div className='page-container-centered-top'>
            <div>
                <InputField placeholder='Search...' value={searchQuery} regex={NO_SPEC_CHAR_ALLOW_SPACE} warningMessage='Unable to search with special characters.' onChange={OnQueryChange} tabIndex={0} />
            </div>
            <div className="friendsList" id={darkMode ? 'darkModeText':''}>
                {searchResults.length > 0 && searchQuery.length > 0 ?
                    <>
                    <h3>Results:</h3>
                    {searchResults.map(profile =>
                        <ProfileItem
                            key={profile._id}
                            data={profile}
                            relationship={profile.relationship}
                            tabIndex={0}
                            onActionTaken={ReloadAllFriends}
                        />
                    )}
                    </>
                :
                <>

                    {receivedFriendRequests.length > 0 ?
                    <>
                    <h3>Requests:</h3>
                    {receivedFriendRequests.map((profile) =>
                        <ProfileItem
                            key={profile._id}
                            data={profile}
                            relationship='waiting'
                            tabIndex={0}
                            onActionTaken={ReloadAllFriends}
                        />
                    )}
                    </>
                    :''}

                    {friends.length > 0 ?
                    <>
                    <h3>Friends:</h3>
                    {friends.map((profile) =>
                        <ProfileItem
                            key={profile._id}
                            data={profile}
                            relationship='friend'
                            tabIndex={0}
                            onActionTaken={ReloadAllFriends}
                        />
                    )}
                    </>
                    :''}

                    {sentFriendRequests.length > 0 ?
                    <>
                    <h3>Pending:</h3>
                    {sentFriendRequests.map((profile) =>
                        <ProfileItem
                            key={profile._id}
                            data={profile}
                            relationship='pending'
                            tabIndex={0}
                            onActionTaken={ReloadAllFriends}
                        />
                    )}
                    </>
                    :''}

                </>
                }
            </div>
        </div>
    );
}