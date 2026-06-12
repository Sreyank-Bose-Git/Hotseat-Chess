const PIECES = {
  wp: "♙", wr: "♖", wn: "♘", wb: "♗", wq: "♕", wk: "♔",
  bp: "♟", br: "♜", bn: "♞", bb: "♝", bq: "♛", bk: "♚"
};

const boardElement = document.getElementById("board");
const turnLabel = document.getElementById("turnLabel");
const gameState = document.getElementById("gameState");
const moveHistoryElement = document.getElementById("moveHistory");
const resetBtn = document.getElementById("resetBtn");

const initialBoard = [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
];

let state = createInitialState();

function createInitialState() {
  return {
    board: initialBoard.map((row) => [...row]),
    turn: "w",
    selected: null,
    legalMoves: [],
    moveHistory: [],
    lastMove: null,
    enPassantTarget: null,
    castlingRights: {
      wK: true,
      wQ: true,
      bK: true,
      bQ: true
    },
    status: "playing"
  };
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function colorOf(piece) {
  return piece ? piece[0] : null;
}

function pieceType(piece) {
  return piece ? piece[1] : null;
}

function cloneGame(game) {
  return {
    board: game.board.map((row) => [...row]),
    turn: game.turn,
    selected: game.selected ? { ...game.selected } : null,
    legalMoves: game.legalMoves.map((move) => ({ ...move })),
    moveHistory: [...game.moveHistory],
    lastMove: game.lastMove ? { ...game.lastMove } : null,
    enPassantTarget: game.enPassantTarget ? { ...game.enPassantTarget } : null,
    castlingRights: { ...game.castlingRights },
    status: game.status
  };
}

function squareName(r, c) {
  return `${String.fromCharCode(97 + c)}${8 - r}`;
}

function getKingPosition(game, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (game.board[r][c] === `${color}k`) {
        return { r, c };
      }
    }
  }
  return null;
}

function isSquareAttacked(game, r, c, byColor) {
  const enemyPawnDir = byColor === "w" ? -1 : 1;
  const pawnRow = r - enemyPawnDir;
  for (const dc of [-1, 1]) {
    const pc = c + dc;
    if (inBounds(pawnRow, pc) && game.board[pawnRow][pc] === `${byColor}p`) {
      return true;
    }
  }

  const knightOffsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightOffsets) {
    const nr = r + dr;
    const nc = c + dc;
    if (inBounds(nr, nc) && game.board[nr][nc] === `${byColor}n`) {
      return true;
    }
  }

  const lineChecks = [
    { dirs: [[1, 0], [-1, 0], [0, 1], [0, -1]], sliders: ["r", "q"] },
    { dirs: [[1, 1], [1, -1], [-1, 1], [-1, -1]], sliders: ["b", "q"] }
  ];

  for (const check of lineChecks) {
    for (const [dr, dc] of check.dirs) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc)) {
        const piece = game.board[nr][nc];
        if (piece) {
          if (colorOf(piece) === byColor && check.sliders.includes(pieceType(piece))) {
            return true;
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && game.board[nr][nc] === `${byColor}k`) {
        return true;
      }
    }
  }

  return false;
}

function isInCheck(game, color) {
  const king = getKingPosition(game, color);
  if (!king) return false;
  return isSquareAttacked(game, king.r, king.c, color === "w" ? "b" : "w");
}

