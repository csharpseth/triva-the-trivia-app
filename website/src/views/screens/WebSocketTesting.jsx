import React, { useLayoutEffect, useState } from 'react';
import { io } from 'socket.io-client'  

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

    useLayoutEffect(() => {
        if(socket === null) {
            socket = io('http://localhost:4000')

            socket.on('connect', () => {
                AppendMessage(`Connect To Server Successfully with ID: ${socket.id}`)
            })
            socket.on('receive-message', (msg) => {
                const temp = messageFeed
                temp.push(msg)
                setMessageFeed([...temp])
            })
        }
    }, [])

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