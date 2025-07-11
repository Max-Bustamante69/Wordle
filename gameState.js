class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.tries = 0;
    this.gameOver = false;
    this.currentRow = 0;
  }

  nextTry() {
    this.tries++;
    this.currentRow++;
  }

  isGameOver() {
    return this.gameOver;
  }



  endGame() {
    this.gameOver = true;
  }
}

export default GameState;
