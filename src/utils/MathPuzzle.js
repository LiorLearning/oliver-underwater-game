// Math puzzle generator utility
class MathPuzzle {
  constructor(difficulty = 1) {
      this.difficulty = difficulty; // 1-3, affects complexity
      this.puzzleTypes = ['addition', 'subtraction', 'multiplication', 'division', 'fraction', 'pattern'];
  }
  
  // Generate a random puzzle
  generatePuzzle(type = null) {
      // If no type specified, choose random
      if (!type) {
          type = Phaser.Utils.Array.GetRandom(this.puzzleTypes);
      }
      
      // Generate puzzle based on type
      switch (type) {
          case 'addition':
              return this.generateAdditionPuzzle();
          case 'subtraction':
              return this.generateSubtractionPuzzle();
          case 'multiplication':
              return this.generateMultiplicationPuzzle();
          case 'division':
              return this.generateDivisionPuzzle();
          case 'fraction':
              return this.generateFractionPuzzle();
          case 'pattern':
              return this.generatePatternPuzzle();
          default:
              return this.generateAdditionPuzzle();
      }
  }
  
  // Generate addition puzzle
  generateAdditionPuzzle() {
      // Generate numbers based on difficulty
      const num1 = this.generateNumber(this.difficulty);
      const num2 = this.generateNumber(this.difficulty);
      const answer = num1 + num2;
      
      return {
          question: `${num1} + ${num2} = ?`,
          answer: answer,
          type: 'addition',
          options: this.generateOptions(answer)
      };
  }
  
  // Generate subtraction puzzle
  generateSubtractionPuzzle() {
      // Ensure first number is larger (for easier problems)
      let num1 = this.generateNumber(this.difficulty);
      let num2 = this.generateNumber(this.difficulty);
      
      if (num1 < num2) {
          [num1, num2] = [num2, num1]; // Swap
      }
      
      const answer = num1 - num2;
      
      return {
          question: `${num1} - ${num2} = ?`,
          answer: answer,
          type: 'subtraction',
          options: this.generateOptions(answer)
      };
  }
  
  // Generate multiplication puzzle
  generateMultiplicationPuzzle() {
      const max = this.difficulty === 1 ? 10 : (this.difficulty === 2 ? 12 : 15);
      const num1 = Phaser.Math.Between(2, max);
      const num2 = Phaser.Math.Between(2, max);
      const answer = num1 * num2;
      
      return {
          question: `${num1} × ${num2} = ?`,
          answer: answer,
          type: 'multiplication',
          options: this.generateOptions(answer)
      };
  }
  
  // Generate division puzzle
  generateDivisionPuzzle() {
      // Generate divisor first
      const divisor = Phaser.Math.Between(2, 10);
      
      // Generate dividend to ensure whole number result
      const result = Phaser.Math.Between(1, 10);
      const dividend = divisor * result;
      
      return {
          question: `${dividend} ÷ ${divisor} = ?`,
          answer: result,
          type: 'division',
          options: this.generateOptions(result)
      };
  }
  
  // Generate fraction puzzle
  generateFractionPuzzle() {
      // Generate a fraction addition or subtraction
      const operation = Phaser.Math.Between(0, 1) === 0 ? '+' : '-';
      
      // Generate common denominator
      const denominator = Phaser.Math.Between(2, 10);
      
      // Generate numerators
      const num1 = Phaser.Math.Between(1, denominator - 1);
      const num2 = operation === '+' 
          ? Phaser.Math.Between(1, denominator - 1) 
          : Phaser.Math.Between(1, num1); // For subtraction, ensure positive result
      
      // Calculate result
      let resultNumerator;
      if (operation === '+') {
          resultNumerator = num1 + num2;
      } else {
          resultNumerator = num1 - num2;
      }
      
      // Simplify fraction
      const gcd = this.calculateGCD(resultNumerator, denominator);
      const simplifiedNumerator = resultNumerator / gcd;
      const simplifiedDenominator = denominator / gcd;
      
      // Format answer
      let answer;
      if (simplifiedNumerator >= simplifiedDenominator) {
          const wholeNumber = Math.floor(simplifiedNumerator / simplifiedDenominator);
          const remainder = simplifiedNumerator % simplifiedDenominator;
          
          if (remainder === 0) {
              answer = `${wholeNumber}`;
          } else {
              answer = `${wholeNumber} ${remainder}/${simplifiedDenominator}`;
          }
      } else {
          answer = `${simplifiedNumerator}/${simplifiedDenominator}`;
      }
      
      return {
          question: `${num1}/${denominator} ${operation} ${num2}/${denominator} = ?`,
          answer: answer,
          type: 'fraction',
          options: this.generateFractionOptions(simplifiedNumerator, simplifiedDenominator)
      };
  }
  
