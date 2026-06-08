import mongoose from 'mongoose'

const { Schema, model } = mongoose

/* ---------- dictionaryTerms ---------- */
const dictionaryTermSchema = new Schema({
  term: { type: String, required: true, index: true },
  meaning: { type: String, required: true },
  example: String,
  category: String,
})

/* ---------- modules (learning path + lessons) ---------- */
const lessonCardSchema = new Schema({ term: String, meaning: String }, { _id: false })
const lessonSchema = new Schema(
  {
    id: String,
    title: String,
    proTip: String,
    xp: Number,
    cards: [lessonCardSchema],
  },
  { _id: false }
)
const moduleSchema = new Schema({
  id: { type: String, required: true, unique: true }, // slug
  order: Number,
  title: String,
  icon: String,
  blurb: String,
  xp: Number,
  lessons: [lessonSchema],
})

/* ---------- quizQuestions ---------- */
const quizQuestionSchema = new Schema({
  moduleId: { type: String, required: true, index: true },
  speaker: String,
  scenario: String,
  question: String,
  options: [String],
  correctIndex: Number,
  feedback: String,
})

/* ---------- translationExamples ---------- */
const translationExampleSchema = new Schema({
  input: String,
  output: String,
})

/* ---------- badges ---------- */
const badgeSchema = new Schema({
  badgeId: { type: String, required: true, unique: true },
  emoji: String,
  title: String,
  desc: String,
  unlocked: { type: Boolean, default: false },
})

/* ---------- users ---------- */
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: String,
  },
  { timestamps: true }
)

/* ---------- userProgress ---------- */
const userProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    goal: { type: String, default: 'Regular' },
    readiness: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    totalXp: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    completedModules: { type: [String], default: [] },
    completedLessons: { type: [String], default: [] },
    weeklyActivity: { type: [Number], default: [0, 0, 0, 0, 0, 0, 0] },
    moduleProgress: { type: Schema.Types.Mixed, default: {} },
    // Best score per module quiz, e.g. { 'basic-commands': 3 } — prevents XP farming on retries.
    quizScores: { type: Schema.Types.Mixed, default: {} },
    // 'YYYY-MM-DD' of the user's last XP-earning activity — drives the streak.
    lastActiveDate: { type: String, default: null },
  },
  { timestamps: true }
)

export const DictionaryTerm = model('DictionaryTerm', dictionaryTermSchema)
export const Module = model('Module', moduleSchema)
export const QuizQuestion = model('QuizQuestion', quizQuestionSchema)
export const TranslationExample = model('TranslationExample', translationExampleSchema)
export const Badge = model('Badge', badgeSchema)
export const User = model('User', userSchema)
export const UserProgress = model('UserProgress', userProgressSchema)
