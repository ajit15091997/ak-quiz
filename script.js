const BASE_URL = "https://akquiz-backend-dsjt.onrender.com";

// ========== Global Variables ==========
const subjectSelect = document.getElementById("subjectSelect");
const chapterSelect = document.getElementById("chapterSelect");
const quizArea = document.getElementById("quizArea");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const explanationText = document.getElementById("explanationText");
const restartBtn = document.getElementById("restart");
const deleteSubjectBtn = document.getElementById("deleteSubject");
const deleteChapterBtn = document.getElementById("deleteChapter");
const deleteQuestionBtn = document.getElementById("deleteQuestion");
const editQuestionBtn = document.getElementById("editQuestion");
const scoreboardEl = document.getElementById("scoreboard");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const newSubject = document.getElementById("newSubject");
const newChapter = document.getElementById("newChapter");
const newQuestion = document.getElementById("newQuestion");
const option1 = document.getElementById("option1");
const option2 = document.getElementById("option2");
const option3 = document.getElementById("option3");
const option4 = document.getElementById("option4");
const correctAnswer = document.getElementById("correctAnswer");
const answerExplanation = document.getElementById("answerExplanation");
const addQuestionBtn = document.getElementById("addQuestion");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const adminPanel = document.getElementById("adminPanel");
const logoutSection = document.getElementById("logoutSection");
const logoutBtn = document.getElementById("logoutBtn");

let isAdmin = false;
let currentQuestions = [];
let currentQuestionIndex = 0;
let attempts = 0;
let score = 0;

// ========== Fetch Data ==========
async function fetchSubjects() {
  const res = await fetch(`${BASE_URL}/api/subjects`);
  const subjects = await res.json();
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  subjects.forEach((s) => {
    const o = document.createElement("option");
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

// ========== Add Question ==========
addQuestionBtn.addEventListener("click", async () => {
  const payload = {
    subject: newSubject.value.trim(),
    chapter: newChapter.value.trim(),
    question: newQuestion.value.trim(),
    options: [option1.value, option2.value, option3.value, option4.value],
    correct: correctAnswer.value.trim(),
    explanation: answerExplanation.value.trim(),
  };

  const res = await fetch(`${BASE_URL}/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    alert("Question added!");
    fetchSubjects();
    [newSubject, newChapter, newQuestion, option1, option2, option3, option4, correctAnswer, answerExplanation].forEach(i => i.value = "");
  } else {
    alert("Failed to add question.");
  }
});

// ========== Subject/Chapter Selection ==========
subjectSelect.addEventListener("change", async () => {
  const subject = subjectSelect.value;
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;

  deleteSubjectBtn.style.display = isAdmin && subject ? "inline-block" : "none";
  deleteChapterBtn.style.display = "none";

  if (subject) {
    const chapters = await fetchChapters(subject);
    chapters.forEach((c) => {
      const o = document.createElement("option");
      o.value = c;
      o.innerText = c;
      chapterSelect.appendChild(o);
    });
    chapterSelect.disabled = false;
  }
});

chapterSelect.addEventListener("change", async () => {
  const subject = subjectSelect.value;
  const chapter = chapterSelect.value;
  deleteChapterBtn.style.display = isAdmin && chapter ? "inline-block" : "none";

  if (chapter) {
    currentQuestions = await fetchQuestions(subject, chapter);
    currentQuestionIndex = 0;
    attempts = 0;
    score = 0;
    quizArea.style.display = "block";
    restartBtn.style.display = "inline-block";
    loadQuestion();
  }
});

// ========== Load Question ==========
function loadQuestion() {
  const q = currentQuestions[currentQuestionIndex];
  optionsEl.innerHTML = "";
  explanationText.style.display = "none";
  questionEl.innerText = q.question;

  q.options.forEach((opt) => {
    const div = document.createElement("div");
    div.classList.add("option");
    div.innerText = opt;
    div.addEventListener("click", () => selectOption(div, q.correct, q.explanation));
    optionsEl.appendChild(div);
  });

  deleteQuestionBtn.style.display = isAdmin ? "inline-block" : "none";
  editQuestionBtn.style.display = isAdmin ? "inline-block" : "none";
  prevBtn.style.display = "inline-block";
  nextBtn.style.display = "inline-block";

  scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
}

// ========== Select Option ==========
function selectOption(el, correct, explanation) {
  document.querySelectorAll(".option").forEach((o) => o.style.pointerEvents = "none");

  if (el.innerText === correct) {
    el.classList.add("correct");
    score++;
  } else {
    el.classList.add("wrong");
  }

  if (explanation && explanation.trim() !== "") {
    explanationText.innerText = `Explanation: ${explanation}`;
    explanationText.style.display = "block";
  } else {
    explanationText.style.display = "none";
  }

  attempts++;
  scoreboardEl.innerText = `Score: ${score} | Attempts: ${attempts}`;
}

// ========== Navigation ==========
prevBtn.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentQuestionIndex < currentQuestions.length - 1) {
    currentQuestionIndex++;
    loadQuestion();
  }
});

restartBtn.addEventListener("click", () => {
  subjectSelect.value = "";
  chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
  chapterSelect.disabled = true;
  quizArea.style.display = "none";
  scoreboardEl.innerText = "";
  fetchSubjects();
});

// ========== Admin Login ==========
loginBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  const res = await fetch(`${BASE_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const result = await res.json();
  if (res.ok && result.isAdmin) {
    isAdmin = true;
    toggleAdminView(true);
    alert("Login successful");
  } else {
    loginError.innerText = "Invalid Credentials";
  }
});

logoutBtn.addEventListener("click", () => {
  isAdmin = false;
  toggleAdminView(false);
  alert("Logged out");
});

function toggleAdminView(isAdminFlag) {
  isAdmin = isAdminFlag;
  adminPanel.style.display = isAdmin ? "block" : "none";
  logoutSection.style.display = isAdmin ? "block" : "none";
  loginForm.style.display = isAdmin ? "none" : "block";
  [deleteSubjectBtn, deleteChapterBtn, deleteQuestionBtn, editQuestionBtn].forEach(btn => {
    btn.style.display = isAdmin ? "inline-block" : "none";
  });
}

// ========== Initial Load ==========
window.onload = () => {
  fetchSubjects();
  toggleAdminView(false);
};