  // Generate pattern puzzle
  generatePatternPuzzle() {
      // Define pattern types based on difficulty
      const patternTypes = [
          { // Add same number
              generate: () => {
                  const increment = Phaser.Math.Between(2, 5 * this.difficulty);
                  const start = Phaser.Math.Between(1, 10);
                  const sequence = [start];
                  
                  for (let i = 1; i < 4; i++) {
                      sequence.push(start + increment * i);
                  }
                  
                  const answer = start + increment * 4;
                  
                  return {
                      sequence,
                      answer,
                      rule: `Add ${increment}`
                  };
              }
          },
          { // Multiply by same number
              generate: () => {
                  const multiplier = Phaser.Math.Between(2, 3);
                  const start = Phaser.Math.Between(1, 5);
                  const sequence = [start];
                  
                  for (let i = 1; i < 4; i++) {
                      sequence.push(start * Math.pow(multiplier, i));
                  }
                  
                  const answer = start * Math.pow(multiplier, 4);
                  
                  return {
                      sequence,
                      answer,
                      rule: `Multiply by ${multiplier}`
                  };
              }
          },
          { // Square numbers
              generate: () => {
                  const sequence = [1, 4, 9, 16];
                  const answer = 25;
                  
                  return {
                      sequence,
                      answer,
                      rule: "Square numbers"
                  };
              }
          }
      ];
      
      // Choose a pattern type
      const patternType = Phaser.Utils.Array.GetRandom(patternTypes);
      const pattern = patternType.generate();
      
      return {
          question: "What number comes next in this pattern?\n" + pattern.sequence.join(", ") + ", ?",
          answer: pattern.answer,
          hint: pattern.rule,
          type: 'pattern',
          options: this.generateOptions(pattern.answer)
      };
  }
  
  // Generate a random number based on difficulty
  generateNumber(difficulty) {
      switch (difficulty) {
          case 1:
              return Phaser.Math.Between(1, 20);
          case 2:
              return Phaser.Math.Between(10, 50);
          case 3:
              return Phaser.Math.Between(20, 100);
          default:
              return Phaser.Math.Between(1, 20);
      }
  }
  
  // Generate multiple choice options
  generateOptions(answer) {
      const options = [answer];
      
      // Generate 3 wrong answers
      while (options.length < 4) {
          let wrongAnswer;
          
          if (answer < 10) {
              // For small answers, stay within a reasonable range
              wrongAnswer = Phaser.Math.Between(1, 20);
          } else {
              // For larger answers, vary within a percentage
              const variation = Math.max(1, Math.floor(answer * 0.3));
              wrongAnswer = answer + Phaser.Math.Between(-variation, variation);
              
              // Ensure positive
              if (wrongAnswer <= 0) wrongAnswer = Phaser.Math.Between(1, answer - 1);
          }
          
          // Ensure no duplicates
          if (!options.includes(wrongAnswer)) {
              options.push(wrongAnswer);
          }
      }
      
      // Shuffle options
      return Phaser.Utils.Array.Shuffle(options);
  }
  
  // Generate fraction multiple choice options
  generateFractionOptions(numerator, denominator) {
      const options = [`${numerator}/${denominator}`];
      
      // If simplified form is a whole number
      if (numerator % denominator === 0) {
          options[0] = `${numerator / denominator}`;
      }
      
      // If simplified form is a mixed number
      if (numerator > denominator && numerator % denominator !== 0) {
          const wholeNumber = Math.floor(numerator / denominator);
          const remainder = numerator % denominator;
          options[0] = `${wholeNumber} ${remainder}/${denominator}`;
      }
      
      // Generate wrong answers
      while (options.length < 4) {
          const wrongType = Phaser.Math.Between(1, 3);
          
          let wrongAnswer;
          switch (wrongType) {
              case 1: // Wrong numerator
                  wrongAnswer = `${numerator + Phaser.Math.Between(1, 3)}/${denominator}`;
                  break;
              case 2: // Wrong denominator
                  wrongAnswer = `${numerator}/${denominator + Phaser.Math.Between(1, 3)}`;
                  break;
              case 3: // Wrong both
                  wrongAnswer = `${numerator + Phaser.Math.Between(1, 2)}/${denominator + Phaser.Math.Between(1, 2)}`;
                  break;
          }
          
          // Ensure no duplicates
          if (!options.includes(wrongAnswer)) {
              options.push(wrongAnswer);
          }
      }
      
      // Shuffle options
      return Phaser.Utils.Array.Shuffle(options);
  }
  
  // Calculate Greatest Common Divisor using Euclidean algorithm
  calculateGCD(a, b) {
      return b === 0 ? a : this.calculateGCD(b, a % b);
  }
  
  // Check if an answer is correct
  checkAnswer(puzzle, userAnswer) {
      return puzzle.answer.toString() === userAnswer.toString();
  }
}