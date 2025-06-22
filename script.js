const subjectSelect = document.getElementById('subjectSelect');
const chapterSelect = document.getElementById('chapterSelect');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const explanationText = document.getElementById('explanationText');
const quizArea = document.getElementById('quizArea');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const logoutSection = document.getElementById('logoutSection');

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

const addNewAdminBtn = document.getElementById('addNewAdminBtn');
const addAdminForm = document.getElementById('addAdminForm');
const newAdminUsername = document.getElementById('newAdminUsername');
const newAdminPassword = document.getElementById('newAdminPassword');
const createAdminBtn = document.getElementById('createAdminBtn');
const cancelCreateAdminBtn = document.getElementById('cancelCreateAdminBtn');

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const username = document.getElementById('username');
const password = document.getElementById('password');
const loginError = document.getElementById('loginError');

let currentQuestions = [];
let currentQuestionIndex = 0;

loginBtn.addEventListener('click', () => {
  if (username.value === 'ajitquiz@53' && password.value === 'ajit@15091997') {
    localStorage.setItem('isAdmin', 'true');
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    logoutSection.style.display = 'block';
    addNewAdminBtn.style.display = 'block';
    fetchSubjects();
  } else {
    loginError.innerText = 'Invalid Credentials ❌';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('isAdmin');
  location.reload();
});

addQuestionBtn.addEventListener('click', async () => {
  const payload = {
    subject: newSubject.value,
    chapter: newChapter.value,
    question: newQuestion.value,
    options: [option1.value, option2.value, option3.value, option4.value],
    correct: correctAnswer.value,
    explanation: answerExplanation.value.trim()
  };
  if (!payload.subject || !payload.chapter || !payload.question || payload.options.includes('') || !payload.correct) {
    alert('Please fill all mandatory fields');
    return;
  }
  await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  alert('Question added!');
  [newSubject, newChapter, newQuestion, option1, option2, option3, option4, correctAnswer, answerExplanation]
    .forEach(el => el.value = '');
  fetchSubjects();
});

subjectSelect.addEventListener('change', async () => {
  const subject = subjectSelect.value;
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  if (!subject) return;
  const chapters = await fetch(`/api/subjects/${subject}/chapters`).then(r => r.json());
  chapters.forEach(ch => {
    const opt = document.createElement('option');
    opt.value = ch;
    opt.innerText = ch;
    chapterSelect.appendChild(opt);
  });
  chapterSelect.disabled = false;
  deleteSubject.style.display = 'inline-block';
});

chapterSelect.addEventListener('change', async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  if (!chapter) return;
  deleteChapter.style.display = 'inline-block';
  currentQuestions = await fetch(`/api/subjects/${subject}/chapters/${chapter}/questions`).then(r => r.json());
  currentQuestionIndex = 0;
  loadQuestion();
  quizArea.style.display = 'block';
});

function loadQuestion() {
  optionsEl.innerHTML = '';
  explanationText.style.display = 'none';
  const q = currentQuestions[currentQuestionIndex];
  if (!q) return;
  questionEl.innerText = q.question;
  q.options.forEach(opt => {
    const div = document.createElement('div');
    div.className = 'option';
    div.innerText = opt;
    div.onclick = () => {
      if (opt === q.correct) {
        div.classList.add('correct');
        if (q.explanation) {
          explanationText.innerText = q.explanation;
          explanationText.style.display = 'block';
        }
      } else {
        div.classList.add('wrong');
      }
    };
    optionsEl.appendChild(div);
  });
}

prevBtn.onclick = () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
};
nextBtn.onclick = () => {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
};

addNewAdminBtn.onclick = () => addAdminForm.style.display = 'block';
cancelCreateAdminBtn.onclick = () => addAdminForm.style.display = 'none';
createAdminBtn.onclick = () => {
  alert('Admin added (backend not implemented)');
  addAdminForm.style.display = 'none';
};

function fetchSubjects() {
  fetch('/api/subjects')
    .then(res => res.json())
    .then(subjects => {
      subjectSelect.innerHTML = '<option value="">Select Subject</option>';
      subjects.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.innerText = sub;
        subjectSelect.appendChild(opt);
      });
    });
  }
