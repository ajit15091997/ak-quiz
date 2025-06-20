// ===== Data & Admin Storage =====
let data = JSON.parse(localStorage.getItem('quizData')) || {};
let admins = JSON.parse(localStorage.getItem('quizAdmins')) || [{ username: 'admin', password: 'admin' }];
let currentAdmin = JSON.parse(sessionStorage.getItem('currentAdmin')) || null;

// ===== DOM Elements =====
const elems = {
  loginForm: document.getElementById('loginForm'),
  logoutSection: document.getElementById('logoutSection'),
  loginBtn: document.getElementById('loginBtn'),
  username: document.getElementById('username'),
  password: document.getElementById('password'),
  loginError: document.getElementById('loginError'),
  
  adminPanel: document.getElementById('adminPanel'),
  addNewAdminBtn: document.getElementById('addNewAdminBtn'),
  showDeleteAdminBtn: document.getElementById('showDeleteAdminBtn'),
  
  addAdminForm: document.getElementById('addAdminForm'),
  newAdminUsername: document.getElementById('newAdminUsername'),
  newAdminPassword: document.getElementById('newAdminPassword'),
  createAdminBtn: document.getElementById('createAdminBtn'),
  cancelCreateAdminBtn: document.getElementById('cancelCreateAdminBtn'),
  
  deleteAdminSection: document.getElementById('deleteAdminSection'),
  adminList: document.getElementById('adminList'),
  deleteSelectedAdminsBtn: document.getElementById('deleteSelectedAdminsBtn'),
  
  newSubject: document.getElementById('newSubject'),
  newChapter: document.getElementById('newChapter'),
  newQuestion: document.getElementById('newQuestion'),
  option1: document.getElementById('option1'),
  option2: document.getElementById('option2'),
  option3: document.getElementById('option3'),
  option4: document.getElementById('option4'),
  correctAnswer: document.getElementById('correctAnswer'),
  answerExplanation: document.getElementById('answerExplanation'),
  addQuestionBtn: document.getElementById('addQuestion'),
  
  subjectSelect: document.getElementById('subjectSelect'),
  chapterSelect: document.getElementById('chapterSelect'),
  deleteSubjectBtn: document.getElementById('deleteSubject'),
  deleteChapterBtn: document.getElementById('deleteChapter'),
  
  quizArea: document.getElementById('quizArea'),
  questionEl: document.getElementById('question'),
  optionsEl: document.getElementById('options'),
  explanationText: document.getElementById('explanationText'),
  restartBtn: document.getElementById('restart'),
  deleteQuestionBtn: document.getElementById('deleteQuestion'),
  editQuestionBtn: document.getElementById('editQuestion'),
  scoreboardEl: document.getElementById('scoreboard'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  
  editForm: document.getElementById('editForm'),
  editQuestionText: document.getElementById('editQuestionText'),
  editOption1: document.getElementById('editOption1'),
  editOption2: document.getElementById('editOption2'),
  editOption3: document.getElementById('editOption3'),
  editOption4: document.getElementById('editOption4'),
  editCorrectAnswer: document.getElementById('editCorrectAnswer'),
  editExplanation: document.getElementById('editExplanation'),
  saveEditBtn: document.getElementById('saveEdit'),
  cancelEditBtn: document.getElementById('cancelEdit'),
};

// ===== Current Quiz State =====
let currentQuestions = [], currentQuestionIndex = 0, score = 0, attempts = 0;

// ===== Utilities =====
function saveData() {
  localStorage.setItem('quizData', JSON.stringify(data));
}
function saveAdmins() {
  localStorage.setItem('quizAdmins', JSON.stringify(admins));
}
function refreshAdminUI() {
  if (currentAdmin) {
    elems.loginForm.style.display = 'none';
    elems.logoutSection.style.display = 'block';
    elems.adminPanel.style.display = 'block';
    elems.addNewAdminBtn.style.display = 'inline-block';
    elems.showDeleteAdminBtn.style.display = 'inline-block';
  } else {
    elems.loginForm.style.display = 'block';
    elems.logoutSection.style.display = 'none';
    elems.adminPanel.style.display = 'none';
    elems.addAdminForm.style.display = 'none';
    elems.deleteAdminSection.style.display = 'none';
  }
}
function toggleSection(section, show) {
  section.style.display = show ? 'block' : 'none';
}

// ===== Admin Login/Logout =====
elems.loginBtn.addEventListener('click', () => {
  const user = elems.username.value.trim();
  const pass = elems.password.value;
  const found = admins.find(a => a.username === user && a.password === pass);
  if (found) {
    currentAdmin = user;
    sessionStorage.setItem('currentAdmin', JSON.stringify(user));
    elems.loginError.innerText = '';
    refreshAdminUI();
  } else {
    elems.loginError.innerText = 'Invalid credentials!';
  }
});
elems.logoutBtn.addEventListener('click', () => {
  currentAdmin = null;
  sessionStorage.removeItem('currentAdmin');
  refreshAdminUI();
});

// ===== Add/Delete Admin =====
elems.addNewAdminBtn.addEventListener('click', () => toggleSection(elems.addAdminForm, true));
elems.cancelCreateAdminBtn.addEventListener('click', () => toggleSection(elems.addAdminForm, false));
elems.createAdminBtn.addEventListener('click', () => {
  const u = elems.newAdminUsername.value.trim(), p = elems.newAdminPassword.value;
  if (u && p && !admins.some(a => a.username === u)) {
    admins.push({ username: u, password: p });
    saveAdmins();
    alert('Admin added');
    elems.newAdminUsername.value = elems.newAdminPassword.value = '';
    toggleSection(elems.addAdminForm, false);
  } else alert('Invalid or duplicate admin');
});
elems.showDeleteAdminBtn.addEventListener('click', () => {
  elems.adminList.innerHTML = admins.map(a =>
    `<label><input type="checkbox" value="${a.username}" ${a.username === currentAdmin ? 'disabled' : ''}> ${a.username}</label><br>`
  ).join('');
  toggleSection(elems.deleteAdminSection, true);
});
elems.deleteSelectedAdminsBtn.addEventListener('click', () => {
  const toDelete = Array.from(elems.adminList.querySelectorAll('input:checked')).map(i => i.value);
  admins = admins.filter(a => !toDelete.includes(a.username));
  saveAdmins();
  alert('Deleted: ' + toDelete.join(','));
  toggleSection(elems.deleteAdminSection, false);
});

// ===== Quiz Data Management =====
elems.addQuestionBtn.addEventListener('click', () => {
  const [subject, chapter, question] = [elems.newSubject.value.trim(), elems.newChapter.value.trim(), elems.newQuestion.value.trim()];
  const opts = [elems.option1.value.trim(), elems.option2.value.trim(), elems.option3.value.trim(), elems.option4.value.trim()];
  const correct = elems.correctAnswer.value.trim();
  const explain = elems.answerExplanation.value.trim();
  if (subject && chapter && question && opts.every(o => o) && correct && explain) {
    data[subject] ??= {};
    data[subject][chapter] ??= [];
    data[subject][chapter].push({ question, options: opts, correct, explanation: explain });
    saveData();
    alert('Question added');
    [elems.newSubject, elems.newChapter, elems.newQuestion, elems.option1, elems.option2, elems.option3, elems.option4, elems.correctAnswer, elems.answerExplanation].forEach(i => i.value = '');
    refreshSubjects();
  } else alert('Fill all fields including Explanation');
});

// ===== Subject/Chapter Dropdown =====
function refreshSubjects() {
  elems.subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  Object.keys(data).forEach(s => elems.subjectSelect.appendChild(new Option(s, s)));
}
elems.subjectSelect.addEventListener('change', () => {
  elems.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  elems.chapterSelect.disabled = !elems.subjectSelect.value;
  Object.keys(data[elems.subjectSelect.value] || {}).forEach(c => elems.chapterSelect.appendChild(new Option(c, c)));
  elems.deleteSubjectBtn.style.display = elems.subjectSelect.value ? 'inline-block' : 'none';
});
elems.deleteSubjectBtn.addEventListener('click', () => {
  if (confirm(`Delete subject and all chapters?`)) {
    delete data[elems.subjectSelect.value];
    saveData();
    refreshSubjects();
    elems.chapterSelect.innerHTML = '<option>Select Chapter</option>';
    elems.chapterSelect.disabled = true;
    elems.quizArea.style.display = 'none';
  }
});
elems.chapterSelect.addEventListener('change', () => {
  elems.deleteChapterBtn.style.display = elems.chapterSelect.value ? 'inline-block' : 'none';
  if (elems.chapterSelect.value) startQuiz();
});
elems.deleteChapterBtn.addEventListener('click', () => {
  if (confirm(`Delete chapter and questions?`)) {
    delete data[elems.subjectSelect.value][elems.chapterSelect.value];
    saveData();
    elems.quizArea.style.display = 'none';
    refreshSubjects();
    elems.subjectSelect.dispatchEvent(new Event('change'));
  }
});

// ===== Quiz Flow =====
function startQuiz() {
  currentQuestions = JSON.parse(JSON.stringify(data[elems.subjectSelect.value][elems.chapterSelect.value]));
  score = attempts = currentQuestionIndex = 0;
  elems.quizArea.style.display = 'block';
  elems.explanationText.style.display = 'none';
  elems.restartBtn.style.display = 'none';
  loadQuestion();
}
function loadQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  elems.questionEl.innerHTML = q.question;
  elems.optionsEl.innerHTML = '';
  elems.explanationText.style.display = 'none';
  q.options.forEach(opt => {
    const d = document.createElement('div');
    d.classList.add('option');
    d.innerText = opt;
    d.addEventListener('click', () => selectOption(d, q));
    elems.optionsEl.appendChild(d);
  });
  elems.scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
  [elems.prevBtn, elems.nextBtn, elems.deleteQuestionBtn, elems.editQuestionBtn].forEach(b => b.style.display = 'inline-block');
  checkNav();
  if (window.MathJax) MathJax.typeset();
}
function selectOption(elem, q) {
  Array.from(elems.optionsEl.children).forEach(o => {
    o.style.pointerEvents = 'none';
    if (o.innerText === q.correct) o.classList.add('correct');
  });
  if (elem.innerText === q.correct) { elem.classList.add('correct'); score++; }
  else elem.classList.add('wrong');
  elems.explanationText.innerText = `Explain: ${q.explanation}`;
  elems.explanationText.style.display = 'block';
  attempts++;
  elems.scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
}

