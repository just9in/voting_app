const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
window.VOTE_API_BASE_URL = window.VOTE_API_BASE_URL || (isLocalHost ? 'http://localhost:3000' : '');
