var canvasWidth = 500;
var canvasHeight = 500;
var canvasBorder = 30;
var gridDimension = 13;
var gridCellSize = (canvasWidth - 2*canvasBorder)/(gridDimension - 1);

var game = new Game("hotseat",gridDimension);

//array of clikable squares
var clickables = createClickableThings();


//Class of stones
//x and y are coords on grid, not absolute coords
function StoneSprite(x,y,colour){
    this.x = x;
    this.y = y;
    this.colour = colour;
    
    this.draw = function(ctx) {
        if(colour == "black"){
            ctx.fillStyle = "#000000";
        }else{
            ctx.fillStyle = "#FFFFFF";
        }
        
        ctx.strokeStyle ="#000000";
        ctx.beginPath();
        ctx.arc(x*gridCellSize + canvasBorder, y*gridCellSize + canvasBorder, 15, 0,2*Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}//StoneSprite


function drawBoard(){
    //First, process board into sprites:
    var board = game.board.grid;
    
    var stones = []
    for (var i = 0; i < gridDimension; i++){
        for (var j = 0; j < gridDimension; j++){
            if(board[i][j] == 1){
                stones.push(new StoneSprite(i,j,"black"));
            }else if(board[i][j] == 2){
                stones.push(new StoneSprite(i,j,"white"));
            }
        }
    }
    
    //Draw board:
    c=document.getElementById("theCanvas");
    ctx = c.getContext("2d");
    ctx.fillStyle = "#88FFFF";
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
    
    //Vertical lines:
    ctx.strokeStyle ="#000000";
    for (var i = 0; i < gridDimension; i++){
        ycoord = canvasBorder + gridCellSize*i;
    
        ctx.beginPath();
        ctx.moveTo(canvasBorder,ycoord);
        ctx.lineTo(canvasWidth - canvasBorder,ycoord);
        ctx.stroke();
    }
    
    //Horizontal lines:
    for (var i = 0; i < gridDimension; i++){
        xcoord = canvasBorder + gridCellSize*i;
    
        ctx.beginPath();
        ctx.moveTo(xcoord, canvasBorder);
        ctx.lineTo(xcoord,canvasHeight - canvasBorder);
        ctx.stroke();
    }
    
    //Stones:
    for (var i = 0; i < stones.length; i++){
        stones[i].draw(ctx);
    }
    
    //Current player:
    var playerIndicator = document.getElementById("currentplayer");
    playerIndicator.innerHTML = (game.currentPlayer == 1?"Black":"White");
}//drawBoard



function doClick(x,y){
    //given x & y, determine which square the user clicked on
    //x and y are relative to top left corner of canvas
    
    //first, find x and y cooords, or -1,-1 otherwise
    xindex = -1;
    yindex = -1;
    for (var i = 0; i < gridDimension; i++){
        for (var j = 0; j < gridDimension; j++){
            //remember, "lower" numbers are actually at top of canvas
            lower = clickables[i][j][1];
            upper = lower + gridCellSize;
            
            left = clickables[i][j][0];
            right = left + gridCellSize;

            if(x > left && x < right && y > lower && y < upper){
                xindex = i;
                yindex = j;
            }
        }
    }
    
    if(xindex < 0 || yindex < 0){
        return;
    }
    
    
    var move = new go.Move(xindex,yindex,game.currentPlayer,false);
    game.attemptMove(move,showMessage,showMessage);
    drawBoard();
}//doClick

function pass(){
    var move = new go.Move(0,0,game.currentPlayer,true);
    game.attemptMove(move,showMessage,showMessage,endGame);
    drawBoard();
}

function showMessage(s){
    var messageToShow = s || "";
    var messageDiv = document.getElementById("messageDiv");
    messageDiv.innerHTML = messageToShow;
}

function endGame(){
    var s = "Game Over<br />\n";
    s += "Black's score: " + game.board.scores[0] + "<br />\n";
    s += "White's score: " + game.board.scores[1] + "<br />";
    showMessage(s);
}





//Array of squares representing locations on board which can be clicked
function createClickableThings(){
    var clickables = new Array(gridDimension);
    
    for (var i = 0; i < gridDimension; i++){
        clickables[i] = new Array(gridDimension);
        for (var j = 0; j < gridDimension; j++){
            //store top left corner of clickable square area of width gridCellSize
            xcoord = i*gridCellSize - (gridCellSize/2) + canvasBorder;
            ycoord = j*gridCellSize - (gridCellSize/2) + canvasBorder;
            clickables[i][j] = [xcoord,ycoord];
        }
    }
    
    return clickables
}//createClickableThings



function handleMouseClick(evt){
    var x = event.x;
    var y = event.y;
    
    //Won't work for firefox
    var tempc = document.getElementById("theCanvas");
    var rect = tempc.getBoundingClientRect();
    
    x -= rect.left;
    y -= rect.top;
    
    if(x > 0 && y > 0 && x < canvasWidth && y < canvasHeight){
        doClick(x,y);
    }
}










function test(){
    alert('This functionality has not yet been implemented');
}