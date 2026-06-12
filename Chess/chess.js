const board = document.getElementById("board");
let squares = [[], 
               [], 
               [], 
               [], 
               [], 
               [], 
               [], 
               []];

let turn = 1;
let moveNumber = 0;

let totalTime = document.getElementById("time");
let totalIncrement = document.getElementById("increment");

// 1 Second = 60000 ms

let blackTime = 600000;
let whiteTime = 600000;

let increment = 1000;

let lastUpdate = Date.now();
let gameRunning = false;

let whiteClock = document.getElementById("whiteClock");
let blackClock = document.getElementById("blackClock");

let repetitionW = 0;
let repetitionB = 0;

let prevPosW;
let nextPosW;

let prevPosB;
let nextPosB;

let wPiece = 0;
let bPiece = 0;

let moveCountFifty = 0;

setInterval(() => {
    if(!gameRunning) {return;}

    const now = Date.now();
    const elapsed = now - lastUpdate;
    lastUpdate = now;

    if (turn === 1) {
        whiteTime -= elapsed;
    } else {
        blackTime -= elapsed;
    }

    updateDisplay();
}, 50);

let twoSquares = false;

const whiteC = document.getElementById("whiteC");
const blackC = document.getElementById("blackC");

const tbody = document.querySelector("#moves-table tbody");

let piece = {
    0: "",
    1: `<img src="res/images/pieces/white_king.svg" alt="wK">`,
    20: `<img src="res/images/pieces/white_queen.svg" alt="wQ">`,
    30: `<img src="res/images/pieces/white_rook.svg" alt="wR">`,
    40: `<img src="res/images/pieces/white_bishop.svg" alt="wB">`,
    50: `<img src="res/images/pieces/white_knight.svg" alt="wKn">`,
    60: `<img src="res/images/pieces/white_pawn.svg" alt="wP">`,
    7: `<img src="res/images/pieces/black_king.svg" alt="bK">`,
    80: `<img src="res/images/pieces/black_queen.svg" alt="bQ">`,
    90: `<img src="res/images/pieces/black_rook.svg" alt="bR">`,
    10: `<img src="res/images/pieces/black_bishop.svg" alt="bB">`,
    11: `<img src="res/images/pieces/black_knight.svg" alt="bKn">`,
    12: `<img src="res/images/pieces/black_pawn.svg" alt="bP">`
};

let moves = {
    601: 0,
    602: 0,
    603: 0,
    604: 0,
    605: 0,
    606: 0,
    607: 0,
    608: 0,
    1201: 0,
    1202: 0,
    1203: 0,
    1204: 0,
    1205: 0,
    1206: 0,
    1207: 0,
    1208: 0,
    1: 0,
    201: 0,
    301: 0,
    401: 0,
    501: 0,
    7: 0,
    801: 0,
    901: 0,
    1001: 0,
    1101: 0,
    302: 0,
    402: 0,
    502: 0,
    902: 0,
    1002: 0,
    1102: 0,
};

let lastPlayedPiece = 0;

const chess_sound = new Audio("res/sounds/chess_sound.mp3")

let boardData = [[901, 1101, 1001, 801, 7, 1002, 1102, 902],
                 [1201, 1202, 1203, 1204, 1205, 1206, 1207, 1208],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [0, 0, 0, 0, 0, 0, 0, 0],
                 [601, 602, 603, 604, 605, 606, 607, 608],
                 [301, 501, 401, 201, 1, 402, 502, 302]];

let previousBoardData = boardData.map(row => [...row]);
let previousPiece = 100;
let previousPos = [];
let nextPos = [];

let promotionOptions = document.getElementById("promotionOptions");
let promoting = false;
let promotionSquare = [];

let runDiv = document.getElementById("run");

let capturedPiece = 0;

function setTimeAndIncrement(time, inc) {
    blackTime = time;
    whiteTime = time;

    increment = inc;
}

