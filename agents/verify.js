const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'mathematador-app');
const serverDir = path.join(rootDir, 'server');

function checkNodeModules(dir) {
  return fs.existsSync(path.join(dir, 'node_modules'));
}

function runCommand(command, cwd) {
  console.log(`\n[EXEC] Running: "${command}" in ${path.relative(rootDir, cwd) || 'root'}`);
  try {
    execSync(command, { stdio: 'inherit', cwd });
    return true;
  } catch (error) {
    console.error(`[FAIL] Command failed: "${command}" in ${path.relative(rootDir, cwd) || 'root'}`);
    return false;
  }
}

function verify() {
  console.log('=== Starting Verification Cycle ===');

  // 1. Install dependencies for App
  if (!checkNodeModules(appDir)) {
    console.log('\n[INFO] App node_modules not found. Installing...');
    if (!runCommand('npm install', appDir)) {
      process.exit(1);
    }
  } else {
    console.log('\n[INFO] App node_modules already exists.');
  }

  // 2. Install dependencies for Server
  if (!checkNodeModules(serverDir)) {
    console.log('\n[INFO] Server node_modules not found. Installing...');
    if (!runCommand('npm install', serverDir)) {
      process.exit(1);
    }
  } else {
    console.log('\n[INFO] Server node_modules already exists.');
  }

  // 3. Lint App
  console.log('\n[INFO] Linting App...');
  const appLintPassed = runCommand('npm run lint', appDir);

  // 4. Lint Server
  console.log('\n[INFO] Linting Server...');
  const serverLintPassed = runCommand('npm run lint', serverDir);

  // 5. Test App
  console.log('\n[INFO] Testing App...');
  const appTestPassed = runCommand('npm test -- --watchAll=false', appDir);

  // 6. Test Server
  console.log('\n[INFO] Testing Server...');
  const serverTestPassed = runCommand('npm test', serverDir);

  console.log('\n=== Verification Summary ===');
  console.log(`App Lint:   ${appLintPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`Server Lint: ${serverLintPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`App Tests:  ${appTestPassed ? 'PASSED' : 'FAILED'}`);
  console.log(`Server Tests: ${serverTestPassed ? 'PASSED' : 'FAILED'}`);

  if (appLintPassed && serverLintPassed && appTestPassed && serverTestPassed) {
    console.log('\n[SUCCESS] All verifications passed successfully!');
    process.exit(0);
  } else {
    console.log('\n[FAILURE] One or more verification steps failed.');
    process.exit(1);
  }
}

verify();
