// ==================== DOM Elements ====================
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

// ==================== Variables ====================
let currentQuestions = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;

// ==================== Fetching Data ====================
async function fetchSubjects() {
  const res = await fetch('/api/subjects');
  const subjects = await res.json();
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  subjects.forEach(sub => {
    const o = document.createElement('option');
    o.value = sub;
    o.innerText = sub;
    subjectSelect.appendChild(o);
  });
}

async function fetchChapters(subject) {
  const res = await fetch(`/api/subjects/${subject}/chapters`);
  return res.json();
}

async function fetchQuestions(subject, chapter) {
  const res = await fetch(`/api/subjects/${subject}/chapters/${chapter}/questions`);
  return res.json();
}

// ==================== Add Question ====================
addQuestionBtn.addEventListener('click', async () => {
  const payload = {
    subject: newSubject.value.trim(),
    chapter: newChapter.value.trim(),
    question: newQuestion.value.trim(),
    options: [option1.value.trim(), option2.value.trim(), option3.value.trim(), option4.value.trim()],
    correct: correctAnswer.value.trim(),
    explanation: answerExplanation.value.trim()
  };

  if (!payload.subject || !payload.chapter || !payload.question || payload.options.includes('') || !payload.correct) {
    alert('Please fill all required fields!');
    return;
  }

  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('Question added successfully!');
    [newSubject, newChapter, newQuestion, option1, option2, option3, option4, correctAnswer, answerExplanation]
      .forEach(f => f.value = '');
    fetchSubjects();
  } else {
    alert('Error adding question.');
  }
});

// ==================== Subject/Chapter Selection ====================
subjectSelect.addEventListener('change', async () => {
  const subject = subjectSelect.value;
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;

  [deleteSubjectBtn, deleteChapterBtn, deleteQuestionBtn, editQuestionBtn].forEach(btn => btn.style.display = 'none');
  scoreboardEl.innerText = '';
  explanationText.style.display = 'none';

  if (subject) {
    const chapters = await fetchChapters(subject);
    chapters.forEach(ch => {
      const o = document.createElement('option');
      o.value = ch;
      o.innerText = ch;
      chapterSelect.appendChild(o);
    });
    chapterSelect.disabled = false;
  }
});

chapterSelect.addEventListener('change', async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;

  if (chapter) {
    currentQuestions = await fetchQuestions(subject, chapter);
    currentQuestionIndex = 0;
    attempts = 0;
    score = 0;
    quizArea.style.display = 'block';
    restartBtn.style.display = 'inline-block';
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';

    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    deleteSubjectBtn.style.display = isAdmin ? 'inline-block' : 'none';
    deleteChapterBtn.style.display = isAdmin ? 'inline-block' : 'none';
    deleteQuestionBtn.style.display = isAdmin ? 'inline-block' : 'none';
    editQuestionBtn.style.display = isAdmin ? 'inline-block' : 'none';

    loadQuestion();
  } else {
    quizArea.style.display = 'none';
  }
});

// ==================== Load Question ====================
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

function selectOption(el, correct, explanation) {
  document.querySelectorAll('.option').forEach(o => o.style.pointerEvents = 'none');
  if (el.innerText === correct) {
    el.classList.add('correct');
    score++;

    if (explanation && explanation.trim() !== '') {
      explanationText.innerText = explanation;
      explanationText.style.display = 'block';
    }
  } else {
    el.classList.add('wrong');
  }
  attempts++;
  scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
}

// ==================== Navigation & Restart ====================
prevBtn.addEventListener('click', () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
});

restartBtn.addEventListener('click', () => {
  currentQuestionIndex = 0;
  attempts = 0;
  score = 0;
  explanationText.style.display = 'none';
  scoreboardEl.innerText = '';

  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  deleteQuestionBtn.style.display = isAdmin ? 'inline-block' : 'none';
  editQuestionBtn.style.display = isAdmin ? 'inline-block' : 'none';

  loadQuestion();
});

// ==================== Admin Login & Add Admin ====================
function toggleAdminView(isAdmin) {
  if (isAdmin) {
    adminPanel.style.display = 'block';
    logoutSection.style.display = 'block';
    loginForm.style.display = 'none';

    const user = localStorage.getItem('currentAdmin');
    addNewAdminBtn.style.display = (user === 'ajitquiz@53') ? 'inline-block' : 'none';
  } else {
    adminPanel.style.display = 'none';
    logoutSection.style.display = 'none';
    loginForm.style.display = 'block';
    addNewAdminBtn.style.display = 'none';
    [deleteSubjectBtn, deleteChapterBtn, deleteQuestionBtn, editQuestionBtn].forEach(btn => btn.style.display = 'none');
  }
}

loginBtn.addEventListener('click', async () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });

    if (!res.ok) throw new Error();
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('currentAdmin', user);
    toggleAdminView(true);
    alert('Welcome Admin 👑');
  } catch {
    loginError.innerText = 'Invalid Credentials ❌';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('currentAdmin');
  toggleAdminView(false);
  alert('Logged Out 🔒');
});

addNewAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'block';
});

cancelCreateAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'none';
});

createAdminBtn.addEventListener('click', async () => {
  const username = newAdminUsername.value.trim();
  const password = newAdminPassword.value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const res = await fetch('/api/admins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    alert("Admin created successfully!");
    newAdminUsername.value = '';
    newAdminPassword.value = '';
    addAdminForm.style.display = 'none';
  } else {
    const err = await res.json();
    alert("Error: " + err.error);
  }
});

window.onload = () => {
  fetchSubjects();
  toggleAdminView(localStorage.getItem('isAdmin') === 'true');
};
