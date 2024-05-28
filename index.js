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
    if (this.board[x][y] !== null) {
      const ship = this.board[x][y]
      ship.hit();
      this.board[y][x] = 'hit';
      return { result: "hit", sunk: ship.isSunk() };
    } else {
      this.board[y][x] = 'miss';
      return { result: 'miss' };
    }
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