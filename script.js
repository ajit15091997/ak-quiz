// =================== Elements ===================
const subjectSelect = document.getElementById('subjectSelect');
const chapterSelect = document.getElementById('chapterSelect');
const adminSubjectSelect = document.getElementById('adminSubjectSelect');
const adminChapterSelect = document.getElementById('adminChapterSelect');

const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const explanationText = document.getElementById('explanationText');
const quizArea = document.getElementById('quizArea');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restart');

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

const deleteSubject = document.getElementById('deleteSubject');
const deleteChapter = document.getElementById('deleteChapter');
const deleteQuestion = document.getElementById('deleteQuestion');
const editQuestion = document.getElementById('editQuestion');

const loginForm = document.getElementById('loginForm');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

const logoutBtn = document.getElementById('logoutBtn');
const logoutSection = document.getElementById('logoutSection');
const adminPanel = document.getElementById('adminPanel');

const addNewAdminBtn = document.getElementById('addNewAdminBtn');
const addAdminForm = document.getElementById('addAdminForm');
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const cancelCreateAdminBtn = document.getElementById('cancelCreateAdminBtn');

// =================== Variables ===================
let currentQuestions = [];
let currentQuestionIndex = 0;

// =================== Admin Login ===================
loginBtn.addEventListener('click', () => {
  const user = username.value.trim();
  const pass = password.value.trim();

  if (user === 'ajitquiz@53' && pass === 'ajit@15091997') {
    localStorage.setItem('isAdmin', 'true');
    localStorage.setItem('isSupreme', 'true');
    toggleAdminView(true);
    alert('Welcome Supreme Admin 👑');
  } else {
    loginError.innerText = 'Invalid Credentials ❌';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('isSupreme');
  toggleAdminView(false);
  alert('Logged Out 🔒');
});

function toggleAdminView(isLoggedIn) {
  if (isLoggedIn) {
    adminPanel.style.display = 'block';
    loginForm.style.display = 'none';
    logoutSection.style.display = 'block';

    const isSupreme = localStorage.getItem('isSupreme') === 'true';
    addNewAdminBtn.style.display = isSupreme ? 'inline-block' : 'none';
  } else {
    adminPanel.style.display = 'none';
    loginForm.style.display = 'block';
    logoutSection.style.display = 'none';
    addNewAdminBtn.style.display = 'none';
  }
}

// =================== Add Question ===================
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
    alert('Please fill all required fields.');
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

// =================== Load Subjects ===================
async function fetchSubjects() {
  const res = await fetch('/api/subjects');
  const subjects = await res.json();

  [subjectSelect, adminSubjectSelect].forEach(sel => {
    sel.innerHTML = '<option value="">Select Subject</option>';
    subjects.forEach(sub => {
      const o = document.createElement('option');
      o.value = sub;
      o.innerText = sub;
      sel.appendChild(o);
    });
  });
}

// =================== Load Chapters ===================
adminSubjectSelect.addEventListener('change', async () => {
  const subject = adminSubjectSelect.value;
  adminChapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  adminChapterSelect.disabled = true;
  deleteSubject.style.display = 'none';
  deleteChapter.style.display = 'none';

  if (subject) {
    const chapters = await fetch(`/api/subjects/${subject}/chapters`).then(r => r.json());
    chapters.forEach(ch => {
      const o = document.createElement('option');
      o.value = ch;
      o.innerText = ch;
      adminChapterSelect.appendChild(o);
    });
    adminChapterSelect.disabled = false;
    deleteSubject.style.display = 'inline-block';
  }
});

adminChapterSelect.addEventListener('change', async () => {
  const subject = adminSubjectSelect.value;
  const chapter = adminChapterSelect.value;
  deleteChapter.style.display = chapter ? 'inline-block' : 'none';

  if (chapter) {
    currentQuestions = await fetch(`/api/subjects/${subject}/chapters/${chapter}/questions`).then(r => r.json());
    currentQuestionIndex = 0;
    quizArea.style.display = 'block';
    restartBtn.style.display = 'inline-block';
    loadQuestion();
  }
});

// =================== Load & Show Questions ===================
function loadQuestion() {
  optionsEl.innerHTML = '';
  explanationText.style.display = 'none';

  const q = currentQuestions[currentQuestionIndex];
  if (!q) return;

  questionEl.innerText = q.question;

  q.options.forEach(opt => {
    const div = document.createElement('div');
    div.classList.add('option');
    div.innerText = opt;
    div.addEventListener('click', () => {
      document.querySelectorAll('.option').forEach(o => o.style.pointerEvents = 'none');
      if (opt === q.correct) {
        div.classList.add('correct');
        if (q.explanation) {
          explanationText.innerText = q.explanation;
          explanationText.style.display = 'block';
        }
      } else {
        div.classList.add('wrong');
      }
    });
    optionsEl.appendChild(div);
  });
}

// =================== Navigation ===================
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
  loadQuestion();
});

// =================== Add Admin (Supreme Only) ===================
addNewAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'block';
});

cancelCreateAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'none';
});

createAdminBtn.addEventListener('click', () => {
  alert('Admin added (backend logic pending)');
  newAdminUsername.value = '';
  newAdminPassword.value = '';
  addAdminForm.style.display = 'none';
});

// =================== On Load ===================
window.onload = () => {
  fetchSubjects();
  toggleAdminView(localStorage.getItem('isAdmin') === 'true');
};
