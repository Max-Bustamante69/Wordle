class Wordle {
  constructor(secret) {
    this._secret = secret;
    this._secretCount = [...secret].reduce((map, char) => {
      map[char] = (map[char] || 0) + 1;
      return map;
    }, {});
  }

  set secret(word) {
    this._secret = word;
  }

  get secret() {
    return this._secret;
  }

  get secretCount() {
    return this._secretCount;
  }

  testWord(word) {
    return word === this._secret ? "win" : this.colorWord(word);
  }

  colorWord(word) {
    const count = structuredClone(this._secretCount);
    const coloredWord = new Array(5).fill("grey");

    for (let i = 0; i < 5; i++) {
      if (this._secret[i] === word[i]) {
        coloredWord[i] = "green";
        count[word[i]]--;
      }
    }

    for (let i = 0; i < 5; i++) {
      if (count[word[i]] && coloredWord[i] === "grey") {
        coloredWord[i] = "yellow";
        count[i]--;
      }
    }

    return coloredWord;
  }
}

export default Wordle;