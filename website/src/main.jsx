import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import { BrowserRouter } from 'react-router-dom'

import './styles/index.css'
import { ApplicationProvider } from './context/ApplicationContext'
import { CookiesProvider } from 'react-cookie'
import { SessionProvider } from './context/SessoionContext'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<CookiesProvider>
			<BrowserRouter>
				<ApplicationProvider>
					<SessionProvider>
						<App />
					</SessionProvider>
				</ApplicationProvider>
			</BrowserRouter>
		</CookiesProvider>
	</React.StrictMode>,
)
