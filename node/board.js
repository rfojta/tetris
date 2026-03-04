import { COLS, ROWS } from './constants.js';

export class Board {
    constructor() {
        this.grid = this.getEmptyBoard();
    }

    getEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }

    collide(player) {
        const [m, o] = [player.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (this.grid[y + o.y] && this.grid[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }

    merge(player) {
        player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.grid[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    sweep() {
        let rowCount = 1;
        let score = 0;

        // Iterate backwards from the bottom up
        outer: for (let y = this.grid.length - 1; y > 0; --y) {
            for (let x = 0; x < this.grid[y].length; ++x) {
                if (this.grid[y][x] === 0) {
                    continue outer; // If any cell is empty, skip this row
                }
            }

            // If we are here, the row is full!
            const row = this.grid.splice(y, 1)[0].fill(0); // Remove the row
            this.grid.unshift(row); // Add an empty row at the top
            ++y; // Check the same row index again (since everything shifted down)

            score += rowCount * 10;
            rowCount *= 2; // Bonus for multi-line clears!
        }
        return score;
    }
}