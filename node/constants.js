export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 20;

export const SHAPES = [
    [[1, 1, 1, 1]],         // I (Straight)
    [[1, 1], [1, 1]],       // O (Square)
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // Z
    [[0, 1, 1], [1, 1, 0]], // S
    [[1, 0, 0], [1, 1, 1]], // L
    [[0, 0, 1], [1, 1, 1]], // J
];

export const COLORS = [
    null,
    '#00f0f0', // I (Cyan)
    '#f0a000', // L (Orange)
    '#0000f0', // J (Blue)
    '#f0f000', // O (Yellow)
    '#f00000', // Z (Red)
    '#00f000', // S (Green)
    '#a000f0', // T (Purple)
];