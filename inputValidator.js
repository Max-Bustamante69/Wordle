import CONSTANTS from './constants.js';

class InputValidator {
  static isValidLetter(char) {
    return /^[A-Za-z]$/.test(char);
  }

  static isValidWord(word) {
    return word.length === CONSTANTS.WORD_LENGTH && /^[A-Za-z]+$/.test(word);
  }

  static isWordInList(word) {
    return WORD_LIST.includes(word.toLowerCase());
  }
}

export default InputValidator;