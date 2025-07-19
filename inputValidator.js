import CONSTANTS from "./constants.js";
import WORD_LIST from "./wordList.js";
import SPANISH_WORD_LIST from "./wordLists/spanishWords.js";

class InputValidator {
  static isValidLetter(char) {
    return /^[A-Za-z]$/.test(char);
  }

  static isValidWord(word) {
    return word.length === CONSTANTS.WORD_LENGTH && /^[A-Za-z]+$/.test(word);
  }

  static isWordInList(word, language = "en") {
    const wordList = language === "es" ? SPANISH_WORD_LIST : WORD_LIST;
    return wordList.includes(word.toLowerCase());
  }

  // API-based word validation using Free Dictionary API
  static async validateWordWithAPI(word, language = "en") {
    try {
      const langCode = language === "es" ? "es" : "en";

      const baseApiUrl =
        language === "es"
          ? `https://rae-api.com/api/words/`
          : `https://api.dictionaryapi.dev/api/v2/entries/es/`;

      const response = await fetch(`${baseApiUrl}${word.toLowerCase()}`);

      if (response.ok) {
        const data = await response.json();
        // Check if the word exists and is a valid word in the specified language
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
      return this.isWordInList(word, language);
    }
  }

  // Combined validation method that tries API first, then falls back to local list
  static async isValidWordInLanguage(word, language = "en") {
    // First check if it's a valid format
    if (!this.isValidWord(word)) {
      return false;
    }

    // Try API validation first
    const apiResult = await this.validateWordWithAPI(word, language);
    if (apiResult) {
      return true;
    }

    // Fallback to local word list
    return this.isWordInList(word, language);
  }
}

export default InputValidator;
