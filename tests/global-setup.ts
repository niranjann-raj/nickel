import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const backendDir = path.resolve(process.cwd(), 'backend');
  console.log('--- Initializing Playwright Test Fixtures ---');
  try {
    execSync('python seed_tracker_test_user.py', { cwd: backendDir, stdio: 'inherit' });
    execSync('python seed_delete_test_user.py', { cwd: backendDir, stdio: 'inherit' });
    console.log('--- Playwright Test Fixtures Seeded Successfully ---');
  } catch (error) {
    console.error('Failed to seed test users in global setup:', error);
  }
}

