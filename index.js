const boardsDiv = document.getElementById('boards');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn')
const player1Controller = document.getElementById('player1-control')
const player2Controller = document.getElementById('player2-control')

class Ship {
  constructor(length) {
    this.length = length
    this.hits = 0;
    this.sunk = false;
  }

  hit() {
    this.hits++
    if (this.hits >= this.length) {
      this.sunk = true;
    }
  }

  isSunk() {
    return this.sunk;
  }
}

class Gameboard {
  constructor(playerName) {
    this.playerName = playerName;
    this.shipCount = 0;
    this.board = [];
    for (let i = 0; i < 10; i++) {
      let row = []
      for (let j = 0; j < 10; j++) {
        row.push(null);
      }
      this.board.push(row);
    }
  }

  placeShip(ship, x, y, dir) {
    if (this.shipCount >= 5) return false;
    if (dir === "vertical") {
      if (x + ship.length > 10) {
        console.error("Out of bounds!");
        return false;
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y][x + i] !== null) {
          console.error("Ship collides with another ship!");
          return false;
        }
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[y][x + i] = ship;
      }
    } else if (dir === "horizontal") {
      if (y + ship.length > 10) {
        console.error("Out of bounds!");
        return false;
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y + i][x] !== null) {
          console.error("Ship collides with another ship!");
          return false;
        }
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[y+i][x] = ship;
      }
    } else {
      console.error("Invalid direction!");
      return false;
    }
    this.shipCount++;
    return true;
  }

  receiveAttack(x, y) {
    let result;
    if (this.board[y][x] instanceof Ship) {
      const ship = this.board[y][x]
      ship.hit();
      this.board[y][x] = "hit"
      result = { result: "hit", sunk: ship.isSunk() };
    } else {
      this.board[y][x] = "miss"
      result = { result: 'miss' };
      changeTurn()
    }
    return result;
  }

  checkIfPlayerWon() {
    for (let i = 0; i < this.board.length; i++) {
        for (let j = 0; j < this.board[i].length; j++) {
          const cell = this.board[i][j];
          if (cell instanceof Ship) {
            if (!cell.isSunk()) {
              return false;
            }
          }
        }
      }
      return true;
  }

  generateBoard() {
    if (isGameReady) {
      console.error("Game already started!")
      return false;
    }
    while (this.shipCount < 5) {
      const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      const length = Math.floor(Math.random() * (4 - 1)) + 1;
      this.placeShip(new Ship(length), col, row, direction)
    }
    drawBoards()
  }

}


class Guessboard {
  constructor(playerName, opponent = null) {
    this.playerName = playerName;
    this.opponent = opponent;
    this.board = [];
    for (let i = 0; i < 10; i++) {
      let row = []
      for (let j = 0; j < 10; j++) {
        row.push(null);
      }
      this.board.push(row);
    }
  }

  setOpponent(enemy) {
    this.opponent = enemy;
  }

  guess(x, y) {
    if (!isGameReady) {
      console.warn("Game is not ready!")
      return false;
    }
    if (this.board[y][x] !== null) {
      console.warn("User already clicked on this.")
      return false;
    }
    const attackResult = this.opponent.receiveAttack(x, y);
    if (attackResult.result === 'hit') {
      this.board[y][x] = 'hit';
    } else if (attackResult.result === 'miss') {
      this.board[y][x] = 'miss';
    }
    return attackResult;
  }

  guessRandom() {
    if (!isGameReady) {
      console.warn("Game is not ready!");
      return false;
    }

    let x, y;
    while (player2.turn) {
      do {
        x = Math.floor(Math.random() * this.board.length);
        y = Math.floor(Math.random() * this.board.length);
      } while (this.board[y][x] !== null);

      const attackResult = this.opponent.receiveAttack(x, y);
      if (attackResult.result === 'hit') {
        this.board[y][x] = 'hit'; 
      } else if (attackResult.result === 'miss') {
        this.board[y][x] = 'miss';
      } 
    }
  }
}

class Player {
  constructor(name="Player") {
    this.name = name;
    this.gameboard = new Gameboard(name);
    this.guessboard = new Guessboard(name);
    this.turn = false;
  }

  setName(name) {
    this.name = name
    this.gameboard = new Gameboard(name);
    this.guessboard = new Guessboard(name);
  }

}

