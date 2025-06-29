// 🌐 BACKEND API BASE URL
const BASE_URL = "https://akquiz-backend-dsjt.onrender.com";

// 🔐 TOKEN & ROLE
let token = null;
let isSupreme = false;

// 📌 UI ELEMENTS
const subjectSelect = document.getElementById('subjectSelect');
const chapterSelect = document.getElementById('chapterSelect');
const quizArea = document.getElementById('quizArea');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const explanationText = document.getElementById('explanationText');
const restartBtn = document.getElementById('restart');
const deleteSubjectBtn = document.getElementById('deleteSubject');
const deleteChapterBtn = document.getElementById('deleteChapter');
const deleteQuestionBtn = document.getElementById('deleteQuestion');
const editQuestionBtn = document.getElementById('editQuestion');
const scoreboardEl = document.getElementById('scoreboard');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const newSubject = document.getElementById('newSubject');
const newChapter = document.getElementById('newChapter');
const newQuestion = document.getElementById('newQuestion');
const option1 = document.getElementById('option1');
const option2 = document.getElementById('option2');
const option3 = document.getElementById('option3');
const option4 = document.getElementById('option4');
const correctAnswer = document.getElementById('correctAnswer');
const answerExplanation = document.getElementById('answerExplanation');
const addQuestionBtn = document.getElementById('addQuestion');

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const adminPanel = document.getElementById('adminPanel');
const logoutSection = document.getElementById('logoutSection');
const logoutBtn = document.getElementById('logoutBtn');

const addNewAdminBtn = document.getElementById('addNewAdminBtn');
const addAdminForm = document.getElementById('addAdminForm');
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const cancelCreateAdminBtn = document.getElementById('cancelCreateAdminBtn');

const deleteAdminSection = document.getElementById('deleteAdminSection');
const adminList = document.getElementById('adminList');
const deleteSelectedAdminsBtn = document.getElementById('deleteSelectedAdminsBtn');

// 🔁 QUIZ CONTROL
let currentQuestions = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;
let editingQuestion = null; // track editing

// 📥 FETCH FUNCTIONS
async function fetchSubjects() {
  const res = await fetch(`${BASE_URL}/api/subjects`);
  const subs = await res.json();
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  subs.forEach(sub => {
    const o = document.createElement('option');
    o.value = sub;
    o.innerText = sub;
    subjectSelect.appendChild(o);
  });
}

async function fetchChapters(subject) {
  const res = await fetch(`${BASE_URL}/api/subjects/${subject}/chapters`);
  return res.json();
}

async function fetchQuestions(subject, chapter) {
  const res = await fetch(`${BASE_URL}/api/subjects/${subject}/chapters/${chapter}/questions`);
  return res.json();
}

// 🧠 LOAD QUESTION
function loadQuestion() {
  optionsEl.innerHTML = '';
  explanationText.style.display = 'none';

  if (currentQuestionIndex < currentQuestions.length) {
    const q = currentQuestions[currentQuestionIndex];
    questionEl.innerText = q.question;

    q.options.forEach(opt => {
      const div = document.createElement('div');
      div.classList.add('option');
      div.innerText = opt;
      div.addEventListener('click', () => selectOption(div, q.correct, q.explanation));
      optionsEl.appendChild(div);
    });

    deleteQuestionBtn.style.display = token ? 'inline-block' : 'none';
    editQuestionBtn.style.display = token ? 'inline-block' : 'none';

    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
    prevBtn.disabled = currentQuestionIndex <= 0;
    nextBtn.disabled = currentQuestionIndex >= currentQuestions.length - 1;
  } else {
    questionEl.innerText = "Quiz Completed!";
    optionsEl.innerHTML = '';
    scoreboardEl.innerText = `Final Score: ${score} / ${attempts}`;
    restartBtn.style.display = 'inline-block';
    [prevBtn, nextBtn, deleteQuestionBtn, editQuestionBtn].forEach(b => b.style.display = 'none');
  }
}

// ✅ UPDATED SELECT OPTION FUNCTION
function selectOption(el, correct, explanation) {
  document.querySelectorAll('.option').forEach(opt => {
    opt.style.pointerEvents = 'none';
    if (opt.innerText.trim() === correct.trim()) {
      opt.classList.add('correct');
    } else {
      opt.classList.add('wrong');
    }
  });

  if (el.innerText.trim() === correct.trim()) {
    score++;
  }

  if (explanation && explanation.trim() !== "") {
    explanationText.innerText = `Explanation: ${explanation}`;
    explanationText.style.display = 'block';
  } else {
    explanationText.style.display = 'none';
  }

  attempts++;
  scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
}

// 🔀 NAVIGATION
prevBtn.onclick = () => { if (currentQuestionIndex > 0) currentQuestionIndex-- && loadQuestion(); };
nextBtn.onclick = () => { if (currentQuestionIndex < currentQuestions.length - 1) currentQuestionIndex++ && loadQuestion(); };
restartBtn.onclick = () => {
  subjectSelect.value = '';
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;
  quizArea.style.display = 'none';
  scoreboardEl.innerText = '';
  fetchSubjects();
};

