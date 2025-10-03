if (!localStorage.getItem('api_url')) {
	localStorage.setItem('api_url', 'https://api.openships.de');
}

if (localStorage.getItem('api_url') === 'http://192.168.0.137:5000') {
	localStorage.setItem('api_url', 'https://api.openships.de');
}

const api_url = localStorage.getItem('api_url') || 'https://api.openships.de';

export { api_url };