// server.js

const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());
app.use(express.static('public'));

// ✅ MongoDB Connection (your provided URI)
mongoose.connect('mongodb+srv://ajitkumarram531049:ajit%531049@cluster0.epklfsy.mongodb.net/quizDB?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected to Cluster0'))
  .catch(err => console.error('❌ MongoDB connect failed:', err));

// 🧠 Mongoose Schema
const questionSchema = new mongoose.Schema({
  subject: String,
  chapter: String,
  question: String,
  options: [String],
  correct: String,
  explanation: String
});

const Question = mongoose.model('Question', questionSchema);

// 📌 Get all subjects
app.get('/api/subjects', async (req, res) => {
  const subjects = await Question.distinct('subject');
  res.json(subjects);
});

// 📌 Get chapters of a subject
app.get('/api/subjects/:subject/chapters', async (req, res) => {
  const chapters = await Question.find({ subject: req.params.subject }).distinct('chapter');
  res.json(chapters);
});

// 📌 Get questions for subject + chapter
app.get('/api/subjects/:subject/chapters/:chapter/questions', async (req, res) => {
  const questions = await Question.find({
    subject: req.params.subject,
    chapter: req.params.chapter
  }, '-__v -_id -subject -chapter');
  res.json(questions);
});

// 📌 Add new question
app.post('/api/questions', async (req, res) => {
  try {
    const q = new Question(req.body);
    await q.save();
    res.status(201).json({ message: 'Question added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🚀 Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