function generatePseudoMoves(game, r, c) {
  const piece = game.board[r][c];
  if (!piece) return [];

  const color = colorOf(piece);
  const type = pieceType(piece);
  const moves = [];

  if (type === "p") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    const nextRow = r + dir;

    if (inBounds(nextRow, c) && !game.board[nextRow][c]) {
      moves.push({ toR: nextRow, toC: c, special: "normal" });
      const jumpRow = r + 2 * dir;
      if (r === startRow && !game.board[jumpRow][c]) {
        moves.push({ toR: jumpRow, toC: c, special: "double" });
      }
    }

    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = game.board[nr][nc];
      if (target && colorOf(target) !== color) {
        moves.push({ toR: nr, toC: nc, special: "capture" });
      }

      if (game.enPassantTarget && game.enPassantTarget.r === nr && game.enPassantTarget.c === nc) {
        moves.push({ toR: nr, toC: nc, special: "en-passant" });
      }
    }
  }

  if (type === "n") {
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (!inBounds(nr, nc)) continue;
      const target = game.board[nr][nc];
      if (!target || colorOf(target) !== color) {
        moves.push({ toR: nr, toC: nc, special: target ? "capture" : "normal" });
      }
    }
  }

  if (["b", "r", "q"].includes(type)) {
    const directions = [];
    if (type === "b" || type === "q") {
      directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
    }
    if (type === "r" || type === "q") {
      directions.push([1, 0], [-1, 0], [0, 1], [0, -1]);
    }

    for (const [dr, dc] of directions) {
      let nr = r + dr;
      let nc = c + dc;
      while (inBounds(nr, nc)) {
        const target = game.board[nr][nc];
        if (!target) {
          moves.push({ toR: nr, toC: nc, special: "normal" });
        } else {
          if (colorOf(target) !== color) {
            moves.push({ toR: nr, toC: nc, special: "capture" });
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  }

  if (type === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        const target = game.board[nr][nc];
        if (!target || colorOf(target) !== color) {
          moves.push({ toR: nr, toC: nc, special: target ? "capture" : "normal" });
        }
      }
    }

    const rights = game.castlingRights;
    const isWhite = color === "w";
    const row = isWhite ? 7 : 0;
    const enemy = isWhite ? "b" : "w";

    if (r === row && c === 4 && !isInCheck(game, color)) {
      if ((isWhite ? rights.wK : rights.bK) && !game.board[row][5] && !game.board[row][6]) {
        if (!isSquareAttacked(game, row, 5, enemy) && !isSquareAttacked(game, row, 6, enemy)) {
          moves.push({ toR: row, toC: 6, special: "castle-kingside" });
        }
      }

      if ((isWhite ? rights.wQ : rights.bQ) && !game.board[row][1] && !game.board[row][2] && !game.board[row][3]) {
        if (!isSquareAttacked(game, row, 3, enemy) && !isSquareAttacked(game, row, 2, enemy)) {
          moves.push({ toR: row, toC: 2, special: "castle-queenside" });
        }
      }
    }
  }

  return moves;
}

function applyMove(game, fromR, fromC, move, { evaluateStatus = true } = {}) {
  const piece = game.board[fromR][fromC];
  const color = colorOf(piece);
  const type = pieceType(piece);
  const next = cloneGame(game);

  next.selected = null;
  next.legalMoves = [];
  next.enPassantTarget = null;

  next.board[fromR][fromC] = "";

  if (move.special === "en-passant") {
    const captureRow = color === "w" ? move.toR + 1 : move.toR - 1;
    next.board[captureRow][move.toC] = "";
  }

  if (move.special === "castle-kingside") {
    next.board[move.toR][move.toC] = piece;
    next.board[move.toR][5] = `${color}r`;
    next.board[move.toR][7] = "";
  } else if (move.special === "castle-queenside") {
    next.board[move.toR][move.toC] = piece;
    next.board[move.toR][3] = `${color}r`;
    next.board[move.toR][0] = "";
  } else {
    let movedPiece = piece;
    if (type === "p" && (move.toR === 0 || move.toR === 7)) {
      movedPiece = `${color}q`;
    }
    next.board[move.toR][move.toC] = movedPiece;

    if (move.special === "double") {
      next.enPassantTarget = {
        r: color === "w" ? move.toR + 1 : move.toR - 1,
        c: move.toC
      };
    }
  }

  if (piece === "wk") {
    next.castlingRights.wK = false;
    next.castlingRights.wQ = false;
  }
  if (piece === "bk") {
    next.castlingRights.bK = false;
    next.castlingRights.bQ = false;
  }
  if (piece === "wr" && fromR === 7 && fromC === 0) next.castlingRights.wQ = false;
  if (piece === "wr" && fromR === 7 && fromC === 7) next.castlingRights.wK = false;
  if (piece === "br" && fromR === 0 && fromC === 0) next.castlingRights.bQ = false;
  if (piece === "br" && fromR === 0 && fromC === 7) next.castlingRights.bK = false;

  const captured = game.board[move.toR][move.toC];
  if (captured === "wr" && move.toR === 7 && move.toC === 0) next.castlingRights.wQ = false;
  if (captured === "wr" && move.toR === 7 && move.toC === 7) next.castlingRights.wK = false;
  if (captured === "br" && move.toR === 0 && move.toC === 0) next.castlingRights.bQ = false;
  if (captured === "br" && move.toR === 0 && move.toC === 7) next.castlingRights.bK = false;

  const moveLabel = `${piece.toUpperCase()} ${squareName(fromR, fromC)} → ${squareName(move.toR, move.toC)}${move.special === "en-passant" ? " e.p." : ""}${move.special.includes("castle") ? " castle" : ""}`;
  next.moveHistory = [...game.moveHistory, moveLabel];

  next.lastMove = { fromR, fromC, toR: move.toR, toC: move.toC };
  next.turn = color === "w" ? "b" : "w";

  if (evaluateStatus) {
    const opponentMoves = getAllLegalMoves(next, next.turn);
    const opponentInCheck = isInCheck(next, next.turn);

    if (opponentMoves.length === 0) {
      next.status = opponentInCheck ? "checkmate" : "stalemate";
    } else if (opponentInCheck) {
      next.status = "check";
    } else {
      next.status = "playing";
    }
  } else {
    next.status = isInCheck(next, next.turn) ? "check" : "playing";
  }

  return next;
}

function getLegalMovesForPiece(game, r, c) {
  const piece = game.board[r][c];
  if (!piece || colorOf(piece) !== game.turn) return [];

  const pseudoMoves = generatePseudoMoves(game, r, c);
  const legal = [];

  for (const move of pseudoMoves) {
    const next = applyMove(game, r, c, move, { evaluateStatus: false });
    if (!isInCheck(next, game.turn)) {
      legal.push(move);
    }
  }

  return legal;
}

function getAllLegalMoves(game, color) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c];
      if (!piece || colorOf(piece) !== color) continue;
      const pseudo = generatePseudoMoves(game, r, c);
      for (const move of pseudo) {
        const next = applyMove(game, r, c, move, { evaluateStatus: false });
        if (!isInCheck(next, color)) {
          moves.push({ fromR: r, fromC: c, ...move });
        }
      }
    }
  }
  return moves;
}

