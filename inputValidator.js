import CONSTANTS from "./constants.js";
import WORD_LIST from "./wordList.js";

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

  // API-based word validation using Free Dictionary API
  static async validateWordWithAPI(word) {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`
      );

      if (response.ok) {
        const data = await response.json();
        // Check if the word exists and is a valid English word
        return (
          data.length > 0 &&
          data[0].word &&
          data[0].meanings &&
          data[0].meanings.length > 0
        );
      }

      return false;
    } catch (error) {
      console.warn("API validation failed, falling back to local list:", error);
      // Fallback to local word list if API fails
      return this.isWordInList(word);
    }
  }

  // Combined validation method that tries API first, then falls back to local list
  static async isValidEnglishWord(word) {
    // First check if it's a valid format
    if (!this.isValidWord(word)) {
      return false;
    }

    // Try API validation first
    const apiResult = await this.validateWordWithAPI(word);
    if (apiResult) {
      return true;
    }

    // Fallback to local word list
    return this.isWordInList(word);
  }
}

export default InputValidator;
