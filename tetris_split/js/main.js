import { Field } from './Field.js';

const field = new Field();

function bindControls() {
  const newGameBtn = document.getElementById('new-game-btn');
  newGameBtn.addEventListener('click', () => field.resetGame());

  window.addEventListener('keydown', (e) => {
    // If demo is running, any key press takes over control
    if (field.isDemoMode) {
      field.stopAutopilot();
      field.resetGame();
      return;
    }

    if (!field.isRunning || field.isAutoActive) return;

    switch (e.keyCode) {
      case 37: field.piece?.move(-1, 0); break; // left
      case 39: field.piece?.move(1, 0); break;  // right
      case 40: field.piece?.move(0, 1); break;  // down
      case 38: field.piece?.rotate(); break;     // up
      case 32: { // space = hard drop
        e.preventDefault();
        while (field.piece?.move(0, 1)) {}
        break;
      }
      case 65: field.startAutopilot(); break;    // A = autopilot
      default: break;
    }
  });
}

field.init();
bindControls();

// Expose for quick debugging in console (optional)
window.tetris = { field };
