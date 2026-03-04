import { Board } from './board.js';
import { SHAPES, BLOCK_SIZE, COLORS } from './constants.js';

const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const board = new Board();

ctx.scale(BLOCK_SIZE, BLOCK_SIZE);

const player = {
    pos: { x: 3, y: 0 },
    matrix: SHAPES[Math.floor(Math.random() * SHAPES.length)],
};

function playerMove(dir) {
    player.pos.x += dir;
    if (board.collide(player)) {
        player.pos.x -= dir; // Undo the move if it hits a wall
    }
}

// function playerDrop() {
//     player.pos.y++;
//     if (board.collide(player)) {
//         player.pos.y--; // Move back up
//         board.merge(player); // Lock it in
//         playerReset(); // Start new piece
//     }
//     dropCounter = 0;
// }

export function createPiece(type) {
    // Get the raw shape data
    const rawMatrix = SHAPES[type];
    
    // 1. Determine the size of the square needed
    // For Tetris, we usually want at least a 3x3 or 4x4
    const height = rawMatrix.length;
    const width = rawMatrix[0].length;
    const size = Math.max(height, width);
    
    // 2. Create an empty square matrix filled with 0s
    const matrix = Array.from({ length: size }, () => Array(size).fill(0));
    
    // 3. Assign a random color ID (1-7) for this specific instance
    const colorId = Math.floor(Math.random() * 7) + 1;

    // 4. Fill the center of our square with the raw shape
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (rawMatrix[y][x] !== 0) {
                matrix[y][x] = colorId; 
            }
        }
    }

    return matrix;
}

function playerReset() {
    const typeIndex = Math.floor(Math.random() * SHAPES.length);
    
    // Use the wrapper to get a perfectly square, color-assigned matrix
    player.matrix = createPiece(typeIndex);
    
    player.pos.y = 0;
    player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);

    if (board.collide(player)) {
        board.grid = board.getEmptyBoard(); // Game Over
        totalScore = 0;
    }
}

// Automatic dropping every 1 second
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Fill background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Board (stationary blocks)
    board.grid.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(x, y, 1, 1);
            }
        });
    });

    // Draw Player (active piece)
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(x + player.pos.x, y + player.pos.y, 1, 1);
            }
        });
    });
}

let totalScore = 0;

function playerDrop() {
    player.pos.y++;
    if (board.collide(player)) {
        player.pos.y--;
        board.merge(player);
        
        // CHECK FOR LINES HERE
        const points = board.sweep();
        totalScore += points;
        updateScoreDisplay(); // Optional: update a UI element
        
        playerReset();
    }
    dropCounter = 0;
}

function updateScoreDisplay() {
    // If you add <div id="score">0</div> to your HTML
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.innerText = `Score: ${totalScore}`;
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    
    // Wall kick: move the piece if it rotates into a wall
    while (board.collide(player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir); // Rotate back if it won't fit
            player.pos.x = pos;
            return;
        }
    }
}




document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1);
    if (event.keyCode === 39) playerMove(1);
    if (event.keyCode === 40) playerDrop();
    if (event.keyCode === 81) playerRotate(-1); // Q key
    if (event.keyCode === 87) playerRotate(1);  // W key
    if (event.keyCode === 38) playerRotate(1);  // Up arrow

});

update();