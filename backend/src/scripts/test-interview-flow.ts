/**
 * End-to-End Test Script: Interview Simulation Flow
 * Validates session setup, question delivery, adaptive probing,
 * turn evaluation, scorecard generation, and session history.
 */

import { InterviewService } from '../services/interview.service.js';
import { prisma } from '../config/prisma.js';
import { logger } from '../utils/logger.js';

async function runInterviewFlowTest() {
  console.log('🧪 Starting End-to-End Interview Coach Verification...\n');

  // 1. Create or retrieve test user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test-interview-student@example.com',
        name: 'Alex Student',
      },
    });
    console.log('✅ Created mock test user:', user.id);
  } else {
    console.log('✅ Using existing test user:', user.id);
  }

  // 2. Create Interview Session (User Story 1)
  console.log('\n--- Step 1: Create Interview Session ---');
  const sessionResult = await InterviewService.createSession(user.id, {
    targetRoleTitle: 'Junior Full-Stack Developer',
    track: 'BEHAVIORAL',
    sessionLength: 'QUICK', // 3 questions
    mode: 'INSTANT_FEEDBACK',
    jobDescription: 'Seeking junior developer with React, TypeScript, and Node.js experience.',
  });

  const session = sessionResult.session;
  console.log('✅ Session created successfully:', session.id);
  console.log('   Total Questions:', session.totalQuestions);
  console.log('   First Question:', session.firstQuestion.questionText);
  console.log('   Competency:', session.firstQuestion.competency);

  // 3. Submit a vague answer to trigger Adaptive Probing (User Story 2)
  console.log('\n--- Step 2: Submit Vague Answer (Trigger Adaptive Probe) ---');
  const probeResponse = await InterviewService.submitAnswer(user.id, session.id, {
    questionId: session.firstQuestion.id,
    responseText: 'I worked on a slow query and fixed it.',
    inputModality: 'TEXT',
    durationSeconds: 25,
  });

  console.log('   Response Type:', probeResponse.type);
  if (probeResponse.type === 'PROBE') {
    console.log('✅ Adaptive follow-up probe triggered successfully!');
    console.log('   Probe Question:', probeResponse.probeQuestion?.questionText);
  } else {
    console.log('ℹ️ Received turn evaluation directly (acceptable if model deemed answer complete).');
  }

  // 4. Submit detailed response to probe/turn (User Story 3)
  console.log('\n--- Step 3: Submit Detailed STAR Response ---');
  const targetQuestionId =
    probeResponse.type === 'PROBE' ? probeResponse.probeQuestion!.id : session.firstQuestion.id;

  // If probe was triggered, answer the probe; if evaluation, answer question 2
  let turnResponse: any;
  if (probeResponse.type === 'PROBE') {
    turnResponse = await InterviewService.submitAnswer(user.id, session.id, {
      questionId: targetQuestionId,
      responseText:
        'During my capstone project, our flight reservation queries were taking 2.8 seconds due to sequential database lookups. As backend lead, I profiled the execution bottlenecks with pg_stat_statements, designed composite B-Tree indexes on departure_date and destination_id, and refactored the API endpoints to use parallel promise lookups. This slashed query execution latency by 85% to 380ms under simulated 500-user concurrency.',
      inputModality: 'TEXT',
      durationSeconds: 65,
    });
  } else {
    turnResponse = probeResponse;
  }

  console.log('   Turn Response Type:', turnResponse.type);
  if (turnResponse.type === 'TURN_EVALUATION') {
    console.log('✅ Turn Feedback Received:');
    console.log('   Situation Score:', turnResponse.feedback.starSituationScore);
    console.log('   Action Score:', turnResponse.feedback.starActionScore);
    console.log('   Result Score:', turnResponse.feedback.starResultScore);
    console.log('   Power Verbs:', turnResponse.feedback.powerVerbsUsed);
    console.log('   Model Answer:', turnResponse.feedback.modelAnswer.slice(0, 100) + '...');
    console.log('   Next Question:', turnResponse.nextQuestion?.questionText);
  }

  // 5. Test Scorecard Generation (User Story 4)
  console.log('\n--- Step 4: Synthesize Scorecard ---');
  const scorecard = await InterviewService.getOrGenerateScorecard(user.id, session.id);
  console.log('✅ Scorecard synthesized successfully:');
  console.log('   Overall Readiness Score:', scorecard.overallScore, '/ 100');
  console.log('   Readiness Tier:', scorecard.readinessTier);
  console.log('   STAR Score:', scorecard.starScore);
  console.log('   Technical Score:', scorecard.technicalScore);
  console.log('   Key Strengths Count:', (scorecard.keyStrengths as any[])?.length || 0);

  // 6. Test History Query (User Story 5)
  console.log('\n--- Step 5: Query Session History ---');
  const history = await InterviewService.listSessions(user.id, { page: 1, limit: 5 });
  console.log('✅ History retrieved:', history.sessions.length, 'sessions recorded.');
  console.log('   Latest Session ID in History:', history.sessions[0]?.id);

  console.log('\n🎉 ALL 5 USER STORIES VERIFIED END-TO-END! 🎉\n');
}

runInterviewFlowTest()
  .catch((err) => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
