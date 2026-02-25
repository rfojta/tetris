# Modern JS Tetris

A fully functional, browser-based Tetris clone featuring levels, high scores, and a piece preview system.

## 🕹️ Game Controls

| Key | Action |
| --- | --- |
| **Left / Right Arrow** | Move piece horizontally |
| **Down Arrow** | Soft drop (increase falling speed) |
| **Up Arrow** | Rotate piece 90 degrees |
| **Spacebar** | **Hard Drop**: Instantly place piece at the bottom |
| **Escape (Esc)** | Pause or Resume the game |

## 🚀 Features

### 1. Dynamic Leveling & Difficulty

* **Progressive Speed**: The game starts at Level 1 with a falling speed of 500ms.
* **Difficulty Scaling**: Every **1,000 points** earned, the player advances to the next level.
* **Speed Increase**: With each new level, the falling interval decreases (calculated as `500 - (level * 40)ms`), capping at a minimum of 100ms.

### 2. Scoring & Combo System

Points are awarded based on the number of lines cleared simultaneously. The level act as a multiplier (e.g., Level 2 doubles the points):

* **1 Line**: 100 points
* **2 Lines**: 300 points
* **3 Lines**: 500 points
* **4 Lines (Tetris)**: 800 points

### 3. Piece Logic & Visuals

* **Color-Coded Pieces**: Seven distinct shapes (I, T, S, O, L, J, Z) are defined with unique CSS color classes.
* **Persistent Colors**: Once a piece is "fixed" (landed), its color remains on the grid until the line is cleared.
* **Next Piece Preview**: A $4 \times 4$ secondary grid displays the upcoming shape to allow for strategic planning.

### 4. High Score Leaderboard

* The game uses `localStorage` to save the top 5 scores directly in the user's browser.
* Scores are automatically sorted and updated upon a **Game Over** event.

## 🛠️ Technical Structure

The project is structured into three main components:

* **`field` Object**: Manages the game state, grid content (a 2D array), scoring, level logic, and the game loop.
* **`Piece` Constructor**: Handles individual block rotations, collision detection (`canMove`), and rendering to the HTML table.
* **CSS Classes**: Uses specific classes (`.color-0` through `.color-6`) to apply distinct background colors and "inset" border styles to simulate a 3D block effect.

## 📦 Installation

No build process is required.

1. Copy the code into an `.html` file.
2. Open the file in any modern web browser.

---

**Would you like me to add a "Ghost Piece" feature that shows a shadow of where the piece will land?**