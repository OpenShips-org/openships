import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

import NavBar from './components/NavBar';

import Map from './components/map/Map';
import AccountPage from './components/account/AccountPage';
import SettingsPage from './components/account/SettingsPage';

function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<BrowserRouter>
					<NavBar />
					<Routes>

						<Route path="/" element={<Map />}/>
						<Route path="/vessels" element={<div className='mt-30 text-center'>Vessels</div>}/>
						<Route path="/gallery" element={<div className='mt-30 text-center'>Vessel Gallery</div>}/>
						<Route path="/account" element={<AccountPage />}/>
						<Route path="/settings" element={<SettingsPage />}/>
                        
					</Routes>
				</BrowserRouter>
			</AuthProvider>
		</ThemeProvider>
	);
}

export default App;