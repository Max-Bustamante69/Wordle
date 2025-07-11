import Wordle from "./wordle.js";
import CONSTANTS from "./constants.js";
import WORD_LIST from "./wordList.js";
import GameState from "./gameState.js";
import InputValidator from "./inputValidator.js";

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
};

// GAME STATE

// GAME INITIALIZATION
const gameState = new GameState();
const game = new Wordle(randomWord());

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
    UIManager.showFeedback("Only letters are allowed!", "error");
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
    UIManager.showFeedback("Please enter a complete 5-letter word!", "error");
    UIManager.animateRow(gameState.currentRow, "shake");
    return;
  }

  // Check if word is a valid English word using API + local fallback
  const isValidEnglishWord = await InputValidator.isValidEnglishWord(word);
  if (!isValidEnglishWord) {
    UIManager.showFeedback("Not a valid English word!", "error");
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
        console.log(game.secretSet);

        if (!game.secretSet.has(char) && !gameState.missedChars.has(char)) {
          gameState.miss(char);
          const key = document.querySelector(`[data-value="${char}"]`);
          key.classList.add("incorrect");
        }

        input.style.backgroundColor = color;
        input.classList.add(letterClasses[i]);
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
    UIManager.showFeedback("An error occurred. Please try again.", "error");
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
  UIManager.showModal("🎉 Congratulations!", "You guessed the word correctly!");
}

function handleLoss() {
  UIManager.showModal("😞 Game Over", "Better luck next time!");
}

function restartGame() {
  gameState.reset();
  const newWord = randomWord();
  game.secret = newWord;

  UIManager.closeModal();
  UIManager.resetBoard();
  UIManager.resetKeyboard();
  UIManager.showFeedback("New game started!", "success");
}

// EVENT LISTENERS
function addEventListeners() {
  elements.charInputs.forEach((input) => {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeydown);
  });

  elements.restartBtn.addEventListener("click", restartGame);
  elements.closeModalBtn.addEventListener("click", UIManager.closeModal);
}

// UTILITY FUNCTIONS
function randomWord() {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

// INITIALIZATION
function init() {
  try {
    addEventListeners();
    UIManager.createKeyboard();
    UIManager.resetBoard();
    UIManager.showFeedback(
      "Welcome to my custom Wordle! Start typing your first 5-letter word guess.",
      "info"
    );
  } catch (error) {
    console.error("Failed to initialize game:", error);
    UIManager.showFeedback(
      "Failed to start game. Please refresh the page.",
      "error"
    );
  }
}

// Start the game
init();
