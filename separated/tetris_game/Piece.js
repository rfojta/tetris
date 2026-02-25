class Piece {
    constructor() {
        this.type = Math.floor(Math.random() * 7);
        this.shapes = [[['xxxx']], [[' x ', 'xxx']], [[' xx', 'xx ']], [['xx', 'xx']], [['  x','xxx']], [['x  ','xxx']], [['xx ', ' xx']]];
        this.shape = this.shapes[this.type];
        this.x = 3; this.y = 0; this.rotation = 0; this.target = null;
    }
    shapeState(x, y, r) {
        let lx = this.shape[0].length-1, ly = this.shape.length-1;
        if (r === 0) return this.shape[y] && this.shape[y][x] === 'x';
        if (r === 1) return this.shape[ly-x] && this.shape[ly-x][y] === 'x';
        if (r === 2) return this.shape[ly-y] && this.shape[ly-y][lx-x] === 'x';
        if (r === 3) return this.shape[x] && this.shape[x][lx-y] === 'x';
    }
    dim(r) { return (r%2===0) ? {w:this.shape[0].length, h:this.shape.length} : {w:this.shape.length, h:this.shape[0].length}; }
    canMove(b, dx, dy, dr=this.rotation) {
        let {w, h} = this.dim(dr);
        for(let y=0; y<h; y++) {
            for(let x=0; x<w; x++) {
                if(this.shapeState(x,y,dr)) {
                    let nx = this.x+dx+x, ny = this.y+dy+y;
                    if(nx<0 || nx>=10 || ny>=20 || (ny>=0 && b[nx][ny] !== false)) return false;
                }
            }
        }
        return true;
    }
    move(b, dx, dy) { if(this.canMove(b,dx,dy)){ this.x+=dx; this.y+=dy; return true; } return false; }
    rotate(b) { let nr = (this.rotation+1)%4; if(this.canMove(b,0,0,nr)) this.rotation = nr; }
}
