import InputValidator from "./inputValidator.js";

async function testValidation() {
  console.log("Testing word validation...");

  // Test valid words
  const validWords = ["hello", "world", "about", "above"];
  for (const word of validWords) {
    const result = await InputValidator.isValidEnglishWord(word);
    console.log(`${word}: ${result ? "VALID" : "INVALID"}`);
  }

  // Test invalid words
  const invalidWords = ["abcde", "xyz", "notaword"];
  for (const word of invalidWords) {
    const result = await InputValidator.isValidEnglishWord(word);
    console.log(`${word}: ${result ? "VALID" : "INVALID"}`);
  }
}

testValidation().catch(console.error);
