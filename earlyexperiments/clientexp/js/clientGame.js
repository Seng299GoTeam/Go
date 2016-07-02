//create a new game, specifying type of game & size of board
Game = function Game(type, size){
    this.gameType = type;   //hotseat, network, or AI
    this.currentPlayer = 1; //1 for black, 2 for white
    this.previousMove = null;   //the previous move
    
    this.gameID = 0;        //Only for network games
    this.whichPlayer = 1;   //For network & AI games - which player is on this end?
    
    this.board = go.emptyBoard(size);
    this.previousBoard = null;
    
    
    //Attempt Move attempts to make a move:
    //  Callback is called if the move is valid
    //  Errback is called if the move is invalid or something else goes wrong.
    //  Errback should take a string containing the error message
    //  Winback (optional) is called if a player wins.
    this.attemptMove = function(move, callback, errback,winback){
        var result = this.board.validateMove(move);
        if(!result[0]){
            errback(result[1]); // result[1] contains informative error message
        }else if (move.pass && (this.previousMove && this.previousMove.pass)){
            if(winback){
                winback();
            }else{
                this.endGame(); //Default; should not be used in practice.
            }
        }else{
            this.previousboard = this.board;
            this.previousMove = move;
            
            this.board = this.board.play(move);
            this.changeCurrentTurn();
            callback();
        }
    }//attemptMove
    
    this.endGame = function(){
        //Not sure precisely what this'll do.
        //For now, just console.log a message.
        console.log("Game has ended");
        var scores = this.board.score();
        console.log("Black's score: " + scores[0] + "\nWhite's Score: " + scores[1]);
        console.log("Winner is: " + (scores[0] > scores[1]?"Black":"White"));
    }
    
    
    
    //switch whose turn it is
    this.changeCurrentTurn = function(){
        this.currentPlayer = (this.currentPlayer == 1? 2 : 1);
    }//changeTurn
}//Game

