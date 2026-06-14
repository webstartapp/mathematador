const { execSync } = require('child_process');

function getBranchName() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

const branchName = getBranchName();
if (branchName === 'develop' || branchName === 'main') {
  console.error('[ERROR] You are on a protected branch. Please checkout a feature branch first.');
  process.exit(1);
}

const match = branchName.match(/^issue-(\d+)-(.+)$/);
if (!match) {
  console.error('[ERROR] Branch name must follow the pattern: issue-<number>-<description>');
  process.exit(1);
}

const issueNum = match[1];
const desc = match[2];

// Push branch to origin
console.log(`Pushing branch "${branchName}" to origin...`);
try {
  execSync(`git push -u origin ${branchName}`, { stdio: 'inherit' });
} catch (error) {
  console.error('[ERROR] Failed to push branch:', error.message);
  process.exit(1);
}

const prTitle = `Resolve Issue #${issueNum}: ${desc.replace(/-/g, ' ')}`;
const prBody = `Closes #${issueNum}\n\nThis PR was automatically created by the agentic workflow after verification tests passed successfully.`;

// Check for GITHUB_TOKEN or GH_TOKEN
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (token) {
  console.log('\n[INFO] GITHUB_TOKEN found. Creating Pull Request automatically...');
  let remoteUrl = '';
  try {
    remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('[ERROR] Could not get remote url:', e.message);
    process.exit(1);
  }

  const repoMatch = remoteUrl.match(/github\.com[/:]([^/]+)\/([^.]+)/);
  if (!repoMatch) {
    console.error('[ERROR] Failed to parse owner/repo from remote URL:', remoteUrl);
    process.exit(1);
  }

  const owner = repoMatch[1];
  const repo = repoMatch[2];

  console.log(`Target Repository: ${owner}/${repo}`);
  console.log(`PR Title: ${prTitle}`);

  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  const data = {
    title: prTitle,
    body: prBody,
    head: branchName,
    base: 'develop',
  };

  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'NodeJS-Fetch-Agent'
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) {
      return res.text().then(text => {
        throw new Error(`GitHub API error: ${res.status} - ${text}`);
      });
    }
    return res.json();
  })
  .then(json => {
    console.log(`\n[SUCCESS] Pull Request created successfully!`);
    console.log(`PR URL: ${json.html_url}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(`[ERROR] Failed to create PR via API:`, err.message);
    printManualInstructions();
    process.exit(1);
  });
} else {
  printManualInstructions();
  process.exit(0);
}

function printManualInstructions() {
  console.log('\n=========================================');
  console.log('[INFO] No GITHUB_TOKEN environment variable found.');
  console.log('Please create the Pull Request manually using the details below:');
  console.log(`- Title: ${prTitle}`);
  console.log(`- Description: ${prBody}`);
  console.log(`- Base branch: develop`);
  console.log(`- Head branch: ${branchName}`);
  console.log('=========================================');
}