// ➕ ADD/EDIT QUESTION
addQuestionBtn.onclick = async () => {
  const payload = {
    subject: newSubject.value.trim(),
    chapter: newChapter.value.trim(),
    question: newQuestion.value.trim(),
    options: [option1.value.trim(), option2.value.trim(), option3.value.trim(), option4.value.trim()],
    correct: correctAnswer.value.trim(),
    explanation: answerExplanation.value.trim()
  };
  if (!payload.subject || !payload.chapter || !payload.question || payload.options.includes('') || !payload.correct) {
    return alert('Please fill all required fields!');
  }

  const method = editingQuestion ? 'PUT' : 'POST';
  const url = editingQuestion
    ? `${BASE_URL}/api/questions/${editingQuestion}`
    : `${BASE_URL}/api/questions`;

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  editingQuestion = null;
  addQuestionBtn.innerText = 'Add Question';
  const result = await res.json();
  res.ok ? alert(method === 'POST' ? 'Question Added!' : 'Question Updated!') : alert(result.error || 'Operation failed');
  [newSubject, newChapter, newQuestion, option1, option2, option3, option4, correctAnswer, answerExplanation].forEach(i => i.value = '');
  fetchSubjects();
};

// 🗑️ DELETE SUBJECT/CHAPTER/QUESTION
deleteSubjectBtn.onclick = async () => {
  const s = subjectSelect.value;
  if (!s || !confirm(`Delete subject "${s}" and all its data?`)) return;
  const res = await fetch(`${BASE_URL}/api/subjects/${s}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  });
  res.ok ? (alert('Subject Deleted!'), fetchSubjects()) : alert('Failed');
};

deleteChapterBtn.onclick = async () => {
  const s = subjectSelect.value, c = chapterSelect.value;
  if (!c || !confirm(`Delete chapter "${c}"?`)) return;
  const res = await fetch(`${BASE_URL}/api/subjects/${s}/chapters/${c}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  });
  res.ok ? (alert('Chapter Deleted!'), subjectSelect.dispatchEvent(new Event('change'))) : alert('Failed');
};

deleteQuestionBtn.onclick = async () => {
  const q = currentQuestions[currentQuestionIndex];
  if (!q || !confirm('Delete this question?')) return;
  const res = await fetch(`${BASE_URL}/api/questions/${q._id}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
  });
  res.ok ? (alert('Question Deleted!'), subjectSelect.dispatchEvent(new Event('change'))) : alert('Failed');
};

// ✏️ EDIT QUESTION BUTTON
editQuestionBtn.onclick = () => {
  const q = currentQuestions[currentQuestionIndex];
  editingQuestion = q._id;
  newSubject.value = subjectSelect.value;
  newChapter.value = chapterSelect.value;
  newQuestion.value = q.question;
  [option1, option2, option3, option4].forEach((el, i) => el.value = q.options[i]);
  correctAnswer.value = q.correct;
  answerExplanation.value = q.explanation;
  addQuestionBtn.innerText = 'Save Edit';
};

// 🔐 ADMIN LOGIN / LOGOUT
loginBtn.onclick = async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim()
    })
  });
  const data = await res.json();
  if (res.ok) {
    token = data.token;
    isSupreme = data.supreme;
    toggleAdmin(true);
    alert('Admin Logged In ✔️');
  } else {
    loginError.innerText = data.error || 'Login Failed ❌';
  }
};

logoutBtn.onclick = () => {
  token = null;
  isSupreme = false;
  toggleAdmin(false);
};

// 🧭 Toggle Admin UI
function toggleAdmin(loggedIn) {
  loginForm.style.display = loggedIn ? 'none' : 'block';
  adminPanel.style.display = loggedIn ? 'block' : 'none';
  logoutSection.style.display = loggedIn ? 'block' : 'none';
  addNewAdminBtn.style.display = (loggedIn && isSupreme) ? 'inline-block' : 'none';
  deleteSubjectBtn.style.display = (subjectSelect.value && loggedIn) ? 'inline-block' : 'none';
  deleteChapterBtn.style.display = (chapterSelect.value && loggedIn) ? 'inline-block' : 'none';
  deleteAdminSection.style.display = (loggedIn && isSupreme) ? 'block' : 'none';

  if (loggedIn && isSupreme) loadAdminList();
}

// 🗂️ Load Admin List (Checkbox delete)
async function loadAdminList() {
  adminList.innerHTML = '';
  const res = await fetch(`${BASE_URL}/api/admins`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return;
  const admins = await res.json();
  admins
    .filter(a => a.username !== usernameInput.value.trim()) // exclude self
    .forEach(a => {
      const li = document.createElement('li');
      li.innerHTML = `<label><input type="checkbox" value="${a.username}"> ${a.username}</label>`;
      adminList.appendChild(li);
    });
}

deleteSelectedAdminsBtn.onclick = async () => {
  const selected = [...adminList.querySelectorAll('input:checked')].map(i => i.value);
  if (!selected.length || !confirm('Delete selected admins?')) return;
  const res = await fetch(`${BASE_URL}/api/admins`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ usernames: selected })
  });
  res.ok ? (alert('Admins Deleted!'), loadAdminList()) : alert('Failed');
};

// 🧭 Subject / Chapter change handlers
subjectSelect.onchange = async () => {
  const s = subjectSelect.value;
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;
  deleteSubjectBtn.style.display = s && token ? 'inline-block' : 'none';
  const chapters = await fetchChapters(s);
  chapters.forEach(ch => {
    const o = document.createElement('option');
    o.value = ch;
    o.innerText = ch;
    chapterSelect.appendChild(o);
  });
  chapterSelect.disabled = false;
};

chapterSelect.onchange = async () => {
  deleteChapterBtn.style.display = chapterSelect.value && token ? 'inline-block' : 'none';
  currentQuestions = await fetchQuestions(subjectSelect.value, chapterSelect.value);
  currentQuestionIndex = 0;
  attempts = 0;
  score = 0;
  quizArea.style.display = 'block';
  restartBtn.style.display = 'inline-block';
  loadQuestion();
};

// 🧠 INIT
window.onload = () => {
  fetchSubjects();
  toggleAdmin(false);
};
