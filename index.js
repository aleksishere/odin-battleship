const boardsDiv = document.getElementById('boards');

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

  receiveAttack(x,y) {
    if (this.board[y][x] !== null) {
      const ship = this.board[y][x]
      ship.hit();
      this.board[y][x] = 'hit';
      return { result: "hit", sunk: ship.isSunk() };
    } else {
      this.board[y][x] = 'miss';
      return { result: 'miss' };
    }
  }
}

class Guessboard {
  constructor(playerName, opponent=null) {
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

  attack(x,y) {
    return this.opponent.receiveAttack(x,y)
  }

  guess(x, y, player, opponent) {
     if (opponent.gameboard.board[y][x] !== null) {
      player.guessboard.board[y][x] = 'hit';
      return { result: "hit" };
    } else {
      opponent.guessboard.board[y][x] = 'miss';
      return { result: 'miss' };
     }
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard(name);
    this.guessboard = new Guessboard(name);
    this.turn = false;
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

function startGame(p1Name, p2Name) {
  const player1 = new RealPlayer(p1Name);
  const player2 = new RealPlayer(p2Name);
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
  player1.guessboard.attack(0, 3);
  drawBoards(player1, player2);
}

function drawBoards(player1, player2) {
  boardsDiv.innerHTML = '';
  const players = [player1, player2]
  players.forEach(player => {
    const pGameboard = document.createElement('div');
    const pGuessboard = document.createElement('div');
    const pNickname = document.createElement('div');
    pNickname.innerText = player.gameboard.playerName; 
    pGuessboard.id = player.gameboard.playerName;
    boardsDiv.appendChild(pGameboard);
    pGameboard.appendChild(pNickname);
    boardsDiv.appendChild(pGuessboard);

    player.gameboard.board.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.style = "display: flex;"
      pGameboard.appendChild(rowDiv)
      row.forEach((cell) => {
        const cellDiv = document.createElement('div');
        if (cell === null) {
            cellDiv.innerText = 'O';
        } else if (cell === 'hit') {
            cellDiv.innerText = 'X';
        } else if (cell === 'miss') {
            cellDiv.innerText = '*';
        } else {
            cellDiv.innerText = 'S';
        }
        rowDiv.appendChild(cellDiv);
      })
    })

    player.guessboard.board.forEach((row, rowIndex) => {
      const rowDiv = document.createElement("div");
      rowDiv.style = "display: flex;"
      pGuessboard.appendChild(rowDiv)
      row.forEach((cell, columnIndex) => {
        const cellDiv = document.createElement('div');
        cellDiv.addEventListener('click', function (event) {
          if (player1.turn && event.target.parentNode.parentNode.id === player1.name) {
            player1.guessboard.attack(columnIndex, rowIndex)
            player1.guessboard.guess(columnIndex, rowIndex, player1, player2)
            player1.turn = !player1.turn;
            player2.turn = !player2.turn;
          }
          if (player2.turn && event.target.parentNode.parentNode.id === player2.name) {
            player2.guessboard.attack(columnIndex, rowIndex)
            player2.guessboard.guess(columnIndex, rowIndex, player2, player1)
            player1.turn = !player1.turn;
            player2.turn = !player2.turn;
          }
          drawBoards(player1, player2)
        })

        if (cell === null) {
            cellDiv.innerText = 'O';
        } else if (cell === 'hit') {
            cellDiv.innerText = 'X';
        } else if (cell === 'miss') {
            cellDiv.innerText = '*';
        } else {
            cellDiv.innerText = 'S';
        }
        rowDiv.appendChild(cellDiv);
      })
    })

  });
}