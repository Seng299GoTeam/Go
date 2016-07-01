const go = require("./go.js");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


var board = go.emptyBoard(9);
var currentPlayer = "black";
var prevMoveWasPass = false;


doTurn("Welcome to a hotseat game of Go!\n\n");

//Show the board and ask for input
//"message" will appear above the board
function doTurn(message){
    console.log("\n".repeat(60));
    console.log(message);
    console.log("Current player: " + currentPlayer);
    board.draw();
    rl.question("Enter a move (of form '3 5', 'pass', or 'exit'):\n",(answer)=> {
        if(answer == "pass"){
            currentPlayer = (currentPlayer=="black"?"white":"black");
            
            if(prevMoveWasPass){
                console.log("Game Over");
                console.log(board.score());
                rl.close();
                return;
            }else{
                prevMoveWasPass = true;
            }
            
            doTurn("Player passed.");
        }else if(answer == "exit"){
            console.log("Exiting game");
            rl.close();
        }else{
            var re = /^(\d+)\s(\d+)$/;
            if(!answer.match(re)){
                doTurn("Not a valid input");
            }else{
                var inputs = answer.match(re);
                var x = parseInt(inputs[1]);
                var y = parseInt(inputs[2]);
                var playernum = (currentPlayer=="black"?1:0);
                
                var move = new go.Move(x,y,playernum,false);
                
                var result = board.validateMove(move);

                if(!result[0]){
                    doTurn(result[1]);
                }else{
                    board = board.play(move);
                    currentPlayer = (currentPlayer=="black"?"white":"black");
                    prevMoveWasPass = false;
                    doTurn("");
                }
            }
        }//if ... else
    });//question
}//doTurn