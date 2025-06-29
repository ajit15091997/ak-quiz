const BASE_URL = "https://akquiz-backend-dsjt.onrender.com";
let token = null;

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
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const adminPanel = document.getElementById('adminPanel');
const logoutSection = document.getElementById('logoutSection');
const logoutBtn = document.getElementById('logoutBtn');
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
const editForm = document.getElementById('editForm');
const editQuestionText = document.getElementById('editQuestionText');
const editOption1 = document.getElementById('editOption1');
const editOption2 = document.getElementById('editOption2');
const editOption3 = document.getElementById('editOption3');
const editOption4 = document.getElementById('editOption4');
const editCorrectAnswer = document.getElementById('editCorrectAnswer');
const editExplanation = document.getElementById('editExplanation');
const saveEditBtn = document.getElementById('saveEdit');
const cancelEditBtn = document.getElementById('cancelEdit');
const addAdminBtn = document.getElementById('addNewAdminBtn');
const addAdminForm = document.getElementById('addAdminForm');
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const cancelCreateAdminBtn = document.getElementById('cancelCreateAdminBtn');

let currentQuestions = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;

async function fetchSubjects() {
  const res = await fetch(`${BASE_URL}/api/subjects`);
  const subjects = await res.json();
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  subjects.forEach(s => {
    const o = document.createElement('option');
    o.value = s;
    o.innerText = s;
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

  const res = await fetch(`${BASE_URL}/api/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    alert('✅ Question added!');
    [newSubject, newChapter, newQuestion, option1, option2, option3, option4, correctAnswer, answerExplanation].forEach(f => f.value = '');
    fetchSubjects();
  } else {
    alert('❌ Failed to add question!');
  }
});

subjectSelect.addEventListener('change', async () => {
  const subject = subjectSelect.value;
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;
  deleteSubjectBtn.style.display = token ? 'inline-block' : 'none';
  deleteChapterBtn.style.display = 'none';
  deleteQuestionBtn.style.display = 'none';
  editQuestionBtn.style.display = 'none';
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
  deleteChapterBtn.style.display = chapter && token ? 'inline-block' : 'none';

  if (chapter) {
    currentQuestions = await fetchQuestions(subject, chapter);
    currentQuestionIndex = 0;
    attempts = 0;
    score = 0;
    quizArea.style.display = 'block';
    restartBtn.style.display = 'inline-block';
    loadQuestion();
  }
});

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
    questionEl.innerText = "🎉 Quiz Completed!";
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
  } else {
    el.classList.add('wrong');
  }

  if (explanation && explanation.trim()) {
    explanationText.innerText = `Explanation: ${explanation}`;
    explanationText.style.display = 'block';
  }

  attempts++;
  scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
}

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
  subjectSelect.value = '';
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;
  quizArea.style.display = 'none';
  scoreboardEl.innerText = '';
  fetchSubjects();
});

loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    const data = await res.json();
    token = data.token;
    toggleAdminView(true);
    alert('🟢 Admin Login Successful');
  } else {
    loginError.innerText = '❌ Invalid Credentials';
  }
});

logoutBtn.addEventListener('click', () => {
  token = null;
  toggleAdminView(false);
  alert('🔒 Logged out');
});

function toggleAdminView(show) {
  adminPanel.style.display = show ? 'block' : 'none';
  logoutSection.style.display = show ? 'block' : 'none';
  loginForm.style.display = show ? 'none' : 'block';
  [deleteSubjectBtn, deleteChapterBtn, deleteQuestionBtn, editQuestionBtn].forEach(btn => {
    btn.style.display = show ? 'inline-block' : 'none';
  });

  addAdminBtn.style.display = show && usernameInput.value === 'ajitquiz@53' ? 'inline-block' : 'none';
}

deleteSubjectBtn.addEventListener('click', async () => {
  const subject = subjectSelect.value;
  if (confirm(`Delete Subject "${subject}"?`)) {
    const res = await fetch(`${BASE_URL}/api/subjects/${subject}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert('🗑️ Subject deleted!');
      fetchSubjects();
    } else {
      alert('❌ Failed to delete subject');
    }
  }
});

deleteChapterBtn.addEventListener('click', async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  if (confirm(`Delete Chapter "${chapter}"?`)) {
    const res = await fetch(`${BASE_URL}/api/subjects/${subject}/chapters/${chapter}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      alert('🗑️ Chapter deleted!');
      subjectSelect.dispatchEvent(new Event('change'));
    } else {
      alert('❌ Failed to delete chapter');
    }
  }
});

deleteQuestionBtn.addEventListener('click', async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  const q = currentQuestions[currentQuestionIndex];
  if (confirm('Delete this question?')) {
    const res = await fetch(`${BASE_URL}/api/questions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subject, chapter, question: q.question })
    });
    if (res.ok) {
      currentQuestions.splice(currentQuestionIndex, 1);
      loadQuestion();
      alert('✅ Question deleted');
    } else {
      alert('❌ Failed to delete');
    }
  }
});

editQuestionBtn.addEventListener('click', () => {
  const q = currentQuestions[currentQuestionIndex];
  editQuestionText.value = q.question;
  editOption1.value = q.options[0];
  editOption2.value = q.options[1];
  editOption3.value = q.options[2];
  editOption4.value = q.options[3];
  editCorrectAnswer.value = q.correct;
  editExplanation.value = q.explanation;
  quizArea.style.display = 'none';
  editForm.style.display = 'block';
});

saveEditBtn.addEventListener('click', async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  const oldQ = currentQuestions[currentQuestionIndex];

  const updated = {
    subject,
    chapter,
    oldQuestion: oldQ.question,
    updatedQuestion: {
      question: editQuestionText.value.trim(),
      options: [editOption1.value, editOption2.value, editOption3.value, editOption4.value],
      correct: editCorrectAnswer.value,
      explanation: editExplanation.value
    }
  };

  const res = await fetch(`${BASE_URL}/api/questions`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updated)
  });

  if (res.ok) {
    alert('📝 Question updated!');
    chapterSelect.dispatchEvent(new Event('change'));
    editForm.style.display = 'none';
    quizArea.style.display = 'block';
  } else {
    alert('❌ Update failed');
  }
});

cancelEditBtn.addEventListener('click', () => {
  editForm.style.display = 'none';
  quizArea.style.display = 'block';
});

// ADD ADMIN
addAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'block';
  adminPanel.style.display = 'none';
});

cancelCreateAdminBtn.addEventListener('click', () => {
  addAdminForm.style.display = 'none';
  adminPanel.style.display = 'block';
  newAdminUsername.value = '';
  newAdminPassword.value = '';
});

createAdminBtn.addEventListener('click', async () => {
  const username = newAdminUsername.value.trim();
  const password = newAdminPassword.value.trim();

  if (!username || !password) {
    alert('Please fill all fields!');
    return;
  }

  const res = await fetch(`${BASE_URL}/api/admins`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert('✅ Admin created!');
    addAdminForm.style.display = 'none';
    adminPanel.style.display = 'block';
    newAdminUsername.value = '';
    newAdminPassword.value = '';
  } else {
    alert('❌ ' + (data.error || 'Something went wrong!'));
  }
});

window.onload = () => {
  fetchSubjects();
  toggleAdminView(false);
};
