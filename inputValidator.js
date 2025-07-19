import CONSTANTS from "./constants.js";
import WORD_LIST from "./wordList.js";
import SPANISH_WORD_LIST from "./wordLists/spanishWords.js";
import { currentConfig } from "./config.js";

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

  // API-based word validation using proxy server to avoid CORS issues
  static async validateWordWithAPI(word, language = "en") {
    try {
      let baseApiUrl;

      let response;

      if (language === "es") {
        // Use our proxy server for Spanish words (RAE API)
        const isDevelopment =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1" ||
          window.location.hostname.includes("localhost");

        if (isDevelopment) {
          // Local development: append word to URL
          baseApiUrl = currentConfig.proxyUrl;
          response = await fetch(`${baseApiUrl}${word.toLowerCase()}`);
        } else {
          // Production: use query parameter
          baseApiUrl = currentConfig.proxyUrl;
          response = await fetch(`${baseApiUrl}${word.toLowerCase()}`);
        }
      } else {
        // Use direct API for English words (Free Dictionary API)
        baseApiUrl = currentConfig.englishApiUrl;
        response = await fetch(`${baseApiUrl}${word.toLowerCase()}`);
      }

      if (response.ok) {
        const data = await response.json();

        if (language === "es") {
          // For Spanish words via proxy, check if data exists
          return data && data.length > 0;
        } else {
          // For English words, check if the word exists and has meanings
          return (
            data.length > 0 &&
            data[0].word &&
            data[0].meanings &&
            data[0].meanings.length > 0
          );
        }
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
