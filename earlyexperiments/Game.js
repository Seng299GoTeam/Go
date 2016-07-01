const go = require("./go.js");

//create a new game, specifying type of game & size of board
Game = function Game(type, size){
    this.gameType = type;   //hotseat, network, or ai
    this.currentPlayer = 1; //1 for black, 2 for white
    this.lastMove = null;   //the previous move
    
    this.gameID = 0;        //Only for network games
    this.whichPlayer = 1;   //For network & AI games - which player is on this end?
    
    this.board = go.emptyBoard(size);
    this.previousBoard = null;
    
    
    //Attempt Move attempts to make a move:
    //Callback is called if the move is valid
    //Errback is called if the move is invalid or something else goes wrong.
    //  Errback should take a string containing the error message
    this.attemptMove = function(move, callback, errback){
    
    }
    
    
    
    //switch whose turn it is
    this.changeCurrentTurn = function(){
        this.currentPlayer = (this.currentPlayer == 1? 2 : 1);
    }//changeTurn
}//Game


module.exports = Game;

