import Wordle from "./wordle.js";
import CONSTANTS from "./constants.js";
import WORD_LIST from "./wordList.js";
import SPANISH_WORD_LIST from "./wordLists/spanishWords.js";
import GameState from "./gameState.js";
import InputValidator from "./inputValidator.js";
import TRANSLATIONS from "./locales/translations.js";

// GAME STATE
let currentLanguage = "en";
let currentWordList = WORD_LIST;

//DOM ELEMENTS
const elements = {
  charInputs: document.querySelectorAll("input.char"),
  tryLines: document.querySelectorAll("li.try"),
  gameModal: document.getElementById("gameModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMessage: document.getElementById("modalMessage"),
  secretWordSpan: document.getElementById("secretWord"),
  triesUsedSpan: document.getElementById("triesUsed"),
  restartBtn: document.getElementById("restartBtn"),
  closeModalBtn: document.getElementById("closeModalBtn"),
  feedbackMessage: document.getElementById("feedbackMessage"),
  keyboard: document.querySelector("div.keyboard"),
  languageToggle: document.getElementById("languageToggle"),
  restartButton: document.getElementById("restartButton"),
  gameTitle: document.getElementById("gameTitle"),
  gameSubtitle: document.getElementById("gameSubtitle"),
  gameInstructions: document.getElementById("gameInstructions"),
};

// GAME STATE

// GAME INITIALIZATION
const gameState = new GameState();
let game = new Wordle(randomWord());

// LANGUAGE MANAGEMENT
function updateLanguage(lang) {
  currentLanguage = lang;
  currentWordList = lang === "es" ? SPANISH_WORD_LIST : WORD_LIST;

  // Update UI text
  elements.gameTitle.textContent = TRANSLATIONS[lang].title;
  elements.gameSubtitle.textContent = TRANSLATIONS[lang].subtitle;
  elements.gameInstructions.textContent = TRANSLATIONS[lang].instructions;
  elements.languageToggle.textContent = TRANSLATIONS[lang].languageToggle;
  elements.restartButton.textContent = TRANSLATIONS[lang].restartButton;
  elements.restartBtn.textContent = TRANSLATIONS[lang].playAgain;
  elements.closeModalBtn.textContent = TRANSLATIONS[lang].close;

  // Update modal labels
  const secretWordLabel = document.querySelector(".stat-label:first-child");
  const triesUsedLabel = document.querySelector(".stat-label:last-child");
  if (secretWordLabel)
    secretWordLabel.textContent = TRANSLATIONS[lang].secretWord;
  if (triesUsedLabel) triesUsedLabel.textContent = TRANSLATIONS[lang].triesUsed;
}

function toggleLanguage() {
  const newLang = currentLanguage === "en" ? "es" : "en";
  updateLanguage(newLang);
  restartGame();
}

// UI MANAGEMENT
class UIManager {
  static createKeyboard() {
    const keyboard = elements.keyboard;
    for (const row of CONSTANTS.QWERTY_ORDER) {
      const rowDiv = document.createElement("div");
      rowDiv.classList.add("keyboardRow");
      for (const char of row) {
        const key = document.createElement("div");

        key.classList.add("key");
        key.innerText = char;
        key.setAttribute("data-value", char);

        rowDiv.appendChild(key);
      }
      keyboard.appendChild(rowDiv);
    }
  }

  static showFeedback(message, type = "info") {
    const feedbackEl = elements.feedbackMessage;
    feedbackEl.textContent = message;
    feedbackEl.className = `feedback-message show ${type}`;

    setTimeout(() => {
      feedbackEl.className = "feedback-message";
    }, CONSTANTS.FEEDBACK_DURATION);
  }

  static animateRow(rowIndex, animationType = "flip") {
    const inputs = Array.from(elements.tryLines[rowIndex].children);

    inputs.forEach((input, i) => {
      setTimeout(() => {
        input.classList.add(animationType);
        setTimeout(() => {
          input.classList.remove(animationType);
        }, 600);
      }, i * CONSTANTS.ANIMATION_DELAY);
    });
  }

  static resetBoard() {
    elements.tryLines.forEach((tryLine, index) => {
      const inputs = Array.from(tryLine.children);
      inputs.forEach((input) => {
        input.value = "";
        input.style.backgroundColor = "";
        input.className = "char";
        input.disabled = index !== 0;
      });
    });

    elements.charInputs[0].focus();
  }

  static toggleCurrentRow() {
    const currentInputs = Array.from(
      elements.tryLines[gameState.currentRow].children
    );
    currentInputs.forEach((input) => {
      input.disabled = !input.disabled;
    });
  }

  static showModal(title, message) {
    elements.modalTitle.textContent = title;
    elements.modalMessage.textContent = message;
    elements.secretWordSpan.textContent = game.secret.toUpperCase();
    elements.triesUsedSpan.textContent = `${gameState.tries + 1}/${
      CONSTANTS.TRY_LIMIT
    }`;
    elements.gameModal.showModal();
  }

  static closeModal() {
    elements.gameModal.close();
  }

  static resetKeyboard() {
    const keys = document.querySelectorAll(".key");
    keys.forEach((key) => {
      key.className = "key";
    });
  }
}

// INPUT VALIDATION

// EVENT HANDLERS
function handleInput(e) {
  if (gameState.isGameOver()) return;

  const input = e.target;
  let value = input.value.toUpperCase();

  // Only allow letters
  if (value && !InputValidator.isValidLetter(value)) {
    input.value = "";
    UIManager.showFeedback(TRANSLATIONS[currentLanguage].onlyLetters, "error");
    return;
  }

  input.value = value;

  // Move to next input if value entered (but not on backspace/delete)
  if (
    value &&
    e.inputType !== "deleteContentBackward" &&
    e.inputType !== "deleteContentForward"
  ) {
    const nextInput = input.nextElementSibling;
    if (nextInput && !nextInput.disabled) {
      nextInput.focus();
    }
  }
}

function handleKeydown(e) {
  if (gameState.isGameOver()) return;

  const input = e.target;
  const { key } = e;

  if (key === "Backspace" && !input.value) {
    const prevInput = input.previousElementSibling;
    if (prevInput && !prevInput.disabled) {
      prevInput.focus();
    }
  } else if (key === "Enter") {
    e.preventDefault();
    handleTry();
  }
  // Remove the automatic letter handling - let the input event handle it
}

async function handleTry() {
  if (gameState.isGameOver()) return;

  const inputs = Array.from(elements.tryLines[gameState.currentRow].children);
  const word = inputs
    .map((input) => input.value || "")
    .join("")
    .trim();

  if (!InputValidator.isValidWord(word)) {
    UIManager.showFeedback(
      TRANSLATIONS[currentLanguage].completeWordError,
      "error"
    );
    UIManager.animateRow(gameState.currentRow, "shake");
    return;
  }

  // Check if word is a valid word in the current language using API + local fallback
  const isValidWord = await InputValidator.isValidWordInLanguage(
    word,
    currentLanguage
  );
  if (!isValidWord) {
    const errorMessage =
      currentLanguage === "es"
        ? TRANSLATIONS[currentLanguage].notValidSpanishWord
        : TRANSLATIONS[currentLanguage].notValidWord;
    UIManager.showFeedback(errorMessage, "error");
    UIManager.animateRow(gameState.currentRow, "shake");
    return;
  }

  try {
    const letterClasses = game.getLetterClasses(word);
    const colors = game.colorWord(word);

    // Animate and color the inputs
    UIManager.animateRow(gameState.currentRow, "flip");

    setTimeout(() => {
      inputs.forEach((input, i) => {
        const color = colors[i];
        const char = input.value;
        const letterClass = letterClasses[i];

        // Update keyboard based on letter status
        const key = document.querySelector(`[data-value="${char}"]`);
        if (key) {
          if (letterClass === "correct") {
            key.classList.add("correct");
          } else if (letterClass === "partial") {
            // Only add partial if not already correct
            if (!key.classList.contains("correct")) {
              key.classList.add("partial");
            }
          } else if (letterClass === "incorrect") {
            // Only add incorrect if not already correct or partial
            if (
              !key.classList.contains("correct") &&
              !key.classList.contains("partial")
            ) {
              key.classList.add("incorrect");
            }
          }
        }

        input.style.backgroundColor = color;
        input.classList.add(letterClass);
      });
    }, CONSTANTS.ANIMATION_DELAY * 2);

    if (game.testWord(word)) {
      gameState.endGame();
      setTimeout(() => {
        UIManager.animateRow(gameState.currentRow, "bounce");
        handleWin();
      }, CONSTANTS.ANIMATION_DELAY * 3);
      return;
    }

    if (gameState.tries === CONSTANTS.TRY_LIMIT - 1) {
      gameState.endGame();
      setTimeout(() => {
        handleLoss();
      }, CONSTANTS.ANIMATION_DELAY * 3);
    } else {
      handleNextTurn();
    }
  } catch (error) {
    UIManager.showFeedback(
      TRANSLATIONS[currentLanguage].errorOccurred,
      "error"
    );
    console.error(error);
  }
}

function handleNextTurn() {
  UIManager.toggleCurrentRow(); // Disable current row
  gameState.nextTry();
  UIManager.toggleCurrentRow(); // Enable next row

  setTimeout(() => {
    const firstInput = elements.tryLines[gameState.currentRow].children[0];
    if (firstInput) {
      firstInput.focus();
    }
  }, CONSTANTS.ANIMATION_DELAY * 3);
}

function handleWin() {
  UIManager.showModal(
    TRANSLATIONS[currentLanguage].congratulations,
    TRANSLATIONS[currentLanguage].congratulationsMessage
  );
}

function handleLoss() {
  UIManager.showModal(
    TRANSLATIONS[currentLanguage].gameOver,
    TRANSLATIONS[currentLanguage].gameOverMessage
  );
}

function restartGame() {
  gameState.reset();
  const newWord = randomWord();
  game = new Wordle(newWord);

  UIManager.closeModal();
  UIManager.resetBoard();
  UIManager.resetKeyboard();
  UIManager.showFeedback(
    TRANSLATIONS[currentLanguage].newGameStarted,
    "success"
  );
}

// EVENT LISTENERS
function addEventListeners() {
  elements.charInputs.forEach((input) => {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeydown);
  });

  elements.restartBtn.addEventListener("click", restartGame);
  elements.closeModalBtn.addEventListener("click", UIManager.closeModal);
  elements.languageToggle.addEventListener("click", toggleLanguage);
  elements.restartButton.addEventListener("click", restartGame);
}

// UTILITY FUNCTIONS
function randomWord() {
  return currentWordList[Math.floor(Math.random() * currentWordList.length)];
}

// INITIALIZATION
function init() {
  try {
    addEventListeners();
    UIManager.createKeyboard();
    UIManager.resetBoard();
    UIManager.showFeedback(
      TRANSLATIONS[currentLanguage].welcomeMessage,
      "info"
    );
  } catch (error) {
    console.error("Failed to initialize game:", error);
    UIManager.showFeedback(
      TRANSLATIONS[currentLanguage].failedToStart,
      "error"
    );
  }
}

// Start the game
init();
