import Wordle from "./wordle.js";

const charInputs = document.querySelectorAll("input.char");
const tryLines = document.querySelectorAll("li.try");
let tries = 0;
const TRY_LIMIT = 5;
const game = new Wordle("avion");

function handleInput(e) {
  const input = e.target;

  const nextInput =
    input.value &&
    e.inputType != "deleteContentBackward" &&
    input.nextElementSibling;

  if (nextInput) nextInput.focus();
}

function handleKeydown(e) {
  const input = e.target;
  const { key } = e;
  if (key === "Backspace" && !input.value) {
    const nextInput = input.previousElementSibling;
    if (nextInput) nextInput.focus();
  } else if (key === "Enter") {
    handleTry();
  }
}

function addEventListeners() {
  charInputs.forEach((input) => {
    input.addEventListener("input", handleInput);
    input.addEventListener("keydown", handleKeydown);
  });
}

addEventListeners();

function handleTry() {

  const inputs = Array.from(tryLines[tries].children);
  

  const word = inputs
    .reduce((str, input) => {
      console.log(input.value);
      str += input.value || "";
      return str;
    }, "")
    .trim();

  if (word.length !== 5) {
    


    return
  } 

  const result = game.testWord(word)

  if (result === 'win'){
    return
  }else {
    for(let i = 0; i < 5; i++){
        inputs[i].style.backgroundColor = result[i];
    }
  }


  tries++;


}

function toggleInputs(inputs) {
  for (const input of inputs) {
    input.disabled = !input.disabled;
  }
}
