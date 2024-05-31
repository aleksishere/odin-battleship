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
  constructor() {
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

  drawBoard(pName) {
  /*this.board.forEach(row => {
    console.log(row.map(cell => cell === null ? 'empty' : cell).join(' '));
  }); */
    const pDiv = document.createElement('div');
    pDiv.id = pName;
    boardsDiv.appendChild(pDiv);
    this.board.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.style = "display: flex;"
      pDiv.appendChild(rowDiv)
      row.forEach(cell => {
        const cellDiv = document.createElement('div');
        cellDiv.innerText = cell === null ? 'O' : 'S';
        rowDiv.appendChild(cellDiv);
      })
    })
  }
}

class Player {
  constructor(name) {
    this.name = name;
    this.gameboard = new Gameboard();
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
  const player2 = new BotPlayer(p2Name);

  const ship1 = new Ship(3);
  player1.gameboard.placeShip(ship1, 0, 0, "vertical");
  player1.gameboard.placeShip(ship1, 0, 3, "horizontal");
  player1.gameboard.placeShip(ship1, 7, 0, "vertical");
  player1.gameboard.placeShip(ship1, 3, 8, "horizontal");
  player1.gameboard.drawBoard(p1Name)

  player2.gameboard.placeShip(ship1, 0, 3, "horizontal");
  player2.gameboard.placeShip(ship1, 3, 2, "vertical");
  player2.gameboard.placeShip(ship1, 7, 1, "vertical");
  player2.gameboard.placeShip(ship1, 4, 7, "horizontal");
  player2.gameboard.drawBoard(p2Name)
}