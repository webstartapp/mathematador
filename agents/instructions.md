# AI Agent Operating Procedures & Guidelines

This document outlines the standard operating procedures, architectural requirements, and role-based scopes for AI agents working in the **Mathematador** repository.

---

## 1. Agent Roles & Application Scopes

To keep development clean and prevent code bloat or scope creep, agents must align with one of the following roles:

*   **Planner / Product Owner**:
    *   **Scope**: Scoping, requirements validation, issue creation, design documentation, and release planning.
    *   **Focus**: Ensures task descriptions are clear, well-bounded, and align with business objectives before any code is modified.
*   **Backend Developer**:
    *   **Scope**: Anything under `server/` (migrations, db entities, API endpoints, resolvers, backend middleware).
    *   **Focus**: Focuses strictly on backend logic, data integrity, and REST API standards. Does not modify frontend components.
*   **GUI / Frontend Developer**:
    *   **Scope**: Anything under `mathematador-app/` (layouts, screens, minigames, user inputs, styles, animations, navigation).
    *   **Focus**: Focuses on aesthetics, layout, UX, and Redux state. Does not modify server API business logic.
*   **DevOps / QA**:
    *   **Scope**: Scripts under `agents/`, Github workflows, package updates, unit testing configuration.
    *   **Focus**: Ensuring compilation succeeds, linter passes, test suites are green, and PRs are structured correctly.

---

## 2. Core Architectural & Code Constraints

### package.json & Package Management
*   **Clean NPM only**: Do not use Yarn. Running Yarn or installing Yarn lockfiles is prohibited. Use `npm install`, `npm run test`, and `npm run lint`.

### Android Offline-First Capabilities
*   **Redux Persistence**: The React Native application must be offline-ready. Redux state must be persisted using `redux-persist` and `@react-native-async-storage/async-storage` (already configured in `store.ts`).
*   **Offline Gameplay**: Game configuration and progress data should be cached on phone memory. Prefer live API data when online, but if the network drops, the game must remain fully playable using the offline cached state.
*   **Online-Only Features**: Gated features such as registration, payments, and ads must fail gracefully with appropriate error UI when offline, without crashing the application.

---

## 3. Git Branching & Pull Request Policy

1.  **Base Branch**: All work is based on and must target the `develop` branch. Direct pushes to `develop` are discouraged (and protected in remote).
2.  **Branch Naming**: Feature branches must be created from `develop` and follow the pattern:
    `issue-<number>-<short-description>`
    *(Example: `issue-3-agentic-workflow-files`)*
3.  **PR Merging**: Pull Requests must target `develop` and require passing automated verification checks before human approval and merge.
4.  **Push Policy**: Pushes to branches other than `develop` (i.e. feature branches like `issue-*`) are always pre-approved and should be run directly by agents.

---

## 4. Step-by-Step Agent Development Loop

### Step 1: Read the Issue
*   Fetch the assigned issue from GitHub or local issue tracker.
*   Clearly understand the requirements and boundaries. Build **only** what the issue describes.

### Step 2: Set Up Local Branch
*   Run the raw Git commands:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b issue-<number>-<short-description>
    ```
*   *(Optional: If the environment has full script execution allowed, you may use `node agents/issue-helper.js checkout <number> [description]` as a shortcut).*

### Step 3: Implement & Develop
*   Write clean, modular code adhering to the repository style and roles.
*   Do not leave placeholder code or comments.

### Step 4: Verify Locally
*   Run the verification commands individually in their respective directories:
    *   **In `mathematador-app/`**:
        ```bash
        npm install
        npm run lint
        npm test -- --watchAll=false
        ```
    *   **In `server/`**:
        ```bash
        npm install
        npm run lint
        npm test
        ```
*   Ensure all tests and lint checks are **100% green** before moving to the next step.
*   *(Optional: If the environment has full script execution allowed, you may run `node agents/verify.js` to run all verification steps automatically).*

### Step 5: Submit PR
*   Commit and push changes to the remote origin:
    ```bash
    git add .
    git commit -m "Resolve Issue #<number>: <description>"
    git push -u origin issue-<number>-<short-description>
    ```
*   Create a Pull Request on GitHub targeting the `develop` branch (include `Closes #<number>` in the description) using the GitHub Web UI or MCP server tools.
*   *(Optional: If the environment has full script execution allowed and a GITHUB_TOKEN is available, you may run `node agents/submit-pr.js` to automate pushing and PR creation).*

