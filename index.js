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
    if (dir === "vertical") {
      if (x + ship.length > 10) {
        throw new Error("Out of bounds!");
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y][x + i] !== null) {
          throw new Error("Ship collides with another ship!")
        }
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[y][x + i] = ship;
      }
    } else if (dir === "horizontal") {
      if (y + ship.length > 10) {
        throw new Error("Out of bounds!");
      }
      for (let i = 0; i < ship.length; i++) {
        if (this.board[y+i][x] !== null) {
          throw new Error("Ship collides with another ship!")
        }
      }
      for (let i = 0; i < ship.length; i++) {
        this.board[y+i][x] = ship;
      }
    } else {
      throw new Error("Invalid direction!")
    }
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
    }
    changeTurn()
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

class RealPlayer extends Player {
  constructor(name) {
    super(name)
  }
}

class BotPlayer extends Player {
  constructor(name) {
    super(name)
  }
}
let isGameReady = false;
const player1 = new RealPlayer();
const player2 = new RealPlayer();
player1.setName("Aleks");
player2.setName("Player 2");
player1.turn = true;
player1.guessboard.setOpponent(player2.gameboard)
player2.guessboard.setOpponent(player1.gameboard)
drawBoards(player1, player2);

function drawBoards(player1, player2) {
  boardsDiv.innerHTML = '';
  const players = [player1, player2];
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
            player1.guessboard.guess(columnIndex, rowIndex, player1)
          }
          if (player2.turn && event.target.parentNode.parentNode.id === player2.name) {
            player2.guessboard.guess(columnIndex, rowIndex, player2)
          }
          drawBoards(player1, player2)
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
  if (isGameReady) {
    if (player1.gameboard.checkIfPlayerWon()) {
      alert(`${player2.name} won!`);
    } else if (player2.gameboard.checkIfPlayerWon()) {
      alert(`${player1.name} won!`);
    }  
  }
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
})

startBtn.addEventListener("click", () => {
  if (isGameReady) {
    throw new Error("Game already started")
  };
  player1.turn = true;
  player2.turn = false;
  isGameReady = true;
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