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
    this.armies = [];  // should be private
    this.stones = [];  // should be private
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
                    
                    var newStone = new go.Stone(i,j,colour);
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
                            tempStone.army.addLiberty(i,j);
                        }
                    }
                    
                    if(i < this.size - 1){
                        tempStone = this.getStone(i+1,j);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(i,j);
                        }
                    }
                    
                    if(j > 0){
                        tempStone = this.getStone(i,j-1);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(i,j);
                        }
                    }
                    
                    if(j < this.size - 1){
                        tempStone = this.getStone(i,j+1);
                        if(tempStone != null && !tempStone.army.checkForLiberty(i,j)){
                            tempStone.army.addLiberty(i,j);
                        }
                    }
                }//if is liberty
            }//for j
        }//for i
    }//parse
    
    this.getStone = function(x,y){
        for(var i = 0; i < this.stones.length; i++){
            var stone = this.stones[i];
            if (stone.x == x && stone.y == y){
                return stone;
            }
        }
        return null;
    }//check for stone
    
    this.dumpData = function(verbose){
        this.draw();
        for (var i in this.armies){
            this.armies[i].dumpData(verbose);
        }
    }//dumpData
    
    //play without validation (used in the validation process.
    //returns a new board but DOES NOT MODIFY current board.
    this.playNaive = function(x,y,colour){
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
    
    //Return true if move is valid,
    // false otherwise
    this.validateMove = function(x,y,colour){
        if(x<0 || y<0 || x >= this.size || y>=this.size){
            console.log("Invalid move: Intersection does not exist");
            return false;
        }
    
        if(this.getStone(x,y)){
            console.log("Invalid move: Intesrsection is occupied");
            return false;
        }
        
        var resultingBoard = this.playNaive(x,y,colour);
        if(!resultingBoard.getStone(x,y)){
            console.log("Invalid move: Suicide");
            return false;
        }
        
        //Could check for Ko rule here, if we have some sort of game history somewhere.
        
        return true;
    }//validateMvoe
    
    
    //Attempt to play, including validation
    //Returns board which is result of that play.
    this.play = function(x,y,colour){
        if(this.validateMove(x,y,colour)){
            return this.playNaive(x,y,colour);
        }
        return this;
    }//play
    
}//Board


//Army: a collection of stones
//     Contains a list of stones, and has "checkHasLiberties(board)" function
go.Army = function Army(colour){
    this.stones = [];
    this.liberties = [];  //a liberty isn't an object, just a list [x,y]
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
                console.log("  (" + this.liberties[i][0] + "," + this.liberties[i][1] + ")");
            }
        }
    }//dumpData
    
    this.addLiberty = function(x,y){
        this.liberties.push([x,y]);
    }
    
    //Check whether [x,y] is already listed as a liberty
    this.checkForLiberty = function(x,y){
        for (var i in this.liberties){
            var lib = this.liberties[i];
            if (lib[0] == x && lib[1] == y){
                return true;
            }
        }
        return false;
    }//checkForLiberty
    
    this.countLiberties = function(){
        return this.liberties.length;
    }
}//Army

//Stone has x, y position, colour, and group.
go.Stone = function Stone(x,y,colour){
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.army = null;
    this.markedForDeletion = false;
    
    this.setArmy = function(newArmy){
        this.army = newArmy;
    }
}//Stone