function checkNav() {
  elems.prevBtn.disabled = currentQuestionIndex === 0;
  elems.nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
}
elems.prevBtn.addEventListener('click', () => { currentQuestionIndex--; loadQuestion(); });
elems.nextBtn.addEventListener('click', () => { currentQuestionIndex++; loadQuestion(); });
elems.restartBtn.addEventListener('click', () => elems.quizArea.style.display = 'none');

// ===== Delete & Edit in Quiz =====
elems.deleteQuestionBtn.addEventListener('click', () => {
  if (confirm('Delete this question?')) {
    currentQuestions.splice(currentQuestionIndex, 1);
    data[elems.subjectSelect.value][elems.chapterSelect.value] = currentQuestions;
    saveData();
    currentQuestionIndex = Math.max(0, currentQuestionIndex - 1);
    loadQuestion();
  }
});
elems.editQuestionBtn.addEventListener('click', () => {
  const q = currentQuestions[currentQuestionIndex];
  elems.editQuestionText.value = q.question;
  elems.editOption1.value = q.options[0];
  elems.editOption2.value = q.options[1];
  elems.editOption3.value = q.options[2];
  elems.editOption4.value = q.options[3];
  elems.editCorrectAnswer.value = q.correct;
  elems.editExplanation.value = q.explanation;
  elems.quizArea.style.display = 'none';
  elems.editForm.style.display = 'block';
});
elems.saveEditBtn.addEventListener('click', () => {
  const q = {
    question: elems.editQuestionText.value,
    options: [elems.editOption1.value, elems.editOption2.value, elems.editOption3.value, elems.editOption4.value],
    correct: elems.editCorrectAnswer.value,
    explanation: elems.editExplanation.value
  };
  currentQuestions[currentQuestionIndex] = q;
  data[elems.subjectSelect.value][elems.chapterSelect.value] = currentQuestions;
  saveData();
  elems.editForm.style.display = 'none';
  elems.quizArea.style.display = 'block';
  loadQuestion();
});
elems.cancelEditBtn.addEventListener('click', () => {
  elems.editForm.style.display = 'none';
  elems.quizArea.style.display = 'block';
});

// ===== Initialize =====
sessionStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
refreshAdminUI();
refreshSubjects();
