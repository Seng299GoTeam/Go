const go = require("./go.js");
const Game = require("./Game.js");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


var game = new Game("hotseat",9);


doTurn("Welcome to a hotseat game of Go!\n\n");

//Show the board and ask for input
//"message" will appear above the board
function doTurn(message){
    message = message || "";
    console.log("\n".repeat(60));
    console.log(message);
    console.log("Current player: " + (game.currentPlayer==1?"Black":"White"));
    game.board.draw();
    rl.question("Enter a move (of form '3 5', 'pass', or 'exit'):\n",(answer)=> {
        if(answer == "exit"){
            console.log("Exiting game");
            rl.close();
        }else if(answer == "pass"){
            var move = new go.Move(0,0,game.currentPlayer,true); //pass = true
            game.attemptMove(move,()=>doTurn("Player passed."),(err)=>doTurn(err),winback);
        }else{
            var re = /^(\d+)\s(\d+)$/;
            if(!answer.match(re)){
                doTurn("Not a valid input");
            }else{
                var inputs = answer.match(re);
                var x = parseInt(inputs[1]);
                var y = parseInt(inputs[2]);
                
                var move = new go.Move(x,y,game.currentPlayer,false);
                game.attemptMove(move,doTurn,doTurn);
            }
        }//if ... else
    });//question
}//doTurn

function winback(){
    console.log("Game has ended");
    var scores = game.board.score();
    console.log("Black's score: " + scores[0] + "\nWhite's Score: " + scores[1]);
    console.log("Winner is: " + (scores[0] > scores[1]?"Black":"White"));
    rl.close();
}