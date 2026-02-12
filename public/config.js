const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const defaultApiBaseUrl = isLocalHost ? 'http://localhost:3000' : 'https://votingappbackend-rose.vercel.app';
window.VOTE_API_BASE_URL = window.VOTE_API_BASE_URL || defaultApiBaseUrl;
