import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import axios from "axios";


import { API_URL } from '../IGNORE/URLs'
import { ApplicationContext } from "./ApplicationContext";

export const SessionContext = createContext()

export const SessionProvider = ({ children }) => {

    const [topics, setTopics] = useState([])
    const { Loading } = useContext(ApplicationContext)

    function CreateSession(title, topic, username) {
        Loading(true)
        axios.post(`${API_URL}/session/create`, { title, topic, username })
        .then(res => {
            console.log(res.data)
            Loading(false)
        }).catch(e => {
            console.log(`Login Error: ${e}`)
            Loading(false)
        })
    }

    useLayoutEffect(() => {
        axios.get(`${API_URL}/topics`)
        .then(res => {
            setTopics(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    return (
        <SessionContext.Provider value={{ topics, CreateSession }}>
            {children}
        </SessionContext.Provider>
    )
}