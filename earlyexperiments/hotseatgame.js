const go = require("./go.js");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


var board = go.emptyBoard(9);
var currentPlayer = "black";


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
                
                if(!board.validateMove(x,y,currentPlayer)){
                    doTurn("Not a valid move");
                }else{
                    board = board.play(x,y,currentPlayer);
                    currentPlayer = (currentPlayer=="black"?"white":"black");
                    doTurn("");
                }
            }
        }//if ... else
    });//question
}//doTurn