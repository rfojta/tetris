class Autopilot {
    constructor() { this.active = false; this.timeLeft = 0; }
    update(engine) {
        if (!this.active) return;
        const p = engine.activePiece;
        if (!p.target) p.target = this.solve(engine);
        
        if (p.rotation !== p.target.rot) p.rotate(engine.board);
        else if (p.x < p.target.x) p.move(engine.board, 1, 0);
        else if (p.x > p.target.x) p.move(engine.board, -1, 0);
    }
    solve(engine) {
        let bestX = 0, bestRot = 0, bestY = -1;
        for(let r=0; r<4; r++) {
            for(let x=0; x<10; x++) {
                if (engine.activePiece.canMove(engine.board, x - engine.activePiece.x, 0, r)) {
                    let y = 0; while(engine.activePiece.canMove(engine.board, x - engine.activePiece.x, y+1, r)) y++;
                    if (y > bestY) { bestY = y; bestX = x; bestRot = r; }
                }
            }
        }
        return {x: bestX, rot: bestRot};
    }
}