function handleSquareClick(r, c) {
  if (state.status === "checkmate" || state.status === "stalemate") {
    return;
  }

  const clickedPiece = state.board[r][c];

  if (state.selected) {
    const move = state.legalMoves.find((m) => m.toR === r && m.toC === c);
    if (move) {
      state = applyMove(state, state.selected.r, state.selected.c, move);
      render();
      return;
    }
  }

  if (clickedPiece && colorOf(clickedPiece) === state.turn) {
    state.selected = { r, c };
    state.legalMoves = getLegalMovesForPiece(state, r, c);
  } else {
    state.selected = null;
    state.legalMoves = [];
  }

  render();
}

function statusText() {
  if (state.status === "checkmate") {
    const winner = state.turn === "w" ? "Black" : "White";
    return `Checkmate! ${winner} wins.`;
  }
  if (state.status === "stalemate") {
    return "Stalemate! It's a draw.";
  }
  if (state.status === "check") {
    return `${state.turn === "w" ? "White" : "Black"} is in check.`;
  }
  return "Game in progress";
}

function render() {
  boardElement.innerHTML = "";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement("button");
      square.type = "button";
      square.className = `square ${(r + c) % 2 === 0 ? "light" : "dark"}`;
      square.setAttribute("aria-label", `Square ${squareName(r, c)}`);

      const piece = state.board[r][c];
      square.textContent = piece ? PIECES[piece] : "";

      if (state.selected && state.selected.r === r && state.selected.c === c) {
        square.classList.add("selected");
      }

      if (state.lastMove && ((state.lastMove.fromR === r && state.lastMove.fromC === c) || (state.lastMove.toR === r && state.lastMove.toC === c))) {
        square.classList.add("last-move");
      }

      const legalMove = state.legalMoves.find((m) => m.toR === r && m.toC === c);
      if (legalMove) {
        const target = state.board[r][c];
        if (target || legalMove.special === "en-passant") {
          square.classList.add("capture");
        } else {
          square.classList.add("legal");
        }
      }

      square.addEventListener("click", () => handleSquareClick(r, c));
      boardElement.appendChild(square);
    }
  }

  turnLabel.textContent = `${state.turn === "w" ? "White" : "Black"} to move`;
  gameState.textContent = statusText();

  moveHistoryElement.innerHTML = "";
  state.moveHistory.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = entry;
    moveHistoryElement.appendChild(li);
  });

  moveHistoryElement.scrollTop = moveHistoryElement.scrollHeight;
}

resetBtn.addEventListener("click", () => {
  state = createInitialState();
  render();
});

render();
