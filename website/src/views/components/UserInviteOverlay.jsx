import React from 'react';
import ModalWindow from './ModalWindow';
import InputField from './InputField'
import { useContext } from 'react';
import { FriendsContext } from '../../context/FriendsContext';
import { useState } from 'react';
import ProfileItem from './ProfileItem';
import CloseButton from './CloseButton'

import { NO_SPEC_CHAR_ALLOW_SPACE } from '../../config/REGEX'

import '../../styles/UserInviteOverlay.css'

export default function UserInviteOverlay(props) {

    const { onClose } = props
    const { friends, SearchForFriends, LoadAllFriends } = useContext(FriendsContext)

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])

    function OnQueryChange(value) {
        setQuery(value)
        if(value !== '' && !NO_SPEC_CHAR_ALLOW_SPACE.test(value)) {
            let res = SearchForFriends(value)
            setResults(res)
        } else {
            setResults([])
        }
    }

    useContext(() => {
        LoadAllFriends()
    }, [])

    return (
        <ModalWindow>
            <CloseButton onClose={onClose} />
            <h1>Invite to Game</h1>
            <InputField value={query} onChange={OnQueryChange} />
            <div className="results">
                {query.length > 0 ?
                results.map((profile, index) => <ProfileItem data={profile} relationship='invite' />)
                :
                friends.map((profile, index) => <ProfileItem data={profile} relationship='invite' />)
                }
            </div>
        </ModalWindow>
    )
}