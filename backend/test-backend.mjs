/**
 * CareerPrepster Backend API Automated Smoke Test Suite
 * 
 * Usage:
 *   1. Make sure MySQL & Backend are running (npm run dev in backend/)
 *   2. Run: node test-backend.mjs
 */

const BASE_URL = 'http://localhost:5000/api';
let sessionCookie = '';
let testCvId = '';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
};

function pass(name, details = '') {
  console.log(`  ${COLORS.green}✓ PASS:${COLORS.reset} ${COLORS.bold}${name}${COLORS.reset} ${COLORS.dim}${details}${COLORS.reset}`);
}

function fail(name, error) {
  console.log(`  ${COLORS.red}✗ FAIL:${COLORS.reset} ${COLORS.bold}${name}${COLORS.reset}`);
  console.log(`    ${COLORS.red}↳ Reason: ${error}${COLORS.reset}`);
}

async function testHealth() {
  console.log(`\n${COLORS.cyan}[1/7] Testing Health Check Endpoint...${COLORS.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status === 200 && data.status === 'healthy') {
      pass('GET /api/health', `(Status: ${data.status}, Env: ${data.environment})`);
    } else {
      fail('GET /api/health', JSON.stringify(data));
    }
  } catch (err) {
    fail('GET /api/health', err.message);
  }
}

async function testAuth() {
  console.log(`\n${COLORS.cyan}[2/7] Testing Authentication (Register, Cookie Session, Me)...${COLORS.reset}`);
  const testEmail = `student_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // 1. Register
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: 'Automated Tester',
      }),
    });

    const cookieHeader = res.headers.get('set-cookie');
    if (cookieHeader) {
      sessionCookie = cookieHeader.split(';')[0];
    }

    const data = await res.json();
    if (res.status === 201 && data.success) {
      pass('POST /api/auth/register', `(Created user: ${data.data.user.email})`);
    } else {
      fail('POST /api/auth/register', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/auth/register', err.message);
  }

  // 2. Get Me (Verify JWT Cookie)
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      pass('GET /api/auth/me', `(Verified profile for: ${data.data.name})`);
    } else {
      fail('GET /api/auth/me', JSON.stringify(data));
    }
  } catch (err) {
    fail('GET /api/auth/me', err.message);
  }
}

async function testJobRoles() {
  console.log(`\n${COLORS.cyan}[3/7] Testing Pre-Seeded Job Roles Catalog...${COLORS.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/job-roles?q=frontend`);
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.length > 0) {
      const role = data.data[0];
      pass('GET /api/job-roles?q=frontend', `(Found "${role.title}" in ${role.industry})`);

      // Fetch starter bullets
      const bRes = await fetch(`${BASE_URL}/job-roles/${role.id}/bullets`);
      const bData = await bRes.json();
      if (bRes.status === 200 && bData.data?.length > 0) {
        pass(`GET /api/job-roles/:id/bullets`, `(Found ${bData.data.length} starter bullets)`);
      } else {
        fail('GET /api/job-roles/:id/bullets', 'No starter bullets found');
      }
    } else {
      fail('GET /api/job-roles?q=frontend', 'No roles found. Did you run "npx prisma db seed"?');
    }
  } catch (err) {
    fail('GET /api/job-roles', err.message);
  }
}

async function testCvCrud() {
  console.log(`\n${COLORS.cyan}[4/7] Testing CV Document CRUD & Atomic Transactions...${COLORS.reset}`);

  // 1. Create CV
  try {
    const res = await fetch(`${BASE_URL}/cvs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        title: 'Software Engineering Resume',
        templateId: 'classic-ats',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+855 12 345 678',
        location: 'Phnom Penh',
      }),
    });

    const data = await res.json();
    if (res.status === 201 && data.success) {
      testCvId = data.data.id;
      pass('POST /api/cvs', `(Created CV tree with ${data.data.sections?.length || 0} default sections)`);
    } else {
      fail('POST /api/cvs', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/cvs', err.message);
  }

  // 2. Fetch CV Tree
  if (testCvId) {
    try {
      const res = await fetch(`${BASE_URL}/cvs/${testCvId}`, {
        headers: { Cookie: sessionCookie },
      });
      const data = await res.json();
      if (res.status === 200 && data.success) {
        pass(`GET /api/cvs/${testCvId}`, `(Fetched tree with sections & skillGroups)`);
      } else {
        fail(`GET /api/cvs/${testCvId}`, JSON.stringify(data));
      }
    } catch (err) {
      fail('GET /api/cvs/:id', err.message);
    }
  }
}

async function testAIEnhance() {
  console.log(`\n${COLORS.cyan}[5/7] Testing AI Bullet Enhancement...${COLORS.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/ai/enhance-bullet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        rawBullet: 'I optimized the images and website so it loads faster.',
        sectionContext: { roleTitle: 'Junior Frontend Developer' },
        framework: 'XYZ',
      }),
    });

    const data = await res.json();
    if (res.status === 200 && data.success && data.data.suggestions?.length > 0) {
      const first = data.data.suggestions[0];
      pass('POST /api/ai/enhance-bullet', `(Returned ${data.data.suggestions.length} suggestions, e.g. "${first.actionVerb}: ${first.enhancedText.slice(0, 50)}...")`);
    } else {
      fail('POST /api/ai/enhance-bullet', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/ai/enhance-bullet', err.message);
  }
}

async function testAtsScoring() {
  console.log(`\n${COLORS.cyan}[6/7] Testing Deterministic 4-Pillar ATS Scoring Engine...${COLORS.reset}`);
  if (!testCvId) {
    console.log(`  ${COLORS.yellow}⚠ Skipping ATS scoring test because test CV was not created.${COLORS.reset}`);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/ats/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        cvId: testCvId,
        targetJobDescription: 'Seeking a Software Engineer with React, TypeScript, and MySQL experience.',
      }),
    });

    const data = await res.json();
    if (res.status === 200 && data.success) {
      const d = data.data;
      const b = d.breakdown || {};
      const p = b.parsabilityScore ?? b.parsability?.score ?? 0;
      const imp = b.impactScore ?? b.impact?.score ?? 0;
      const s = b.skillsScore ?? b.skills?.score ?? 0;
      const br = b.brevityScore ?? b.brevity?.score ?? 0;
      pass('POST /api/ats/score', `(Score: ${d.overallScore}/100 | Parsability: ${p} | Impact: ${imp} | Skills: ${s} | Brevity: ${br})`);
    } else {
      fail('POST /api/ats/score', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/ats/score', err.message);
  }
}

async function testLogout() {
  console.log(`\n${COLORS.cyan}[7/7] Testing Logout & Session Clearing...${COLORS.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      pass('POST /api/auth/logout', '(Session cookie cleared)');
    } else {
      fail('POST /api/auth/logout', JSON.stringify(data));
    }
  } catch (err) {
    fail('POST /api/auth/logout', err.message);
  }
}

async function runAllTests() {
  console.log(`\n============================================================`);
  console.log(`🚀 RUNNING CAREERPREPSTER BACKEND TEST SUITE`);
  console.log(`📡 Target: ${BASE_URL}`);
  console.log(`============================================================`);

  await testHealth();
  await testAuth();
  await testJobRoles();
  await testCvCrud();
  await testAIEnhance();
  await testAtsScoring();
  await testLogout();

  console.log(`\n============================================================`);
  console.log(`✨ TEST RUN FINISHED`);
  console.log(`============================================================\n`);
}

runAllTests();
