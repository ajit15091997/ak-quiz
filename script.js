const BASE_URL = "https://akquiz-backend-dsjt.onrender.com";

let token = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;

// DOM elements
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

// --- Data Fetch ---
async function fetchSubjects() {
  const res = await fetch(`${BASE_URL}/api/subjects`);
  const subs = await res.json();
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  subs.forEach(s => {
    const o = document.createElement('option');
    o.value = s; o.innerText = s;
    subjectSelect.appendChild(o);
  });
}

// Similar fetchChapters, fetchQuestions

// --- Add Question (explanation optional) ---
addQuestionBtn.addEventListener('click', async () => {
  const payload = {
    subject: newSubject.value.trim(),
    chapter: newChapter.value.trim(),
    question: newQuestion.value.trim(),
    options: [option1.value, option2.value, option3.value, option4.value],
    correct: correctAnswer.value.trim(),
    explanation: answerExplanation.value.trim()  // empty allowed
  };
  if (!payload.subject||!payload.chapter||!payload.question||payload.options.some(o=>!o)||!payload.correct) {
    return alert("Fill Subject, Chapter, Question, Options & Correct");
  }
  const res = await fetch(`${BASE_URL}/api/questions`, {
    method:"POST",
    headers: {
      "Content-Type":"application/json",
      "Authorization":`Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if(res.ok) {
    alert("Added");
    // clear fields, fetchSubjects
  } else alert(await res.json().error);
});

// --- Delete Subject ---
deleteSubjectBtn.addEventListener('click', async () => {
  const sub = subjectSelect.value;
  if(!sub || !confirm(`Delete subject "${sub}"?`)) return;
  const res = await fetch(`${BASE_URL}/api/subjects/${sub}`, {
    method:"DELETE",
    headers:{"Authorization":`Bearer ${token}`}
  });
  if(res.ok) { alert("Deleted"); fetchSubjects(); }
  else alert(await res.json().error);
});

// --- Delete Chapter ---
deleteChapterBtn.addEventListener('click', async () => {
  const sub=subjectSelect.value, ch=chapterSelect.value;
  if(!sub||!ch||!confirm(`Delete "${ch}"?`)) return;
  const res = await fetch(`${BASE_URL}/api/subjects/${sub}/chapters/${ch}`, {
    method:"DELETE", headers:{"Authorization":`Bearer ${token}`}
  });
  if(res.ok){alert("Deleted"); subjectSelect.dispatchEvent(new Event('change'));}
});

// --- Delete Question ---
deleteQuestionBtn.addEventListener('click', async () => {
  const sub=subjectSelect.value, ch=chapterSelect.value;
  const id = currentQuestions[currentQuestionIndex]._id;
  if(!confirm("Delete this question?")) return;
  const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
    method:"DELETE", headers:{"Authorization":`Bearer ${token}`}
  });
  if(res.ok){alert("Deleted"); currentQuestions.splice(currentQuestionIndex,1); loadQuestion(); }
});

// --- Edit Question ---
editQuestionBtn.addEventListener('click', () => {
  const q = currentQuestions[currentQuestionIndex];
  // populate edit form
  adminPanel.style.display="none";
  quizArea.style.display="none";
  editForm.style.display="block";
});
saveEditBtn.addEventListener('click', async () => {
  const id = currentQuestions[currentQuestionIndex]._id;
  const payload = {
    question: editQuestionText.value.trim(),
    options: [editOption1.value, editOption2.value, editOption3.value, editOption4.value],
    correct: editCorrectAnswer.value.trim(),
    explanation: editExplanation.value.trim()
  };
  const res = await fetch(`${BASE_URL}/api/questions/${id}`, {
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });
  if(res.ok) {
    currentQuestions[currentQuestionIndex] = await res.json();
    alert("Updated");
    editForm.style.display="none";
    quizArea.style.display="block";
    loadQuestion();
  } else alert(await res.json().error);
});
cancelEditBtn.addEventListener('click', ()=>{
  editForm.style.display="none"; quizArea.style.display="block";
});

// --- Rest of quiz logic (loadQuestion, selectOption, navigation, restart) remains same ---

// --- Login / Logout ---
loginBtn.addEventListener('click', async () => {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({username: usernameInput.value.trim(), password: passwordInput.value.trim()})
  });
  if(res.ok) {
    token = (await res.json()).token;
    toggleAdmin(true);
  } else loginError.innerText = "Invalid";
});
logoutBtn.addEventListener('click', ()=>{
  token = null; toggleAdmin(false);
});
function toggleAdmin(isAdmin) {
  adminPanel.style.display = isAdmin?"block":"none";
  logoutSection.style.display = isAdmin?"block":"none";
  loginForm.style.display = isAdmin?"none":"block";
  const style = isAdmin?"inline-block":"none";
  deleteSubjectBtn.style.display = style;
  deleteChapterBtn.style.display = style;
  deleteQuestionBtn.style.display = style;
  editQuestionBtn.style.display = style;
}

// --- Initialization ---
window.onload = () => {
  fetchSubjects();
  toggleAdmin(false);
};
