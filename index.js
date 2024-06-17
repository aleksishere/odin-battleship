const boardsDiv = document.getElementById('boards');
const restartBtn = document.getElementById('restart-btn');

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
    if (dir === "horizontal") {
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
    } else if (dir === "vertical") {
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
    if (this.board[y][x] == "hit" || this.board[y][x] == "miss") {
      console.warn("User already clicked on this.")
      return false;
    }
    if (this.board[y][x] !== null) {
      const ship = this.board[y][x]
      ship.hit();
      this.board[y][x] = "hit"
      changeTurn()
      return { result: "hit", sunk: ship.isSunk() };
    } else {
      this.board[y][x] = "miss"
      changeTurn()
      return { result: 'miss' };
    }
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
    if (this.opponent.board[y][x] === "miss") {
      console.warn("User already clicked on this.")
      return false;
    } else if (this.opponent.board[y][x] !== null) {
      this.board[y][x] = 'hit';
    } else {
      this.board[y][x] = 'miss';
    }
    return false;
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

const player1 = new RealPlayer();
const player2 = new RealPlayer();
player1.setName("Aleks");
player2.setName("Player 2");
player1.turn = true;
player1.guessboard.setOpponent(player2.gameboard)
player2.guessboard.setOpponent(player1.gameboard)

player1.gameboard.placeShip(new Ship(3), 0, 0, "vertical");
player1.gameboard.placeShip(new Ship(3), 0, 3, "horizontal");
player1.gameboard.placeShip(new Ship(3), 7, 0, "vertical");
player1.gameboard.placeShip(new Ship(3), 3, 8, "horizontal");
  
player2.gameboard.placeShip(new Ship(3), 0, 3, "horizontal");
player2.gameboard.placeShip(new Ship(3), 3, 2, "vertical");
player2.gameboard.placeShip(new Ship(3), 7, 1, "vertical");
player2.gameboard.placeShip(new Ship(3), 4, 7, "horizontal");
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
            player2.gameboard.receiveAttack(columnIndex, rowIndex)
          }
          if (player2.turn && event.target.parentNode.parentNode.id === player2.name) {
            player2.guessboard.guess(columnIndex, rowIndex, player2)
            player1.gameboard.receiveAttack(columnIndex, rowIndex)
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
  if (player1.gameboard.checkIfPlayerWon()) {
    alert(`${player2.name} won!`);
  } else if (player2.gameboard.checkIfPlayerWon()) {
    alert(`${player1.name} won!`);
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
})