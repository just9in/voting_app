const tokenKey = 'vote_app_token';
const API_BASE_URL = (window.VOTE_API_BASE_URL || '').replace(/\/$/, '');

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authStatus = document.getElementById('authStatus');
const messages = document.getElementById('messages');

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function logMessage(message, isError = false) {
  const time = new Date().toLocaleTimeString();
  const prefix = isError ? 'ERROR' : 'INFO';
  messages.textContent = `[${time}] ${prefix}: ${message}\n` + messages.textContent;
}

async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : {};

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed: ${response.status}`);
  }

  return data;
}

async function tryAutoLogin() {
  const token = getToken();
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      window.location.href = 'main.html';
    }
  } catch (_) {
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const result = await apiRequest('/user/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    setToken(result.token);
    authStatus.textContent = 'Login successful. Redirecting...';
    loginForm.reset();
    window.location.href = 'main.html';
  } catch (error) {
    logMessage(error.message, true);
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const payload = Object.fromEntries(formData.entries());
  payload.age = Number(payload.age);

  try {
    const result = await apiRequest('/user/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (result.token) {
      setToken(result.token);
      authStatus.textContent = 'Signup successful. Redirecting...';
      signupForm.reset();
      window.location.href = 'main.html';
      return;
    }

    logMessage('Signup successful. Please login.');
  } catch (error) {
    logMessage(error.message, true);
  }
});

tryAutoLogin();
