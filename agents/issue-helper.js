const { execSync } = require('child_process');

const args = process.argv.slice(2);
const command = args[0];

if (!command || command !== 'checkout') {
  console.log('Usage: node agents/issue-helper.js checkout <issue-number> [short-description]');
  process.exit(1);
}

const issueNum = args[1];
if (!issueNum || isNaN(Number(issueNum))) {
  console.error('Error: Please provide a valid issue number.');
  process.exit(1);
}

let desc = args[2] || 'work';
desc = desc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const branchName = desc ? `issue-${issueNum}-${desc}` : `issue-${issueNum}`;

try {
  // Check if dirty
  const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
  if (status) {
    console.warn('[WARNING] Working directory has uncommitted changes:\n' + status);
  }

  console.log('Checking out develop...');
  execSync('git checkout develop', { stdio: 'inherit' });

  console.log('Pulling latest changes on develop...');
  execSync('git pull origin develop', { stdio: 'inherit' });

  console.log(`Creating and checking out branch: ${branchName}...`);
  execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });

  console.log(`\n[SUCCESS] Successfully switched to branch: ${branchName}`);
} catch (error) {
  console.error('[ERROR] Failed to setup branch:', error.message);
  process.exit(1);
}
