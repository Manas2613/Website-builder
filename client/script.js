const API_BASE = `${window.location.origin}/api`;

const state = {
  token: localStorage.getItem('sidequest_token') || null,
  profile: null,
  quests: [],
  filters: {
    category: 'All',
    difficulty: 'All',
    q: '',
  },
};

const authView = document.getElementById('authView');
const dashboardView = document.getElementById('dashboardView');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const questList = document.getElementById('questList');

function levelFromXp(xp) {
  return Math.floor(xp / 100) + 1;
}

function xpProgress(xp) {
  return xp % 100;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${state.token}`,
  };
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload;
}

function showAuth(message = '', isError = false) {
  authView.classList.remove('hidden');
  dashboardView.classList.add('hidden');
  logoutBtn.classList.add('hidden');
  authMessage.textContent = message;
  authMessage.style.color = isError ? 'var(--danger)' : 'var(--muted)';
}

function showDashboard() {
  authView.classList.add('hidden');
  dashboardView.classList.remove('hidden');
  logoutBtn.classList.remove('hidden');
}

function updateStats() {
  const { profile } = state;
  if (!profile) return;

  const level = levelFromXp(profile.xp);
  const progress = xpProgress(profile.xp);

  document.getElementById('usernameText').textContent = profile.username;
  document.getElementById('xpText').textContent = profile.xp;
  document.getElementById('levelText').textContent = level;
  document.getElementById('streakText').textContent = `${profile.streak} 🔥`;
  document.getElementById('progressText').textContent = `${progress} / 100 XP`;
  document.getElementById('progressBar').style.width = `${progress}%`;
}

function questCardTemplate(quest) {
  return `
    <article class="quest-card ${quest.completed ? 'quest-done' : ''}">
      <h3>${quest.title}</h3>
      <p>${quest.description}</p>
      <div class="badges">
        <span class="badge">${quest.category}</span>
        <span class="badge">${quest.difficulty}</span>
        <span class="badge">+${quest.xpReward} XP</span>
      </div>
      <button data-quest-id="${quest.id}" class="complete-btn ${quest.completed ? 'quest-complete' : ''}" ${quest.completed ? 'disabled' : ''}>
        ${quest.completed ? 'Completed ✅' : 'Complete Quest'}
      </button>
    </article>
  `;
}

function renderQuests() {
  if (state.quests.length === 0) {
    questList.innerHTML = '<p class="message">No quests found. Generate one to begin your adventure.</p>';
    return;
  }

  questList.innerHTML = state.quests.map(questCardTemplate).join('');
}

async function loadProfile() {
  state.profile = await api('/profile', { headers: authHeaders() });
  updateStats();
}

async function loadQuests() {
  const params = new URLSearchParams();
  if (state.filters.category !== 'All') params.set('category', state.filters.category);
  if (state.filters.difficulty !== 'All') params.set('difficulty', state.filters.difficulty);
  if (state.filters.q) params.set('q', state.filters.q);

  const query = params.toString() ? `?${params.toString()}` : '';
  state.quests = await api(`/quests${query}`, { headers: authHeaders() });
  renderQuests();
}

async function refreshDashboard() {
  await loadProfile();
  await loadQuests();
}

async function handleAuthSuccess(payload) {
  state.token = payload.token;
  localStorage.setItem('sidequest_token', payload.token);
  await refreshDashboard();
  showDashboard();
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value,
      }),
    });

    await handleAuthSuccess(payload);
  } catch (error) {
    showAuth(error.message, true);
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const payload = await api('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: document.getElementById('signupUsername').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
      }),
    });

    await handleAuthSuccess(payload);
  } catch (error) {
    showAuth(error.message, true);
  }
});

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  signupTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
});

signupTab.addEventListener('click', () => {
  signupTab.classList.add('active');
  loginTab.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

logoutBtn.addEventListener('click', () => {
  state.token = null;
  state.profile = null;
  state.quests = [];
  localStorage.removeItem('sidequest_token');
  showAuth('Logged out successfully.');
});

document.getElementById('generateQuestBtn').addEventListener('click', async () => {
  try {
    await api('/quests/generate', {
      method: 'POST',
      headers: authHeaders(),
    });

    await refreshDashboard();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('seedQuestBtn').addEventListener('click', async () => {
  try {
    await api('/quests/seed', {
      method: 'POST',
      headers: authHeaders(),
    });

    await loadQuests();
  } catch (error) {
    alert(error.message);
  }
});

document.getElementById('categoryFilter').addEventListener('change', async (event) => {
  state.filters.category = event.target.value;
  await loadQuests();
});

document.getElementById('difficultyFilter').addEventListener('change', async (event) => {
  state.filters.difficulty = event.target.value;
  await loadQuests();
});

document.getElementById('searchInput').addEventListener('input', async (event) => {
  state.filters.q = event.target.value.trim();
  await loadQuests();
});

questList.addEventListener('click', async (event) => {
  const button = event.target.closest('.complete-btn');
  if (!button) return;

  const questId = button.getAttribute('data-quest-id');

  try {
    const payload = await api(`/quests/${questId}/complete`, {
      method: 'POST',
      headers: authHeaders(),
    });

    if (state.profile) {
      state.profile.xp = payload.profile.xp;
      state.profile.streak = payload.profile.streak;
      state.profile.completedQuests = payload.profile.completedQuests;
      updateStats();
    }

    await loadQuests();
  } catch (error) {
    alert(error.message);
  }
});

(async function init() {
  if (!state.token) {
    showAuth('Log in to start your next side quest.');
    return;
  }

  try {
    await refreshDashboard();
    showDashboard();
  } catch (error) {
    localStorage.removeItem('sidequest_token');
    state.token = null;
    showAuth('Session expired. Please log in again.', true);
  }
})();
