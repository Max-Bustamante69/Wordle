class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.tries = 0;
    this.gameOver = false;
    this.currentRow = 0;
    this.missedChars = new Set();
  }



  nextTry() {
    this.tries++;
    this.currentRow++;
  }

  isGameOver() {
    return this.gameOver;
  }

  miss(char){
    this.missedChars.add(char);
  }

  endGame() {
    this.gameOver = true;
  }
}

export default GameState;