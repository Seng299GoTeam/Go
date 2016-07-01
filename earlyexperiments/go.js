go = module.exports;

go.emptyGrid = function(size){
    var board = new Array(size);
    for (var i = 0; i < size; i++){
       board[i] = new Array(size);
       for (var j = 0; j < size; j++){
           board[i][j] = 0;
       } 
    }
    return board;
}

go.emptyBoard = function(size){
    return new go.Board(go.emptyGrid(size));
}


//Board class:  Tracks the state of a game board.
//  grid must be an nxn array
go.Board = function Board(grid){
    this.grid = grid;
    this.armies = [];      // should be private maybe?
    this.stones = [];      // should be private maybe?
    this.territories = []; // should be private probably
    this.size = grid.length;
    
    this.draw = function(){
        s = "";
        //add horizontal index labels
        for (var i = 0; i < this.size; i++){
            s += i%10; //must only be one digit
        }
        s += "\n";
    
        // Draw actual board
        for(var i = 0; i < this.size; i++){
            for(var j = 0; j < this.size; j++){
                switch(grid[j][i]){     //Draw as transpose to align with expectations
                    case 1:
                        s += "@"; // black
                        break;
                    case 2:
                        s += "O"; // white
                        break;
                    default:
                        s +="+";  //empty
                }//switch
            }
            s += " " + i; // vertical index labels;
            s += "\n";
        }//outer For
        console.log(s);
    }//drawBoard
    
    //Analyze grid, overwriting "armies" and "stones" with up-to-date values
    this.parse = function(){
        this.stones = [];
        this.armies = [];
        //Combine to create armies;
        //First sweep: create armies.
        for (var i=0; i < this.size; i++){
            for (var j=0; j < this.size; j++){
                if(this.grid[i][j] != 0){
                    var colour = (this.grid[i][j] == 1? "black" : "white");
                    
                    var newStone = new Stone(i,j,colour);
                    var currentArmy = new go.Army(colour);
                    currentArmy.addStone(newStone);
                    
                    this.stones.push(newStone);
                    this.armies.push(currentArmy);
                    
                    if(i > 0){
                        //check left square;
                        var leftStone = this.getStone(i-1,j);
                        if (leftStone != null && leftStone.colour == colour){
                            //add this army to existing army
                            if(leftStone.army != newStone.army){
                                leftStone.army.add(currentArmy);
                                currentArmy = leftStone.army;
                            }
                        }
                    }
                
                    if (j > 0) {
                        //check top square;
                        var topStone = this.getStone(i,j-1);
                        if (topStone != null && topStone.colour == colour){
                            //add this army to existing army
                            if(topStone.army != newStone.army){
                                topStone.army.add(currentArmy);
                                currentArmy = topStone.army;
                            }
                        }
                    }
                    
                    //delete any armies marked for deletion
                    this.armies = this.armies.filter(a => !a.markedForDeletion);
                }//if is a stone
            }//for j
        }//for i
        
        //Second Sweep: count liberties and add to armies
        //  (doing this the first time around risked double-counting them)
        for (var i=0; i < this.size; i++){
            for (var j=0; j < this.size; j++){
                if(this.grid[i][j] == 0){
                    //check Von Neumann neighbourhood for stones, and add as liberty to their armies.
                    // (if not already added, of course)
                    var tempStone = null;
                    if(i > 0){
                        tempStone = this.getStone(i-1,j);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(new Intersection(i,j));
                        }
                    }
                    
                    if(i < this.size - 1){
                        tempStone = this.getStone(i+1,j);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(new Intersection(i,j));
                        }
                    }
                    
                    if(j > 0){
                        tempStone = this.getStone(i,j-1);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(new Intersection(i,j));
                        }
                    }
                    
                    if(j < this.size - 1){
                        tempStone = this.getStone(i,j+1);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(new Intersection(i,j));
                        }
                    }
                }//if is liberty
            }//for j
        }//for i
    }//parse
    
    
    //Find territories and calculate score
    //returns player scores in form [black score,white score]
    this.score = function(){
        this.territories = [];
        
        var scores = [0,7.5]; //White gets a bonus for going second
        
        //first sweep - identify territories
        for (var i = 0; i < this.size; i++){
            for (var j = 0; j < this.size; j++){
                //for empty intersections...
                if(this.grid[i][j] == 0){
                    
                    var newIntersection = new Intersection(i,j);
                    var currentTerritory = new Territory();
                    currentTerritory.addIntersection(newIntersection);
                    
                    this.territories.push(currentTerritory);
                    
                    if(i > 0){
                        //check left square;
                        var leftInter = this.getIntersection(i-1,j);
                        if (leftInter != null){
                            //add this territory to existing territory
                            if(leftInter.territory != newIntersection.territory){
                                leftInter.territory.add(currentTerritory);
                                currentTerritory = leftInter.territory;
                            }
                        }
                    }
                    
                    if(j > 0){
                        //check top square;
                        var topInter = this.getIntersection(i,j-1);
                        if (topInter != null){
                            //add this territory to existing territory
                            if(topInter.territory != newIntersection.territory){
                                topInter.territory.add(currentTerritory);
                                currentTerritory = topInter.territory;
                            }
                        }
                    }
                    
                    //delete any territories marked for deletion
                    this.territories = this.territories.filter(t => !t.markedForDeletion);
                }
            }//inner for
        }//outer for
        //Done first sweep
        
        //Second sweep: check whether territories touch black, white, or both.
        for (var i = 0; i < this.size; i++){
            for (var j = 0; j < this.size; j++){
                if (this.grid[i][j] == 0){
                    var neighbours = [0,0,0,0];
                    var cur = this.getIntersection(i,j);
                    
                    if(i > 0){
                        neighbours[0] = grid[i-1][j];
                    }
                    
                    if(i < this.size - 1){
                        neighbours[1] = grid[i+1][j];
                    }
                    
                    if(j > 0){
                        neighbours[2] = grid[i][j-1];
                    }
                    
                    if(j < this.size - 1){
                        neighbours[3] = grid[i][j+1];
                    }
                    
                    for (var k in neighbours){
                        cur.territory.touchesBlack = cur.territory.touchesBlack || (neighbours[k] == 1);
                        cur.territory.touchesWhite = cur.territory.touchesWhite || (neighbours[k] == 2);
                    }
                    
                    /*
                    if(neighbours[0] || neighbours[1] || neighbours[2] || neighbours[3]){
                        console.log("DEBUG: " + cur.touchesBlack.toString() + " " + cur.touchesWhite.toString() + " " + cur.colour());
                    }*/
                }//if
            }//inner for
        }//outer for
        
        
        //Now count score via Area method:
        //First stones on the board:
        for (var i in this.armies){
            var curArmy = this.armies[i];
            if(curArmy.colour == "black"){
                scores[0] += curArmy.countStones();
            }else if(curArmy.colour == "white"){
                scores[1] += curArmy.countStones();
            }
        }
        
        //Then area in territory:
        for (var i in this.territories){
            var curTerritory = this.territories[i];

            if(curTerritory.colour() == 1){
                scores[0] += curTerritory.size();
            }else if(curTerritory.colour() == 2){
                scores[1] += curTerritory.size();
            }
        }
        
        return scores;
    }//score
    
    this.getStone = function(x,y){
        for(var i = 0; i < this.stones.length; i++){
            var stone = this.stones[i];
            if (stone.x == x && stone.y == y){
                return stone;
            }
        }
        return null;
    }//check for stone
    
    this.getIntersection = function(x,y){
        for (var i in this.territories){
            var inters = this.territories[i].intersections;
            for (var j in inters){
                var inter = inters[j];
                if (inter.x == x && inter.y == y){
                    return inter;
                }
            }
        }
    }//getIntersection
    
    
    this.dumpData = function(verbose){
        this.draw();
        for (var i in this.armies){
            this.armies[i].dumpData(verbose);
        }
    }//dumpData
    
    //play without validation (used in the validation process.)
    //returns a new board but DOES NOT MODIFY current board.
    this.playNaive = function(move){
        if(move.pass){
            var newBoard = new Board(this.grid);
            newBoard.parse();
            return newBoard; //No difference if the move is a pass
        }
        
        var x = move.x;
        var y = move.y;
        var colour = (move.colour==1?"black":"white");
        
        //copy grid (since just passing the old grid would cause conflicts
        var newGrid = new Array(this.size);
        for (var i = 0; i < this.size; i++){
            newGrid[i] = new Array(this.size);
            for (var j = 0; j < this.size; j++){
                newGrid[i][j] = this.grid[i][j];
            }
        }
    
        var newBoard = new Board(newGrid,[],[]);
        
        //Add stone to board & parse
        newBoard.grid[x][y] = (colour=="black"?1:2);
        newBoard.parse();
        
        //Remove stones of captured armies of opposite colour & re-parse;
        var opponentArmies = newBoard.armies.filter(x => x.colour != colour);
        
        for (var i in opponentArmies){
            currArmy = opponentArmies[i];
            if (currArmy.countLiberties() == 0){
                for (var j in currArmy.stones){
                    currStone = currArmy.stones[j];
                    newBoard.grid[currStone.x][currStone.y] = 0;
                }
            }
        }
        
        newBoard.parse();
        
        //Remove stones of captured armies of same colour (should do nothing for legal moves):
        var allyArmies = newBoard.armies.filter(x => x.colour == colour);
        
        for (var i in allyArmies){
            currArmy = allyArmies[i];
            if (currArmy.countLiberties() == 0){
                for (var j in currArmy.stones){
                    currStone = currArmy.stones[j];
                    newBoard.grid[currStone.x][currStone.y] = 0;
                }
            }
        }
        
        newBoard.parse();
        
        return newBoard;
    }//play
    
    //Return [true,""] if move is valid,
    // [false,errormessage] otherwise
    this.validateMove = function(move){
        var x = move.x;
        var y = move.y;
        var colour = (move.colour == 1?"black":"white");
        
        if(move.pass == true){
            return [true];  //A pass is always valid.
        }
    
        if(x<0 || y<0 || x >= this.size || y>=this.size){
            return [false,"Invalid move: Intersection does not exist"];
        }
    
        if(this.getStone(x,y)){
            return [false,"Invalid move: Intesrsection is occupied"];
        }
        
        var resultingBoard = this.playNaive(move);
        if(!resultingBoard.getStone(x,y)){
            return [false,"Invalid move: Suicide"];
        }
        
        //Could check for Ko rule here, if we have some sort of game history somewhere.
        
        return [true,""];
    }//validateMvoe
    
    
    //Attempt to play, including validation
    //Returns board which is result of that play.
    this.play = function(move){
        if(this.validateMove(move)[0]){
            return this.playNaive(move);
        }
        return this;
    }//play
    
}//Board


