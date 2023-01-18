import React, { useLayoutEffect, useState } from 'react';

import InputField from '../components/InputField';

var socket = null



export default function WebSocketTesting(props) {
    
    const [message, setMessage] = useState('')
    const [messageFeed, setMessageFeed] = useState([])

    function AppendMessage(msg) {
        const temp = messageFeed
        temp.push(msg)
        setMessageFeed(temp)
    }

    function SendMessageToServer() {
        if(message === '') return

        socket.emit('message', message)
        setMessage('')
    }

    

    return (
        <div className='page-container-centered'>
            <div className='vertical-top'>
                {messageFeed.map((msg, index) => <span key={index}>{msg}</span>)}
            </div>
            <InputField value={message} onChange={value => setMessage(value)} />
            <button onClick={SendMessageToServer}>Send</button>
        </div>
    );
}