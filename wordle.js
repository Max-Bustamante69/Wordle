import CONSTANTS from "./constants.js";
class Wordle {
  constructor(secret) {
    this.secret = secret;
  }

  set secret(word) {
    if (!word || typeof word !== "string") {
      throw new Error("Secret word must be a valid string");
    }

    const cleanWord = word.toLowerCase().trim();
    if (cleanWord.length !== CONSTANTS.WORD_LENGTH) {
      throw new Error(
        `Secret word must be exactly ${CONSTANTS.WORD_LENGTH} characters`
      );
    }

    if (!/^[a-z]+$/.test(cleanWord)) {
      throw new Error("Secret word must contain only letters");
    }

    this._secret = cleanWord.toUpperCase();
    this.secretSet = new Set(this._secret);
  }

  get secret() {
    return this._secret;
  }

  get colors() {
    return CONSTANTS.COLORS;
  }

  createCharCount(word) {
    const count = {};
    for (const char of word) {
      count[char] = (count[char] || 0) + 1;
    }
    return count;
  }

  testWord(word) {
    if (!word || typeof word !== "string") return false;
    return word.trim() === this.secret;
  }

  colorWord(word) {
    if (
      !word ||
      typeof word !== "string" ||
      word.length !== CONSTANTS.WORD_LENGTH
    ) {
      throw new Error(
        `Word must be exactly ${CONSTANTS.WORD_LENGTH} characters`
      );
    }

    const cleanWord = word.trim();
    const secretCount = this.createCharCount(this.secret);
    const result = new Array(CONSTANTS.WORD_LENGTH).fill(CONSTANTS.COLORS.MISS);

    // First pass: mark correct positions
    for (let i = 0; i < CONSTANTS.WORD_LENGTH; i++) {
      if (cleanWord[i] === this.secret[i]) {
        result[i] = CONSTANTS.COLORS.CORRECT;
        secretCount[cleanWord[i]]--;
      }
    }

    // Second pass: mark partial matches
    for (let i = 0; i < CONSTANTS.WORD_LENGTH; i++) {
      if (
        result[i] === CONSTANTS.COLORS.MISS &&
        secretCount[cleanWord[i]] > 0
      ) {
        result[i] = CONSTANTS.COLORS.PARTIAL;
        secretCount[cleanWord[i]]--;
      }
    }

    return result;
  }

  getLetterClasses(word) {
    const colors = this.colorWord(word);
    return colors.map((color) => {
      switch (color) {
        case CONSTANTS.COLORS.CORRECT:
          return "correct";
        case CONSTANTS.COLORS.PARTIAL:
          return "partial";
        case CONSTANTS.COLORS.MISS:
          return "incorrect";
        default:
          return "incorrect";
      }
    });
  }
}

export default Wordle;