//Army: a collection of stones
//     Contains a list of stones, and has "checkHasLiberties(board)" function
go.Army = function Army(colour){
    this.stones = [];
    this.liberties = [];  //a list of intersection objects
    this.colour = colour; //"black" or "white"
    this.markedForDeletion = false; //Set to true after being added to existing army
    
    this.setStones = function(newStonesList){
        this.stones = newStonesList;
    }
    
    this.addStone = function(stone){
        this.stones.push(stone);
        stone.setArmy(this);
    }
    
    //Combine with other army of same colour
    this.add = function(otherArmy){
        for (var i = 0; i < otherArmy.stones.length; i++){
            this.addStone(otherArmy.stones[i]);
        }
        //don't worry about liberties;
        //this function should only be called before liberties have been counted.
        
        otherArmy.markedForDeletion = true;
    }//add
    
    this.dumpData = function(verbose){
        console.log(this.colour + " army:");
        console.log(" " + this.stones.length + " stones");
        if(verbose){
            for (var i in this.stones){
                console.log("  (" + this.stones[i].x + "," + this.stones[i].y + ")");
            }
        }
        console.log(" " + this.liberties.length + " liberties");
        if(verbose){
            for (var i in this.liberties){
                console.log("  (" + this.liberties[i].x + "," + this.liberties[i].y + ")");
            }
        }
    }//dumpData
    
    this.addLiberty = function(intersection){
        this.liberties.push(intersection);
    }
    
    //Check whether [x,y] is already listed as a liberty
    this.checkForLiberty = function(x,y){
        for (var i in this.liberties){
            var lib = this.liberties[i];
            if (lib.x == x && lib.y == y){
                return true;
            }
        }
        return false;
    }//checkForLiberty
    
    this.countLiberties = function(){
        return this.liberties.length;
    }
    
    this.countStones = function(){
        return this.stones.length;
    }
}//Army


