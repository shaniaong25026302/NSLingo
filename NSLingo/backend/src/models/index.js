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
    // Simple admin flag used to gate forum moderation routes (list reports,
    // delete content). There was no existing role system, so this is the
    // "simple check" — set isAdmin: true on a user in MongoDB to make them
    // a moderator. (Flagged to the team — see requireAdmin in middleware/auth.js.)
    isAdmin: { type: Boolean, default: false },
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

/* ============================================================
   COMMUNITY FORUM MODELS
   Users post & discuss NS experiences. Posts publish immediately
   (no approval queue); moderation is reactive (users report,
   admins remove). Comments allow exactly ONE level of nesting.
   ============================================================ */

/* ---------- forumPosts ---------- */
const forumPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // Which corner of NS life the post is about.
    topic: {
      type: String,
      enum: ['stories', 'bmt', 'vocation', 'tips', 'general'],
      default: 'general',
    },
    // Denormalised counts so the feed doesn't have to count rows every load.
    upvotes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true } // adds createdAt + updatedAt
)

/* ---------- comments ---------- */
const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'ForumPost', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    // null  => top-level comment.
    // set   => a reply to that comment. We only ever allow ONE level, so a
    //          reply's parentComment always points at a top-level comment.
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
)

/* ---------- votes ----------
   One row per (user, target). Works for both posts and comments.
   The unique compound index makes it impossible to double-vote: a second
   insert for the same trio throws, so a user can only ever hold one vote. */
const voteSchema = new Schema(
  {
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)
voteSchema.index({ targetType: 1, targetId: 1, user: 1 }, { unique: true })

/* ---------- reports ----------
   A user flags a post/comment for a moderator to review. */
const reportSchema = new Schema(
  {
    targetType: { type: String, enum: ['post', 'comment'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, default: '' },
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

// Community forum
export const ForumPost = model('ForumPost', forumPostSchema)
export const Comment = model('Comment', commentSchema)
export const Vote = model('Vote', voteSchema)
export const Report = model('Report', reportSchema)
