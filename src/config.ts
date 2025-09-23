if (!localStorage.getItem('api_url')) {
  localStorage.setItem('api_url', 'http://192.168.0.137:5000');
}

const api_url = localStorage.getItem('api_url') || 'http://192.168.0.137:5000';

const appwrite_url = 'http://192.168.0.176:8081';

export { api_url, appwrite_url };