function drawBoards() {
  boardsDiv.innerHTML = '';
  let players = []
  isBot ? players = [player1] : players = [player1, player2]
  players.forEach(player => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add("player-container");

    const pNickname = document.createElement('div');
    pNickname.innerText = player.gameboard.playerName;
    pNickname.classList.add("nickname");
    playerContainer.appendChild(pNickname);

    const pGameboard = document.createElement('div');
    pGameboard.classList.add("gameboard");
      player.gameboard.board.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("row");
      pGameboard.appendChild(rowDiv);
      row.forEach((cell) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add("cell");
        if (cell === null) {
          cellDiv.classList.add('noShip')
        } else if (cell === "hit") {
          cellDiv.classList.add('hitShip')
        } else if (cell === "miss") {
          cellDiv.classList.add('missShip')
        } else {
          cellDiv.classList.add('ship')
        }
        rowDiv.appendChild(cellDiv);
      });
    });
    playerContainer.appendChild(pGameboard);

    const pGuessboard = document.createElement('div');
    pGuessboard.id = player.gameboard.playerName;
    pGuessboard.classList.add("guessboard");
    player.guessboard.board.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("row");
      pGuessboard.appendChild(rowDiv);
      row.forEach((cell, columnIndex) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add("cell");
        cellDiv.style.cursor = "pointer";
        cellDiv.addEventListener('click', function (event) {
          if (player1.turn && event.target.parentNode.parentNode.id === player1.name) {
            player1.guessboard.guess(columnIndex, rowIndex)
            if (isBot && player2.turn) {
              player2.guessboard.guessRandom();
            }
          }
          if (player2.turn && event.target.parentNode.parentNode.id === player2.name) {
            player2.guessboard.guess(columnIndex, rowIndex)
          }
          drawBoards()
          checkForWin();
        });
        if (cell === null) {
          cellDiv.classList.add('noShip')
        } else if (cell === "hit") {
          cellDiv.classList.add('hitShip')
        } else if (cell === "miss") {
          cellDiv.classList.add('missShip')
        } else {
          cellDiv.classList.add('ship')
        }
        rowDiv.appendChild(cellDiv);
      });
    });
    playerContainer.appendChild(pGuessboard);
    boardsDiv.appendChild(playerContainer);
  })
}

function checkForWin() {
  if (isGameReady && !isGameFinished) {
    if (player1.gameboard.checkIfPlayerWon()) {
      isGameFinished = true;
      alert(`${player2.name} won!`);
    } else if (player2.gameboard.checkIfPlayerWon()) {
      isGameFinished = true;
      alert(`${player1.name} won!`);
    }  
  }
}

function checkEqualShipCount() {
  return player1.gameboard.shipCount === player2.gameboard.shipCount;
}

function changeTurn() {
  player1.turn = !player1.turn;
  player2.turn = !player2.turn;
}

restartBtn.addEventListener("click", function () {
  player1.setName(player1.name)
  player2.setName(player2.name)
  drawBoards(player1, player2)
  player1.guessboard.setOpponent(player2.gameboard)
  player2.guessboard.setOpponent(player1.gameboard)
  isGameReady = false;
  isGameFinished = true;
  if (isBot) player2.gameboard.generateBoard(); // Generate board when restarting board against bot.
})

startBtn.addEventListener("click", () => {
  if (isGameReady) {
    throw new Error("Game already started")
  };
  if (!checkEqualShipCount()) {
    throw new Error("Players ship count is not equal")
  }
  player1.turn = true;
  player2.turn = false;
  isGameReady = true;
  isGameFinished = false;
})

document.getElementById("player1Btn").addEventListener("click", () => {
  if (!isGameReady) {
    console.log(document.getElementById('p1Moves').value)
    player1.gameboard.placeShip(new Ship(Number(document.getElementById("player1Length").value)), Number(document.getElementById("player1X").value), Number(document.getElementById("player1Y").value), String(document.getElementById('p1Moves').value));
    drawBoards(player1, player2)
  }
})

document.getElementById("player2Btn").addEventListener("click", () => {
  if (!isGameReady) {
    player2.gameboard.placeShip(new Ship(Number(document.getElementById("player2Length").value)), Number(document.getElementById("player2X").value), Number(document.getElementById("player2Y").value), String(document.getElementById('p2Moves').value));
    drawBoards(player1, player2)
  }
})

let isBot = false;
let isGameFinished = false;
let isGameReady = false;
const player1 = new Player();
const player2 = new Player();
player1.setName("Player 1");
player2.setName("Player 2");
player1.turn = true;
player1.guessboard.setOpponent(player2.gameboard)
player2.guessboard.setOpponent(player1.gameboard)
drawBoards(player1, player2);

document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("playerModal").style.display = "block";
  document.getElementById("playerForm").onsubmit = function(e) {
    e.preventDefault();
    const player1Name = document.getElementById("player1Name").value;
    const player2Name = document.getElementById("player2Name").value;
    isBot = document.getElementById("player2IsBot").checked;
    player1.setName(player1Name);
    player1.setName(player2Name);
    document.getElementById("player1Nickname").innerText = player1Name
    document.getElementById("player2Nickname").innerText = player2Name
    player1.guessboard.setOpponent(player2.gameboard)
    player2.guessboard.setOpponent(player1.gameboard)
    if (isBot) {
      player2.gameboard.generateBoard();
      document.getElementById('player2-control').style.display = "none";
    }
    drawBoards();

    document.getElementById("playerModal").style.display = "none";
  };
});

document.getElementById("player1GenerateBoard").addEventListener("click", () => {player1.gameboard.generateBoard()})
document.getElementById("player2GenerateBoard").addEventListener("click", () => {player2.gameboard.generateBoard()})