//Army: a collection of connected intersections
//     Knows whether it touches any black or white stones
go.Territory = Territory;
var Territory = function Territory(){
    this.intersections = [];
    this.touchesBlack = false;
    this.touchesWhite = false;
    
    this.addIntersection = function(intersection){
        this.intersections.push(intersection);
        intersection.setTerritory(this);
    }
    
    //Combine with other territory
    this.add = function(otherTerritory){
        for (var i in otherTerritory.intersections){
            this.addIntersection(otherTerritory.intersections[i]);
        }
        
        //Normally neither territory will have an accurate touchesBlack/White yet
        //  (the identify & combine stage comes first)
        //  But this is here for the sake of completeness.
        this.touchesBlack = this.touchesBlack || otherTerritory.touchesBlack;
        this.touchesWhite = this.touchesWhite || otherTerritory.touchesWhite;
        
        otherTerritory.markedForDeletion = true;
    }//add
    
    //returns colour to which territory belongs - 1 for black, 2 for white, 0 for contested
    this.colour = function(){
        if (this.touchesWhite == this.touchesBlack){
            return 0; // contested
        }else{
            return (this.touchesBlack? 1 : 2);
        }
    }
    
    this.size = function(){
        return this.intersections.length;
    }
}

//Stone has x, y position, colour, and group.
go.Stone = Stone;
var Stone = function Stone(x,y,colour){
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.army = null;
    //this.markedForDeletion = false;
    
    this.setArmy = function(newArmy){
        this.army = newArmy;
    }
}//Stone


go.Intersection = Intersection;
var Intersection = function Intersection(x,y){
    this.x = x;
    this.y = y;
    this.territory = null;
    this.setTerritory = function(newTerritory){
        this.territory = newTerritory;
    }
}//Intersection

go.Move = function Move(x,y,c,p){
    this.x = x;      //integer
    this.y = y;      //integer
    this.colour = c; //colour, 1 or 2
    this.pass = p;   //pass, true or false
}