function startGame() {
    gameRunning = true;

    setTimeAndIncrement(Number(totalTime.value), Number(totalIncrement.value));
    run.style.display = "none";
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function checkZero(time) {
    if(time <= 0) {
        alert("Time's UP!");
        gameRunning = false;
        return true;
    }
    return false;
}

function updateDisplay() {
    if(checkZero(turn === 0 ? blackTime : whiteTime)) {return;}

    whiteClock.classList.toggle("active-clock", turn === 1);
    whiteClock.classList.toggle("inactive-clock", turn === 0);
    blackClock.classList.toggle("active-clock", turn === 0);
    blackClock.classList.toggle("inactive-clock", turn === 1);

    whiteClock.innerHTML = formatTime(whiteTime);
    blackClock.innerHTML = formatTime(blackTime);
}

function addCaptures() {
    capturedPiece = Number(String(previousBoardData[nextPos[0]][nextPos[1]]).slice(0, 2));
    
    if(turn == 0 && capturedPiece != 0) {
        blackC.innerHTML += piece[capturedPiece];
    }
    else if(turn == 1 && capturedPiece != 0) {
        whiteC.innerHTML += piece[capturedPiece];
    }
}

function addMove(move) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${moveNumber}</td>
        <td>${piece[Number(String(previousPiece).slice(0, 2))]}</td>
        <td>${previousPos}</td>
        <td>${nextPos}</td>
        <td>${(turn == 1) ? "White" : "Black"}</td>
    `;
    tbody.appendChild(row);
}
function checkPawnPromotion() {
    // White Promotions
    for (let i=0; i<8; i++) {
        if(String(boardData[0][i]).slice(0, 2).startsWith("60")) {
            promotionOptions.style.display = "flex";
            promoting = true;
            promotionSquare = [0, i];
        }
    }
    for (let i=0; i<8; i++) {
        if(String(boardData[7][i]).slice(0, 2).startsWith("12")) {
            promotionOptions.style.display = "flex";
            promoting = true;
            promotionSquare = [7, i];
        }
    }
}
function promotion(piece) {
    let actualPiece;
    if(piece == 0) {
        
    }
    switch(piece) {
        case 0:
            actualPiece = (turn == 1) ? 8 : 2;
            break;
        case 1:
            actualPiece = (turn == 1) ? 90 : 30;
            break;
        case 2:
            actualPiece = (turn == 1) ? 10 : 40;
            break;
        case 3:
            actualPiece = (turn == 1) ? 11 : 50;
            break;
    }
    
    let number = getPieceData(actualPiece).length + 1;

    boardData[promotionSquare[0]][promotionSquare[1]] = actualPiece * 100 + number;
    promoting = false;
    moves[number] = 0;

    promotionOptions.style.display = "none";
    
    drawPieces();
}

function drawPieces() {
    for (let row=0; row < 8; row++) {
        for (let col=0; col < 8; col++) {
            squares[row][col].innerHTML = piece[Number(String(boardData[row][col]).slice(0, 2))];
        }
    }
}

function movementManager(row, col, piece) {
    switch(String(piece).slice(0, 2)) {
        case "0":
            if(previousPiece != 100) {
                nextPos = [row, col];
                moved();
                fixBg();
            }
            break;
        case "1":
        case "20":
        case "30":
        case "40":
        case "50":
        case "60":
            if(previousPiece == 100 && turn == 1) {
                previousPiece = piece;
                previousPos = [row, col];
                showAllowedMoves(previousPos);
            }
            else if(previousPiece != 100 && turn == 0) {
                nextPos = [row, col];
                moved();
                fixBg();
            }

            break;
        case "7":
        case "80":
        case "90":
        case "10":
        case "11":
        case "12":
            if(previousPiece == 100 && turn == 0) {
                previousPiece = piece;
                previousPos = [row, col];
                showAllowedMoves(previousPos);
            }
            else if(previousPiece != 100 && turn == 1) {
                nextPos = [row, col];
                moved();
                fixBg();
            }

            break;
    }
}
function showAllowedMoves(pp) {
    let teamPieces = (turn == 0) ? [7, 80, 90, 10, 11, 12] : [1, 20, 30, 40, 50, 60];
    let enemyPieces = (turn == 1) ? [7, 80, 90, 10, 11, 12] : [1, 20, 30, 40, 50, 60];
    let allowedPos = [];
    let enemyPos = [];

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            switch(Number(String(previousPiece).slice(0, 2))) {
                case 1:
                case 7:
                    if(moveKing(pp, [row, col]) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
                case 20:
                case 80:
                    if((moveRook(pp, [row, col]) || moveBishop(pp, [row, col])) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
                case 30:
                case 90:
                    if(moveRook(pp, [row, col]) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
                case 40:
                case 10:
                    if(moveBishop(pp, [row, col]) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
                case 50:
                case 11:
                    if(moveKnight(pp, [row, col]) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
                case 60:
                case 12:
                    if(movePawn(pp, [row, col]) && !teamPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                        if(enemyPieces.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                            enemyPos.push([row, col]);
                        }
                        else {
                            allowedPos.push([row, col]);
                        }
                    }
                    break;
            }
        }
    }
    enemyPos.forEach((pos) => {
        squares[pos[0]][pos[1]].classList.add("capture-move");
    });

    allowedPos.forEach((pos) => {
        squares[pos[0]][pos[1]].classList.add("allowed-move");
    });
}
function fixBg() {
    squares.forEach((row) => {
        row.forEach((square) => {
            square.classList.remove("allowed-move");
            square.classList.remove("capture-move");
        });
    });
}

function moved() {
    let run = false;
    switch(String(previousPiece).slice(0, 2)) {
        case "12":
            if(turn == 0) {
                run = movePawn(previousPos, nextPos, false);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }

            break;
        case "60":
            if(turn == 1) {
                run = movePawn(previousPos, nextPos, false);
                if(run) {   
                    changePos(previousPos, nextPos);
                }
            }

            break;
        case "30":
            if(turn == 1) {
                run = moveRook(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "90":
            if(turn == 0) {
                run = moveRook(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "50":
            if(turn == 1) {
                run = moveKnight(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "11":
            if(turn == 0) {
                run = moveKnight(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "40":
            if(turn == 1) {
                run = moveBishop(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "10":
            if(turn == 0) {
                run = moveBishop(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "20":
            if(turn == 1) {
                run = moveRook(previousPos, nextPos) || moveBishop(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "80":
            if(turn == 0) {
                run = moveRook(previousPos, nextPos) || moveBishop(previousPos, nextPos);
                if(run) {
                    changePos(previousPos, nextPos);
                }
            }
            break;
        case "1": 
            if(turn == 1) {
                run = moveKing(previousPos, nextPos, false, false);
                if(run) {
                    changePos(previousPos, nextPos);
                    
               }
            }
            break;
        case "7":
            if(turn == 0) {
                run = moveKing(previousPos, nextPos, false, false);
                if(run) {
                    changePos(previousPos, nextPos);
               }
            }
            break;
    }
    if(run) {
        chess_sound.play();

        setTimeout(() => {
            chess_sound.pause();
            chess_sound.currentTime = 0;
        }, 500);

        let checkResult = check();

        if(checkResult == turn) {
            boardData = previousBoardData.map(row => [...row]);
        }
        else if(checkResult == 100) {
            moves[previousPiece]++;
            drawPieces();
            checkPawnPromotion();

            addCaptures();

            previousBoardData = boardData.map(row => [...row]);
        
            addMove();
            if(turn == 0) {
                blackTime += increment;
                moveNumber++;
            }
            else {
                whiteTime += increment;
            }
            let isCheck = check(turn == 0 ? 1 : 0);

            checkRepetition();
            fiftyMoveRule();

            switch(turn) {
                case 1:
                    turn = 0;
                    break;
                case 0:
                    turn = 1;
                    break;
            }

            if(checkmate()) {
                if(isCheck) {
                    alert("Checkmate!!");
                    gameRunning = false;
                }
                else {
                    alert("Stalemate!!");
                    gameRunning = false;
                }
            }
            rotateBoard();
        }
    }

    lastPlayedPiece = previousPiece;
    previousPiece = 100;
    previousPos = [];
}
function fiftyMoveRule() {
    if(!String(previousPiece).startsWith("60") && !String(previousPiece).startsWith("120") && capturedPiece === 0) {
        moveCountFifty++;
    }
    else {
        moveCountFifty = 0;
    }

    if(moveCountFifty === 50) {
        alert("Fifty Move Rule Draw!");
        gameRunning = false;
    }
}

function checkRepetition() {
    if(turn == 1 && repetitionW === 0) {
        prevPosW = previousPos;
        nextPosW = nextPos;
        wPiece = previousPiece;
    }
    else if(turn == 0 && repetitionB === 0) {
        prevPosB = previousPos;
        nextPosW = nextPos;
        bPiece = previousPiece;
    }
    else if(turn == 1 && repetitionB < 3) {
        prevPosW = nextPos;
    }
    else if(turn == 0 && repetitionB < 3) {
        prevPosB = nextPos;
    }

    if(turn == 1 && repetitionW === 0 && wPiece == previousPiece) {
        repetitionW++;
    }
    else if(turn == 0 && repetitionB === 0 && bPiece == previousPiece) {
        repetitionB++;
    }
    else if(turn == 1 && prevPosW == nextPos && wPiece == previousPiece) {
        repetitionW++;
    }
    else if(turn == 0 && prevPosB == nextPos && bPiece == previousPiece) {
        repetitionB++;
    }
    else if((turn == 1 && (prevPosW != nextPos || wPiece != previousPiece)) || (turn == 0 && (prevPosB != nextPos || bPiece != previousPiece))) {
        repetitionW = 0;
        repetitionB = 0;
    }

    if(repetitionB === 3 && repetitionW === 3) {
        alert("Draw By Repetition!");
        gameRunning = false;
    }

    // if(repetitionW < 3 && repetitionW > 0 && turn == 1) {
    //     if(nextPosW == prevPosW) {
    //         repetitionW++;
    //     }
    // }
    // else if(repetitionB < 3 && repetitionB > 0 && turn == 0) {
    //     if(nextPosB == prevPosB) {
    //         repetitionB++;
    //     }
    // }
}

function checkmate() {
    let vals = (turn == 1) ?
            [7, 80, 90, 10, 11 , 12]
            : [1, 20, 30, 40, 50, 60];

    let kingPos = getPieceData(vals[0] == 1 ? 7 : 1)[0];

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            if(vals.includes(Number(String(boardData[row][col]).slice(0, 2)))) {
                let currentPiece = boardData[row][col];
                const backup = boardData.map(row => [...row]);
                for(let x=0; x < 8; x++) {
                    for (let y=0; y < 8; y++) {
                        switch(Number(String(boardData[row][col]).slice(0, 2))) {
                            case 1:
                            case 7:
                                if(moveKing([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    kingPos = getPieceData(vals[0])[0];

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                            case 20:
                            case 80:
                                if(moveRook([row, col], [x, y], true) || moveBishop([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                            case 30:
                            case 90:
                                if(moveRook([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                            case 40:
                            case 10:
                                if(moveBishop([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                            case 50:
                            case 11:
                                if(moveKnight([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                            case 60:
                            case 12:
                                if(movePawn([row, col], [x, y], true)) {
                                    changePos([row, col], [x, y], currentPiece);

                                    if(checkSafety(kingPos)) {
                                        boardData = backup.map(row => [...row]);
                                        return false;
                                    }
                                    boardData = backup.map(row => [...row]);
                                }
                                break;
                        }     
                    }
                }
            }
        }
    }  
    return true; 
}
function check(t = turn) {
    let kingVal = t == 0 ? 7 : 1;
    let kingPos = getPieceData(kingVal)[0];

    if(!checkSafety(kingPos, t)) {
        alert((t == 1 ? "White" : "Black")  + " King Is Not Safe!");
        return t;
    }
    
    return 100;
}

function changePos(pp, np, pPi = previousPiece) {
    boardData[pp[0]][pp[1]] = 0;
    boardData[np[0]][np[1]] = pPi;
}
function checkSafety(np, t = turn) {
    let enemyPieces = t == 0 ? [1, 20, 30, 40, 50, 60] : [7, 80, 90, 10, 11, 12]; 

    for(const piece of enemyPieces) {
        for(const position of getPieceData(piece)) {
            switch(piece) {
                case 7:
                case 1:
                    if(moveKing(position, np, true)) {
                        return false;
                    }
                    break;
                case 80:
                case 20:
                    if(moveRook(position, np) || moveBishop(position, np)) {
                        
                        return false;
                    }
                    break;
                case 90:
                case 30:
                    if(moveRook(position, np)) {
                        return false;
                    }
                    break;
                case 10:
                case 40:
                    if(moveBishop(position, np)) {
                        return false;
                    }
                    break;
                case 11:
                case 50:
                    if(moveKnight(position, np)) {
                        return false;
                    }
                    break;
                case 12:
                case 60:
                    if(movePawn(position, np)) {
                        return false;
                    }
                    break;
            }
        }
    }
            
    return true;
}
function moveKing(pp, np, checkS = false, anm = true) {
    let attacked = true;
    let left = pp[1] - 1 == np[1];
    let right = pp[1] + 1 == np[1];
    let top = pp[0] - 1 == np[0];
    let bottom = pp[0] + 1 == np[0];
    let shortCastle = pp[1] + 2 == np[1];
    let longCastle = pp[1] - 2 == np[1];

    let onlyTop = (pp[0] - 1 == np[0]) && (pp[1] == np[1]);
    let onlyBottom = (pp[0] + 1 == np[0]) && (pp[1] == np[1]);
    let onlyLeft = (pp[1] - 1 == np[1]) && (pp[0] == np[0]);
    let onlyRight = (pp[1] + 1 == np[1]) && (pp[0] == np[0]);

    if(!checkS) {
        attacked = !checkSafety(np);
    }
    
    if(((top && left) || (top && right) || (bottom && left) || (bottom && right) || onlyTop || onlyBottom || onlyLeft || onlyRight) && !attacked) {
        return true;
    }
    else if(shortCastle && pp[0] === np[0] && !attacked && boardData[pp[0]][pp[1] + 1] == 0 && boardData[pp[0]][pp[1] + 2] == 0 && moves[previousPiece] + moves[302] == 0) {
        let fnp = np[1];
        fnp--;
        if(checkSafety([np[0], fnp])) {
            return false;
        }
        if(!anm) {
            boardData[np[0]][np[1] + 1] = 0;
            boardData[np[0]][np[1] - 1] = (turn == 0) ? 902 : 302;
        }
        return true;
    }
    else if(longCastle && pp[0] === np[0] && !attacked && boardData[pp[0]][pp[1] - 1] + boardData[pp[0]][pp[1] - 3] + boardData[pp[0]][pp[1] - 2] == 0 && moves[previousPiece] + moves[301] == 0) {
        let fnp = np[1];
        fnp++;
        if(checkSafety([np[0], fnp])) {
            return false;
        }

        fnp-=2;
        if(checkSafety([np[0], fnp])) {
            return false;
        }
        if(!anm) {
            boardData[np[0]][np[1] - 2] = 0;
            boardData[np[0]][np[1] + 1] = (turn == 0) ? 901 : 301;
        }
        return true;
    }
    else {
        return false;
    }
}

function moveBishop(pp, np) {
    if(((pp[0] + pp[1]) % 2) != ((np[0] + np[1]) % 2) || (pp[0] == np[0] && pp[1] == np[1])) {
        return false;
    }
    else if(!(Math.abs(pp[0] - np[0]) === Math.abs(pp[1] - np[1]))) {
        return false;
    }
    if(!((np[0] == pp[0] + 1) && (np[1] == pp[1] + 1)) || 
       !((np[0] == pp[0] - 1) && (np[1] == pp[1] -1)) || 
       !((np[0] == pp[0] - 1) && (np[1] == pp[1] + 1)) ||
       !((np[0] == pp[0] + 1) && (np[1] == pp[1] - 1))) {
        if(pp[0] < np[0]) {
            let row = pp[0] + 1;
            if(pp[1] < np[1]) {
                let col = pp[1] + 1;
                while(row < np[0]) {
                    if(boardData[row][col] != 0) {
                        return false;
                    }
                    row++;
                    col++;
                }
            }
            else if(pp[1] > np[1]) {
                let col = pp[1] - 1;
                while(row < np[0]) {
                    if(boardData[row][col] != 0) {
                        return false;
                    }
                    row++;
                    col--;
                }
            }
        }
        else if(pp[0] > np[0]) {
            let row = pp[0] - 1;
            if(pp[1] < np[1]) {
                let col = pp[1] + 1;
                while(row > np[0]) {
                    if(boardData[row][col] != 0) {
                        return false;
                    }
                    row--;
                    col++;
                }
            }
            else if(pp[1] > np[1]) {
                let col = pp[1] - 1;
                while(row > np[0]) {
                    if(boardData[row][col] != 0) {
                        return false;
                    }
                    row--;
                    col--;
                }
            }
        }
    } 
    else {
        return false;
    }
    return true;
}


function moveKnight(pp, np) { 
    if(np[0] == pp[0] - 2 && (np[1] == pp[1] - 1 || np[1] == pp[1] + 1)) {
        return true;
    }
    else if(np[0] == pp[0] - 1 && (np[1] == pp[1] - 2 || np[1] == pp[1] + 2)) {
        return true;
    }
    else if(np[0] == pp[0] + 2 && (np[1] == pp[1] + 1 || np[1] == pp[1] - 1)) {
        return true;
    }
    else if(np[0] == pp[0] + 1 && (np[1] == pp[1] + 2 || np[1] == pp[1] - 2)) {
        return true;
    }
    else {
        return false;
    }
}

function moveRook(pp, np) {
    if(np[0] == pp[0] && np[1] != pp[1]) {
        if(pp[1] < np[1]) {
            if(pp[1] + 1 != np[1]) {
                for(let col = pp[1] + 1; col < np[1]; col++) {
                    if(boardData[pp[0]][col] != 0) {
                        return false;
                    }
                }
            }
        }
        else if(pp[1] > np[1]) {
            if(pp[1] - 1 != np[1]) {
                for(let col = pp[1] - 1; col > np[1]; col--) {
                    if(boardData[pp[0]][col] != 0) {
                        return false;
                    }
                }
            }
        }
    }
    else if(np[1] == pp[1] && np[0] != pp[0]) {
        if(pp[0] < np[0]) {
            if(pp[0] + 1 != np[0]) {
                for(let row = pp[0] + 1; row < np[0]; row++) {
                    if(boardData[row][pp[1]] != 0) {
                        return false;
                    }
                }
            }            
        }
        else if(pp[0] > np[0]) {
            if(pp[0] - 1 != np[0]) {
                for(let row = pp[0] - 1; row > np[0]; row--) {
                    if(boardData[row][pp[1]] != 0) {
                        return false;
                    }
                }   
            }
        }
    }
    else {
        return false;
    }
    return true;
}
function getPieceData(pieceVal) {
    let positions = [];

    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            if(String(boardData[row][col]).slice(0, 2) == String(pieceVal)) {
                positions.push([row, col]);
            }
        }
    }
    return positions;
}

function movePawn(pp, np, anm = true) {
    if(turn == 0) {
        if(moves[previousPiece] == 0 && pp[0] + 2 == np[0] && pp[1] == np[1] && boardData[np[0]][np[1]] == 0 && boardData[np[0] - 1][np[1]] == 0) {      
            if(!anm) {
                twoSquares = true;
            }
            return true;
        }
        else if(pp[0] + 1 == np[0] && pp[1] == np[1] && boardData[np[0]][np[1]] == 0) {
            if(!anm) {
                twoSquares = false;
            }
            return true;
        }
        else if(pp[0] + 1 == np[0] && (pp[1] - 1 == np[1] || pp[1] + 1 == np[1]) && boardData[np[0]][np[1]] != 0) {
            if(!anm) {
                twoSquares = false;
            }
            return true;
        }
        else if((pp[0] + 1 == np[0] && pp[1] + 1 == np[1]) && moves[boardData[np[0] - 1][np[1]]] == 1 && lastPlayedPiece == boardData[np[0] - 1][np[1]] && twoSquares == true && boardData[np[0]][np[1]] == 0 && String(boardData[np[0] - 1][np[1]]).startsWith("60")) {
            if(!anm) {
                boardData[np[0] + 1][np[1]] = 0;
                twoSquares = false;
            }
            
            return true;
        }
        else if((pp[0] + 1 == np[0] && pp[1] - 1 == np[1]) && moves[boardData[np[0] - 1][np[1]]] == 1 && lastPlayedPiece == boardData[np[0] - 1][np[1]] && twoSquares == true && boardData[np[0]][np[1]] == 0 && String(boardData[np[0] - 1][np[1]]).startsWith("60")) {
            if(!anm) {
                boardData[np[0] - 1][np[1]] = 0;
                twoSquares = false;
            }
            
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if(moves[previousPiece] == 0 && pp[0] - 2 == np[0] && pp[1] == np[1] && boardData[np[0]][np[1]] == 0 && boardData[np[0] + 1][np[1]] == 0) {
            if(!anm) {
                twoSquares = true;
            }
            return true;
        }
        else if(pp[0] - 1 == np[0] && pp[1] == np[1] && boardData[np[0]][np[1]] == 0) {
            if(!anm) {
                twoSquares = false;
            }
            return true;
        }
        else if(pp[0] - 1 == np[0] && (pp[1] - 1 == np[1] || pp[1] + 1 == np[1]) && boardData[np[0]][np[1]] != 0) {
            if(!anm) {
                twoSquares = false;
            }
            return true;
        }
        else if((pp[0] - 1 == np[0] && pp[1] - 1 == np[1]) && moves[boardData[np[0] + 1][np[1]]] == 1 && lastPlayedPiece == boardData[np[0] + 1][np[1]] && twoSquares == true && boardData[np[0]][np[1]] == 0 && String(boardData[np[0] + 1][np[1]]).startsWith("60")) {
            if(!anm) {
                boardData[np[0] - 1][np[1]] = 0;
                twoSquares = false;
            }
            
            return true;
        }
        else if((pp[0] - 1 == np[0] && (pp[1] - 1 == np[1] || pp[1] + 1 == np[1])) && moves[boardData[np[0] + 1][np[1]]] == 1 && lastPlayedPiece == boardData[np[0] + 1][np[1]] && twoSquares == true && boardData[np[0]][np[1]] == 0) {
            if(!anm) {
                boardData[np[0] + 1][np[1]] = 0;
                twoSquares = false;
            }
            
            return true;
        }
        else {
            return false;
        }
    }
    switch(turn) {
        case 1:
            turn = 0;
            break;
        case 0:
            turn = 1;
            break;
    }
}

function rotateBoard(){
    if(turn == 0) {
        board.style.transform = "rotate(180deg)";
        for (const row of squares) {
            for (const square of row) {
                square.style.transform = "rotate(180deg)";
            }
        }
    }
    else if(turn == 1) {
        board.style.transform = "none";
        for (const row of squares) {
            for (const square of row) {
                square.style.transform = "none";
            }
        }
    }
}

function addSquares() {
    for (let row=0; row < 8; row++) {
        for (let col=0; col < 8; col++) {
            let square = document.createElement("div");
            square.style.display = "inline-block";

            if((row + col) % 2 === 0) {
                square.className = "light_square";
            }
            else {
                square.className = "dark_square";
            }
            square.style.position = "relative";
            square.style.left = col + "px";
            square.style.display = "flex";
            square.style.justifyContent = "center";
            square.style.alignItems = "center";
            square.style.overflow = "auto";
            square.innerHTML = 0;

            square.addEventListener("click", () => {
                if(!promoting && gameRunning) {
                    movementManager(row, col, boardData[row][col]);   
                    
                }
            });

            board.appendChild(square);
            squares[row].push(square);
        }
    }
}

addSquares();
drawPieces();