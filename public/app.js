const tokenKey = 'vote_app_token';

const authStatus = document.getElementById('authStatus');
const logoutBtn = document.getElementById('logoutBtn');
const messages = document.getElementById('messages');
const profileBox = document.getElementById('profileBox');
const candidateList = document.getElementById('candidateList');
const voteCountList = document.getElementById('voteCountList');
const adminSection = document.getElementById('adminSection');
const usersDbView = document.getElementById('usersDbView');
const candidatesDbView = document.getElementById('candidatesDbView');

const passwordForm = document.getElementById('passwordForm');
const candidateCreateForm = document.getElementById('candidateCreateForm');
const candidateUpdateForm = document.getElementById('candidateUpdateForm');
const candidateDeleteForm = document.getElementById('candidateDeleteForm');

const refreshCandidatesBtn = document.getElementById('refreshCandidatesBtn');
const refreshVoteCountBtn = document.getElementById('refreshVoteCountBtn');
const refreshUsersBtn = document.getElementById('refreshUsersBtn');
const refreshDbCandidatesBtn = document.getElementById('refreshDbCandidatesBtn');

let currentUser = null;
let voteCountInterval = null;

function getToken() {
  return localStorage.getItem(tokenKey);
}

function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

function clearToken() {
  localStorage.removeItem(tokenKey);
}

function goToLogin() {
  window.location.href = '/';
}

function logMessage(message, isError = false) {
  const time = new Date().toLocaleTimeString();
  const prefix = isError ? 'ERROR' : 'INFO';
  messages.textContent = `[${time}] ${prefix}: ${message}\n` + messages.textContent;
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
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

function renderAuthStatus() {
  if (!currentUser) {
    authStatus.textContent = 'Not logged in';
    adminSection.style.display = 'none';
    if (usersDbView) usersDbView.textContent = 'Admin login required.';
    if (candidatesDbView) candidatesDbView.textContent = 'Admin login required.';
    return;
  }

  authStatus.textContent = `${currentUser.name} (${currentUser.role})`;
  adminSection.style.display = currentUser.role === 'admin' ? 'block' : 'none';

  if (currentUser.role !== 'admin') {
    if (usersDbView) usersDbView.textContent = 'Admin login required.';
    if (candidatesDbView) candidatesDbView.textContent = 'Admin login required.';
  }
}

async function loadAdminUsers() {
  if (!currentUser || currentUser.role !== 'admin') return;

  try {
    const users = await apiRequest('/user/admin/users');
    if (usersDbView) {
      usersDbView.textContent = JSON.stringify(users, null, 2);
    }
  } catch (error) {
    logMessage(error.message, true);
  }
}

async function loadAdminCandidateDetails() {
  if (!currentUser || currentUser.role !== 'admin') return;

  try {
    const candidates = await apiRequest('/candidate/admin/details');
    if (candidatesDbView) {
      candidatesDbView.textContent = JSON.stringify(candidates, null, 2);
    }
  } catch (error) {
    logMessage(error.message, true);
  }
}

function renderProfile() {
  if (!currentUser) {
    profileBox.innerHTML = 'Login to load your profile.';
    return;
  }

  profileBox.innerHTML = `
    <div><strong>Name:</strong> ${currentUser.name}</div>
    <div><strong>Role:</strong> ${currentUser.role}</div>
    <div><strong>Aadhar:</strong> ${currentUser.aadharCardNumber}</div>
    <div><strong>Email:</strong> ${currentUser.email || '-'}</div>
    <div><strong>Has Voted:</strong> ${currentUser.isVoted ? 'Yes' : 'No'}</div>
  `;
}

async function loadProfile() {
  if (!getToken()) {
    goToLogin();
    return;
  }

  try {
    const data = await apiRequest('/user/profile');
    currentUser = data.user;
    renderAuthStatus();
    renderProfile();
    if (currentUser.role === 'admin') {
      await Promise.all([loadAdminUsers(), loadAdminCandidateDetails()]);
    }
  } catch (error) {
    clearToken();
    goToLogin();
  }
}

async function loadCandidates() {
  try {
    const candidates = await apiRequest('/candidate');
    if (!Array.isArray(candidates) || candidates.length === 0) {
      candidateList.innerHTML = '<div>No candidates available.</div>';
      return;
    }

    candidateList.innerHTML = '';
    candidates.forEach((candidate) => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.innerHTML = `
        <div>
          <div><strong>${candidate.name}</strong> (${candidate.party})</div>
          <div>ID: ${candidate._id} | Age: ${candidate.age} | Votes: ${candidate.voteCount ?? 0}</div>
        </div>
      `;

      const voteButton = document.createElement('button');
      voteButton.type = 'button';
      voteButton.textContent = 'Vote';
      voteButton.addEventListener('click', async () => {
        try {
          await apiRequest(`/candidate/vote/${candidate._id}`);
          logMessage(`Vote submitted for ${candidate.name}`);
          await Promise.all([loadCandidates(), loadVoteCount(), loadProfile()]);
        } catch (error) {
          logMessage(error.message, true);
        }
      });

      row.appendChild(voteButton);
      candidateList.appendChild(row);
    });
  } catch (error) {
    logMessage(error.message, true);
  }
}

