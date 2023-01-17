import { useContext, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './styles/App.css'
import NavBar from './views/components/NavBar'
import LoginScreen from './views/screens/LoginScreen'
import RegistrationScreen from './views/screens/RegistrationScreen'

import { ApplicationContext } from './context/ApplicationContext'
import LoadingOverlay from './views/screens/LoadingOverlay'
import HomeScreen from './views/screens/HomeScreen'
import ProfileScreen from './views/screens/ProfileScreen'
import NoMatchScreen from './views/screens/404Screen'
import WebSocketTesting from './views/screens/WebSocketTesting'

function App() {
	const { darkMode, isLoading, loggedIn, userData } = useContext(ApplicationContext)

	return (
		<div id="App" className={darkMode ? 'App AppDark' : 'App'}>
			<div className='app-pages-container'>
				{isLoading ? <LoadingOverlay /> : ''}
				<NavBar />
					<Routes>
						{userData !== undefined ? 
						<>
						<Route index path={'/'} exact element={<HomeScreen />} />
						<Route path={'/profile/:user'} exact element={<ProfileScreen />}/>
						</>
						:
						<>
						<Route path='/' element={<WebSocketTesting />} />
						<Route path="/login" element={<LoginScreen />} />
						<Route path="/register" element={<RegistrationScreen />} />
						</>
						}
						<Route path='*' element={<NoMatchScreen />} />
					</Routes>
			</div>
		</div>
	)
}

export default App
