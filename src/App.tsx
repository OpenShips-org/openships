import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

import NavBar from './components/NavBar';
import Map from './components/Map';

function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<NavBar />
				<Routes>

					<Route path="/" element={<Map />}/>
					<Route path="/vessels" element={<div className='mt-30 text-center'>Vessels</div>}/>
					<Route path="/gallery" element={<div className='mt-30 text-center'>Vessel Gallery</div>}/>
					<Route path="/account" element={<div className='mt-30 text-center'>Account</div>}/>
					<Route path="/settings" element={<div className='mt-30 text-center'>Settings</div>}/>
					
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	);
}

export default App;