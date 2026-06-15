# Game Structure: *Mathematador*

This document outlines the architecture, game modes, and minigame types in **Mathematador**, describing how the current system is designed and how new modes integrate with it.

---

## 🏗️ 1. Architecture Overview

Mathematador is built as a TypeScript monorepo with an offline-first mobile client and a synchronization backend:

```mermaid
graph TD
    subgraph Frontend [React Native / Expo App]
        Redux[Redux Store / slices]
        Persist[Redux Persist / AsyncStorage]
        UI[Screens / Components]
    end

    subgraph Backend [Express / Knex Server]
        API[Express Routes]
        Knex[Knex DB Builder]
        DB[(PostgreSQL Database)]
    end

    UI <--> Redux
    Redux <--> Persist
    UI -- Orval API Client --> API
    API <--> Knex
    Knex <--> DB
```

1. **Frontend App (`mathematador-app/`)**:
   - Built on React Native and Expo.
   - Uses **Redux Toolkit** for local state and **Redux Persist** (with AsyncStorage) for offline-first gameplay persistence.
   - Integrates with the backend using an **Orval-generated client** (`_generated/api.ts`).
2. **Backend Server (`server/`)**:
   - Express server with TypeScript.
   - Uses **Knex.js** for migrations, seeding, and database queries (targeting PostgreSQL/SQLite).

---

## 🎮 2. Game Modes

### A. Standard Mode (Operation Challenges)
*   **Description**: Players practice and level up in individual arithmetic operations: Addition, Subtraction, Multiplication, and Division.
*   **Structure**:
    - Each operation has its own level and XP track stored in `operation_progress`.
    - Starting a challenge generates a session with **10 exercises** scaling in size and complexity according to the player's level.
    - Default settings: 60-second limit, 3 allowed mistakes.
    - Completing a challenge rewards XP and Coins, and unlocks the next challenge level.

### B. *La Gran Corrida* (Endless Gauntlet) – *NEW*
*   **Description**: An intense, survival-based gauntlet mode designed to test speed and versatility.
*   **Structure**:
    - Operation type is `gauntlet`.
    - Automatically mixes all 4 basic operations (Addition, Subtraction, Multiplication, Division) within a single challenge session.
    - Enhanced difficulty constraints: 45-second timer limit, 2 allowed mistakes.
    - Leveling up increases formula complexity and speeds up the countdown timer.
    - High rewards: 35 XP and 25 Coins per wave.

### C. *La Corrida Diaria* (Daily Challenge) – *NEW*
*   **Description**: A fixed-preset daily challenge with high stakes to drive engagement and retention.
*   **Structure**:
    - Operation type is `daily_challenge`.
    - 20 equations, 90-second limit, and 0 allowed mistakes (1 life).
    - Features global daily leaderboards and rewards a 50-coin completion bonus plus a 5% chance of exclusive daily cosmetic drops.

---

## 🧩 3. Minigames (Layout Templates)

Minigames define the user interface and input mechanics used to solve the generated exercises. The system is designed to be highly modular, routing challenge sessions to their respective layout components based on the `minigame` attribute.

```mermaid
classDiagram
    class Challenge {
        +string operationId
        +string minigame
        +Exercise[] exercises
    }
    class MinigameConfig {
        +string id
        +string name
        +Component component
    }
    Challenge --> MinigameConfig : routes to
```

### Supported & Planned Minigames:

| Minigame ID | Public Name | Status | Description |
| :--- | :--- | :--- | :--- |
| **`SingleLineMinigame`** | *Mathematical Sprint* | **Implemented** | Traditional input view. The equation is displayed on screen, and the player uses a custom numeric grid keyboard to input digits. |
| **`dragAndDrop`** | *Arithmetic Drag* | *Planned (in Schema)* | Drag-and-drop tiles containing numbers or operators into empty placeholders to complete equations. |
| **`crossNumbers`** | *Cross-Math* | *Planned (in Schema)* | Fill out a crossword-like grid of interconnected equations. |
| **`memory`** | *Equation Match* | *Planned (in Schema)* | Turn cards to match expressions with their correct numerical solutions. |

---

## 📐 4. Fitting the New Features

The proposed **El Coliseo de los Números** features (Endless Gauntlet, Cosmetics Store, and Toro Assists) fit cleanly into this existing design:

1. **Gauntlet & Daily Challenge Integration**:
   - The Endless Gauntlet uses `operationId: "gauntlet"` and the Daily Challenge uses `operationId: "daily_challenge"`.
   - Both reuse the existing `SingleLineMinigame` layouts, allowing rapid development by wrapping standard minigame components.
2. **Toro Assists Integration**:
   - Add the Toro companion panel as a wrapper component inside `ChallengeGameScreen.tsx`.
   - The panel captures correct/incorrect responses to fill the cooperation meter, manages the Toro Focus (timer freeze), and renders Toro Hints based on the current equation.
3. **Cosmetics & Store**:
   - Store inventory and purchases are managed via the new database tables (`cosmetics`, `user_cosmetics`).
   - The client fetches cosmetics and displays them in a dedicated navigation screen (`TiendaScreen.tsx`), updating Redux state and storing equipped items to style the game screens.
4. **Multi-Dimensional Progression**:
   - The system tracks progression along two distinct dimensions: mathematical operations (`operation_progress`) and interaction minigames (`minigame_progress`).
   - This lets a player level up their arithmetic (addition, division) and their input dexterity (speed sprinting, drag-and-drop) independently.
