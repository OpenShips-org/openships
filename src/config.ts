if (!localStorage.getItem('api_url')) {
  localStorage.setItem('api_url', 'http://192.168.0.137:5000');
}

const api_url = localStorage.getItem('api_url') || 'http://192.168.0.137:5000';

export { api_url };