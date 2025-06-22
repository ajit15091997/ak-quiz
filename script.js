let currentAdmin = null;
let admins = [{ user: 'supremeAdmin', pass: 'supremePass', supreme: true }];
let questions = [];
let currentIdx = 0;

document.addEventListener('DOMContentLoaded', init);
function init() {
  document.getElementById('addQuestionForm').addEventListener('submit', handleAddQuestion);
  document.getElementById('prevBtn').addEventListener('click', showPrevQuestion);
  document.getElementById('nextBtn').addEventListener('click', showNextQuestion);
  document.getElementById('deleteQuestionBtn').addEventListener('click', eraseCurrentQuestion);
  document.getElementById('editQuestionBtn').addEventListener('click', editCurrentQuestion);
  document.getElementById('showAddAdminFormBtn').addEventListener('click', () => {
    document.getElementById('addAdminForm').style.display = 'block';
  });
  document.getElementById('addAdminForm').addEventListener('submit', handleAddAdmin);
  document.getElementById('logoutBtn').addEventListener('click', logoutAdmin);

  loginPrompt();
}

function loginPrompt() {
  const user = prompt('Admin Username:');
  const pass = prompt('Password:');
  const found = admins.find(a => a.user === user && a.pass === pass);
  if (!found) return alert('Invalid credentials'), loginPrompt();
  currentAdmin = found;
  document.getElementById('adminPanel').style.display = 'block';
  loadSubjects();
  showSections();
}

function loadSubjects() {
  const subs = [...new Set(questions.map(q => q.subject))];
  const sel = document.getElementById('subjectSelect');
  sel.innerHTML = '<option value="" disabled selected>Select Subject</option>';
  subs.forEach(s => sel.add(new Option(s, s)));
  sel.disabled = false;
  sel.onchange = () => loadChapters(sel.value);
}

function loadChapters(sub) {
  const chs = [...new Set(questions.filter(q => q.subject === sub).map(q => q.chapter))];
  const sel = document.getElementById('chapterSelect');
  sel.innerHTML = '<option value="" disabled selected>Select Chapter</option>';
  chs.forEach(c => sel.add(new Option(c, c)));
  sel.disabled = false;
  document.getElementById('deleteSubjectBtn').style.display = 'inline';
  sel.onchange = () => {
    document.getElementById('deleteChapterBtn').style.display = 'inline';
    loadQuestions(sub, sel.value);
  };
}

function loadQuestions(subject, chapter) {
  currentIdx = 0;
  document.getElementById('viewQuestionsSection').style.display = 'block';
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const q = questions.filter(q => q.subject === document.getElementById('subjectSelect').value &&
    q.chapter === document.getElementById('chapterSelect').value)[currentIdx];
  if (!q) return document.getElementById('questionViewer').innerHTML = 'No questions';
  document.getElementById('viewQuestionText').textContent = q.text;
  const opts = document.getElementById('viewOptions');
  opts.innerHTML = q.options.map((o,i) =>
    `<label><input name="ans" type="radio" value="${String.fromCharCode(65+i)}"> ${o}</label>`
  ).join('');
  opts.onchange = () => {
    const ans = opts.querySelector('input:checked').value;
    document.getElementById('viewExplanation').style.display = ans === q.correct && q.explanation ? 'block' : 'none';
    document.getElementById('viewExplanation').textContent = q.explanation || '';
  };
  document.getElementById('viewExplanation').style.display = 'none';
}

function showPrevQuestion() {
  if (currentIdx > 0) { currentIdx--; renderCurrentQuestion(); }
}
function showNextQuestion() {
  const arr = questions.filter(q => q.subject === document.getElementById('subjectSelect').value &&
    q.chapter === document.getElementById('chapterSelect').value);
  if (currentIdx < arr.length - 1) { currentIdx++; renderCurrentQuestion(); }
}

function handleAddQuestion(e) {
  e.preventDefault();
  const sub = subjectSelect.value;
  const chap = chapterSelect.value || prompt('Enter new chapter:');
  const text = questionText.value;
  const opts = Array.from(document.querySelectorAll('.option')).map(i => i.value);
  const corr = correctAnswer.value;
  const expl = explanationText.value.trim();
  questions.push({ subject: sub, chapter: chap, text, options: opts, correct: corr, explanation: expl });
  loadSubjects();
  alert('Added!');
  addQuestionForm.reset();
}

function eraseCurrentQuestion() {
  const sub = subjectSelect.value, chap = chapterSelect.value;
  const arr = questions.filter(q => q.subject === sub && q.chapter === chap);
  arr.splice(currentIdx, 1);
  loadQuestions(sub, chap);
}

function editCurrentQuestion() {
  alert('Editing not implemented in demo');
}

function handleAddAdmin(e) {
  e.preventDefault();
  if (!currentAdmin!.supreme) return alert('Only supreme can add admins');
  const u = newAdminUser.value, p = newAdminPass.value;
  admins.push({ user: u, pass: p, supreme: false });
  alert('Admin added!');
  addAdminForm.reset();
  addAdminForm.style.display = 'none';
}

function logoutAdmin() {
  currentAdmin = null;
  document.getElementById('adminPanel').style.display = 'none';
  loginPrompt();
}

function showSections() {
  document.getElementById('adminMgmtSection').style.display = currentAdmin.supreme ? 'block' : 'none';
                          }
