import axios from 'axios';
import React from 'react';
import { useState } from 'react';
import { API_URL } from '../../IGNORE/URLs';
import { InputButton } from '../components/Button';
import InputField from '../components/InputField';
import ProfileItem from '../components/ProfileItem';

import '../../styles/Friends.css'


export default function FriendScreen(props) {

    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])


    function OnQueryChange(value) {
        setSearchQuery(value)
        if(value !== '') {
            SearchFor(value)
        } else {
            setSearchResults([])
        }
    }

    function SearchFor(query) {
        axios.post(`${API_URL}/users/findall`, { query })
        .then(res => {
            setSearchResults(res.data)
        }).catch(e => {
            console.log(e)
        })
    }

    return (
        <div className='page-container-centered-top'>
            <div>
                <InputField placeholder='Search...' value={searchQuery} onChange={OnQueryChange} />
            </div>
            <div className="friendsList">
                {searchResults.map(profile => <ProfileItem key={profile._id} data={profile} />)}
            </div>
        </div>
    );
}