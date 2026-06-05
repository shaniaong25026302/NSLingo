import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from './config/db.js'
import {
  DictionaryTerm, Module, QuizQuestion, TranslationExample, Badge, User, UserProgress,
} from './models/index.js'
import * as data from './data/seedData.js'

async function seed() {
  await connectDB()
  console.log('🌱 Seeding NSLingo database…')

  // Clear existing content (idempotent re-seed).
  await Promise.all([
    DictionaryTerm.deleteMany({}),
    Module.deleteMany({}),
    QuizQuestion.deleteMany({}),
    TranslationExample.deleteMany({}),
    Badge.deleteMany({}),
  ])

  await DictionaryTerm.insertMany(data.dictionaryTerms)
  await Module.insertMany(data.modules)
  await QuizQuestion.insertMany(data.quizQuestions)
  await TranslationExample.insertMany(data.translationExamples)
  await Badge.insertMany(data.badges)
  console.log(
    `   • ${data.dictionaryTerms.length} terms, ${data.modules.length} modules, ` +
    `${data.quizQuestions.length} quiz questions, ${data.badges.length} badges`
  )

  // Demo user + progress (upsert so re-seeding doesn't duplicate).
  const passwordHash = await bcrypt.hash(data.demoUser.password, 10)
  const user = await User.findOneAndUpdate(
    { email: data.demoUser.email },
    { $set: { passwordHash, name: data.demoUser.name } },
    { new: true, upsert: true }
  )
  await UserProgress.findOneAndUpdate(
    { user: user._id },
    { $set: { ...data.demoProgress, user: user._id } },
    { upsert: true }
  )
  console.log(`   • demo user: ${data.demoUser.email} / ${data.demoUser.password}`)

  await mongoose.disconnect()
  console.log('✅ Seed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
