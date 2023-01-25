import { useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './views/components/NavBar'
import LoginScreen from './views/screens/LoginScreen'
import RegistrationScreen from './views/screens/RegistrationScreen'

import { ApplicationContext } from './context/ApplicationContext'
import LoadingOverlay from './views/components/LoadingOverlay'
import HomeScreen from './views/screens/HomeScreen'
import ProfileScreen from './views/screens/ProfileScreen'
import SessionScreen from './views/screens/SessionScreen'
import FriendScreen from './views/screens/FriendScreen'
import Notification from './views/components/Notification'
import NoMatchScreen from './views/screens/404Screen'

import { SocketProvider } from './context/SocketContext'
import { SessionProvider } from './context/SessionContext'
import { FriendsProvider } from './context/FriendsContext'

import './styles/App.css'


function App() {
	const { darkMode, isLoading, loggedIn, userData } = useContext(ApplicationContext)

	return (
		<div id="App" className={darkMode ? 'App AppDark' : 'App'}>
			<div className='app-pages-container'>
				{isLoading ? <LoadingOverlay /> : ''}
				<NavBar />
					{userData !== undefined ? 
					<>
					<FriendsProvider>
					<SessionProvider>
					<SocketProvider>
						<Routes>
							<Route index path='/' exact element={<HomeScreen />} />
							<Route path='/profile/:user' exact element={<ProfileScreen />}/>
							<Route path='/friends' exact element={<FriendScreen />} />
							<Route path='/session' exact element={<SessionScreen />} />
							<Route path='*' element={<NoMatchScreen />} />
						</Routes>
					</SocketProvider>
					</SessionProvider>
					</FriendsProvider>
					</>
					:
					<>
					<Routes>
						<Route path="/login" element={<LoginScreen />} />
						<Route path="/register" element={<RegistrationScreen />} />
						<Route path='*' element={<Navigate to={'/login'} />} />
					</Routes>
					</>
					}
			</div>

			<Notification />
		</div>
	)
}

export default App