async function loadVoteCount() {
  try {
    const records = await apiRequest('/candidate/vote/count');
    if (!Array.isArray(records) || records.length === 0) {
      voteCountList.innerHTML = '<div>No vote data yet.</div>';
      return;
    }

    voteCountList.innerHTML = '';
    records.forEach((record) => {
      const row = document.createElement('div');
      row.className = 'list-item';
      row.textContent = `${record.party}: ${record.count}`;
      voteCountList.appendChild(row);
    });
  } catch (error) {
    logMessage(error.message, true);
  }
}

if (passwordForm) {
  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(passwordForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      await apiRequest('/user/profile/password', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      passwordForm.reset();
      logMessage('Password updated.');
    } catch (error) {
      logMessage(error.message, true);
    }
  });
}

if (candidateCreateForm) {
  candidateCreateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(candidateCreateForm);
    const payload = Object.fromEntries(formData.entries());
    payload.age = Number(payload.age);

    try {
      await apiRequest('/candidate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      candidateCreateForm.reset();
      logMessage('Candidate created.');
      await Promise.all([loadCandidates(), loadVoteCount()]);
    } catch (error) {
      logMessage(error.message, true);
    }
  });
}

if (candidateUpdateForm) {
  candidateUpdateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(candidateUpdateForm);
    const payload = Object.fromEntries(formData.entries());
    const candidateID = payload.candidateID;
    delete payload.candidateID;

    if (payload.age) {
      payload.age = Number(payload.age);
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') delete payload[key];
    });

    try {
      await apiRequest(`/candidate/${candidateID}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      candidateUpdateForm.reset();
      logMessage('Candidate updated.');
      await Promise.all([loadCandidates(), loadVoteCount()]);
    } catch (error) {
      logMessage(error.message, true);
    }
  });
}

if (candidateDeleteForm) {
  candidateDeleteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(candidateDeleteForm);
    const { candidateID } = Object.fromEntries(formData.entries());

    try {
      await apiRequest(`/candidate/${candidateID}`, {
        method: 'DELETE'
      });

      candidateDeleteForm.reset();
      logMessage('Candidate deleted.');
      await Promise.all([loadCandidates(), loadVoteCount()]);
    } catch (error) {
      logMessage(error.message, true);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    clearToken();
    currentUser = null;
    logMessage('Logged out.');
    goToLogin();
  });
}

if (refreshCandidatesBtn) refreshCandidatesBtn.addEventListener('click', loadCandidates);
if (refreshVoteCountBtn) refreshVoteCountBtn.addEventListener('click', loadVoteCount);
if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', loadAdminUsers);
if (refreshDbCandidatesBtn) refreshDbCandidatesBtn.addEventListener('click', loadAdminCandidateDetails);

async function init() {
  if (!getToken()) {
    goToLogin();
    return;
  }

  renderAuthStatus();
  await Promise.all([loadProfile(), loadCandidates(), loadVoteCount()]);

  if (voteCountInterval) {
    clearInterval(voteCountInterval);
  }

  voteCountInterval = setInterval(loadVoteCount, 10000);
}

init();
