import { Field } from './Field.js';

const field = new Field();

function resetGame() {
  clearTimeout(field.timer);
  field.stopAutopilot();
  field.resetInternalState();
  field.renderGrids();
  field.isDemoMode = false;
  field.isRunning = true;
  field.addPiece();
  field.step();
}

function handleGameAction(action) {
  if (field.isDemoMode) {
    field.stopAutopilot();
    resetGame();
    return;
  }

  if (!field.isRunning || field.isAutoActive || !field.piece) {
    return;
  }

  if (action === 'left') {
    field.piece.move(-1, 0);
  } else if (action === 'right') {
    field.piece.move(1, 0);
  } else if (action === 'down') {
    field.piece.move(0, 1);
  } else if (action === 'rotate') {
    field.piece.rotate();
  } else if (action === 'drop') {
    while (field.piece.move(0, 1)) {
      // Hard drop until piece can no longer move down.
    }
  } else if (action === 'autopilot') {
    field.startAutopilot();
  }
}

function bindUi() {
  const newGameBtn = document.getElementById('new-game-btn');
  if (newGameBtn) {
    newGameBtn.addEventListener('click', resetGame);
  }

  const mobileButtons = document.querySelectorAll('[data-action]');
  mobileButtons.forEach((button) => {
    const action = button.getAttribute('data-action');
    button.addEventListener('click', () => {
      handleGameAction(action);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
    }

    if (e.key === 'ArrowLeft') {
      handleGameAction('left');
    } else if (e.key === 'ArrowRight') {
      handleGameAction('right');
    } else if (e.key === 'ArrowDown') {
      handleGameAction('down');
    } else if (e.key === 'ArrowUp') {
      handleGameAction('rotate');
    } else if (e.key === ' ') {
      handleGameAction('drop');
    } else if (e.key.toLowerCase() === 'a') {
      handleGameAction('autopilot');
    }
  });
}

bindUi();
field.init();
