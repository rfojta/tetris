// alert('hello world');
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function() {
        alreadyrunflag=1;
        walkmydog1();
    }, false)
}
else if (document.all && !window.opera){
  document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>')
  var contentloadtag=document.getElementById("contentloadtag")
  contentloadtag.onreadystatechange=function(){
    if (this.readyState=="complete"){
      alreadyrunflag=1;
      walkmydog1();
    }
  }
}

window.onload=function(){
  setTimeout("if (!alreadyrunflag) walkmydog1()", 0)
}

// shape definitions
var pieces = [['xxxx'], [' x ', 'xxx'], [' xx', 'xx '], ['xx', 'xx'], ['  x','xxx'], ['x  ','xxx']];

// game field
var field = {
    content: [],
    width: 10,
    height: 20,
    piece: null,
    table: null,
    speed: 150,
    leftPieces: 9,
    
    init: function(table) {
        this.table = table;
        for( var i = 0; i<this.width; i++) {
            this.content[i] = [];
            for( var j=0; j<this.height; j++)  {
                this.content[i][j]=false;
            }
        }
    },
    
    random: function(max) {
        // return 1;
        return Math.floor(Math.random()*max);
    },
    
    addPiece: function() {
        if( this.piece === null ) {
            this.piece = new Piece(pieces[this.random(pieces.length)], this);
            this.piece.markMe();
        }
    },

    step: function() {
        if( this.piece ) {
            this.piece.move(0,1);
        }
        else {
            this.isRunning = false;
        }
        if(this.isRunning) {
            if( document.all ) {
                // using global object field, it's not oop :(
                var t = setTimeout(function() { field.step() }, this.speed);
            }
            else
                var t = setTimeout(function(thisObj) { thisObj.step(); }, this.speed, this);
        }
        else if(this.leftPieces>0){
            this.leftPieces--;
            this.addPiece();
            this.run();
        }
    },
    
    run: function() {
        this.isRunning = true;
        this.step();
    },
    
    getCell: function(x,y) {
        var row = this.table.getElementsByTagName('tr')[y];
        if( row === null || row === undefined ) {
            alert('No row found');
        }
        else {
            var cell = row.getElementsByTagName('td')[x];
            return cell;
        }
    },
    
    black: function(x,y) {
        this.getCell(x,y).className = 'black';
    },
    
    unblack: function(x,y) {
        this.getCell(x,y).className = '';
    }
};

function walkmydog1() {
    var world = document.getElementById('world');
    if( world === null ) {
        alert('world is null');
    } 
    else {
        // alert(world.innerHTML);
        var row = world.getElementsByTagName('tr')[0];
        if( row === null ) {
            alert(' row is null ');
        } 
        else {
            // alert(row.nodeName);
            var cell = row.childNodes[0];
            changeCell(cell, '');
            for( var i = 0; i<9; i++) 
                addCell(row, '');
        }
        for( var i = 0; i<20; i++) {
            var row = addRow(world);
            for( var j = 0; j<10; j++ ) {
                addCell(row,'');
            }
        }
    }
    field.init(world);
    /*
    for(var i=0; i<10; i++) {
        field.black(i,i);
        field.black(i,i+10);
        
    }*/
    
    field.addPiece();
    field.run();
    window.onkeyup = function(event) {
        if(window.event)
            event = window.event;
        
        if( ! field.piece ) 
            return;
        
        switch( event.keyCode ) {
           case 37: field.piece.move(-1,0); break;
           case 39: field.piece.move(1,0); break;
           case 40: field.piece.move(0,1); break;
           case 38: field.piece.rotate(); break;
               
                    
        }
    }
}

function changeCell(cell, value) {
    if( value === null ) {
        value = 'OK';
    }
    if( cell === null ) {
        alert(' cell is null ');
    } 
    else {
        // alert(cell.nodeName);
        content = cell.childNodes[0];
        content.nodeValue = value;
    }
}

function addCell(row, value) {
    if( value === null ) {
        value = 'new cell';
    }
    var new_cell = document.createElement('td');
    new_cell.innerHTML = value;
    row.appendChild(new_cell);
}

function addRow(table) {
   var new_row = document.createElement('tr');
   table.getElementsByTagName('tbody')[0].appendChild(new_row);
   return new_row;   
}



// piece definition
function Piece(shape, field) {
    if( shape === null || shape === undefined ) {
        alert('shape is null');
        return;
    }
    this.shape = shape;
    this.field = field;
    this.x = 4;
    this.y = 0;
    this.rotation = 0;
    
    this.rotate = function() {
        this.unmarkMe();
        this.rotation = (this.rotation + 1) % 4;
        this.markMe();
    };
        
    this.shapeState = function(x,y) {   
      var lx = this.shape[0].length - 1;
      var ly = this.shape.length - 1;  
      switch(this.rotation) {
        case 0: 
            return this.shape[y][x] == 'x';
        case 1: 
            return this.shape[ly-x][y] == 'x';
        case 2: 
            return this.shape[ly-y][lx-x] == 'x';
        case 3: 
            return this.shape[x][lx-y] == 'x';
      }
    };
    
    this.width = function() {
        switch(this.rotation) {
            case 0:
            case 2:
                return this.shape[0].length;
            case 1:
            case 3:
                return this.shape.length;
        }
    };
            
    this.height = function() {
        switch(this.rotation) {
            case 0:
            case 2:
                return this.shape.length;
            case 1:
            case 3:
                return this.shape[0].length;
        }
    };

    this.testCell = function(x,y) {
    // alert("testing cell on [" + x +", "+ y + "] = " + this.field.content[x][y]);
        if( y > this.field.height || x >= this.field.width || x < 0 || y < 0) 
            throw "Out of range";
        return this.field.content[x][y];
    }
    
    this.canMove = function(a,b) {
        try {
           for(var y = 0; y<this.height(); y++)
               for( var x = 0; x<this.width(); x++) {
                   var new_x = this.x + a + x;
                   var new_y = this.y + b + y;
                   if( this.shapeState(x, y) && this.testCell(new_x, new_y) )
                       return false;
               } 
        }
        catch(err) {
            if( err == "Out of range" ) {
                // alert('exception');
                return false;
            }
        }
    return true;
    };

    this.move = function(x,y) {
        if( this.canMove(x,y) ) {
            this.unmarkMe();
            this.x += x;
            this.y += y;    
            this.markMe();
        }
        else {
            this.fix();
            this.field.piece = null;
        }
    };
    
    this.markMe = function() {
       for(var y = 0; y<this.height(); y++)
           for( var x = 0; x<this.width(); x++) {
               if( this.shapeState(x,y) ) {
                   this.field.black(this.x + x, this.y + y)
               }
           }        
    };

    this.unmarkMe = function() {
       for(var y = 0; y<this.height(); y++)
           for( var x = 0; x<this.width(); x++) {
               if( this.shapeState(x,y) ) {
                   this.field.unblack(this.x + x, this.y + y)
               }
           }        
    };
    
    
    this.fix = function() {
       for(var y = 0; y<this.height(); y++)
           for( var x = 0; x<this.width(); x++) {
               if( this.shapeState(x,y) ) {
                   this.field.content[this.x + x][this.y + y] = true;
                   this.field.black(this.x + x, this.y + y)
               }
           }        
    };
};

    


