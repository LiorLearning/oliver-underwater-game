class PuzzleScene extends Phaser.Scene {
  constructor() {
      super('PuzzleScene');
      this.puzzleId = null;
      this.level = null;
      this.parentScene = null;
      this.correctAnswer = null;
  }

  init(data) {
      this.puzzleId = data.puzzleId;
      this.level = data.level;
      this.parentScene = data.parentScene;
  }

  create() {
      // Create overlay background
      this.createBackground();
      
      // Create puzzle based on ID
      this.createPuzzle();
      
      // Create UI buttons
      this.createButtons();
      
      // Add sidekick with helpful hints
      this.createSidekick();
  }

  createBackground() {
      // Semi-transparent overlay
      this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
      
      // Title
      this.add.text(400, 50, 'Math Challenge', {
          font: '32px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Puzzle ID display
      this.add.text(400, 90, `Puzzle ${this.puzzleId} - Level ${this.level}`, {
          font: '20px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
  }

  createPuzzle() {
      // Generate different puzzles based on ID
      switch(this.puzzleId) {
          case 1:
              this.createMultiplicationPuzzle();
              break;
          case 2:
              this.createFractionPuzzle();
              break;
          case 3:
              this.createPatternPuzzle();
              break;
          default:
              this.createMultiplicationPuzzle();
      }
  }

  createMultiplicationPuzzle() {
      // Create a simple multiplication puzzle
      const num1 = Phaser.Math.Between(2, 10);
      const num2 = Phaser.Math.Between(2, 10);
      this.correctAnswer = num1 * num2;
      
      // Display problem
      this.add.text(400, 150, `${num1} × ${num2} = ?`, {
          font: '36px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Create input options
      this.createAnswerOptions([
          this.correctAnswer,
          this.correctAnswer + Phaser.Math.Between(1, 5),
          this.correctAnswer - Phaser.Math.Between(1, 5),
          this.correctAnswer + Phaser.Math.Between(6, 10)
      ]);
  }

  createFractionPuzzle() {
      // Create a simple fraction addition puzzle
      const denominator = Phaser.Math.Between(2, 10);
      const numerator1 = Phaser.Math.Between(1, denominator - 1);
      const numerator2 = Phaser.Math.Between(1, denominator - 1);
      
      // Calculate answer (simplified form)
      let sumNumerator = numerator1 + numerator2;
      let sumDenominator = denominator;
      
      // Simplify fraction
      const gcd = this.calculateGCD(sumNumerator, sumDenominator);
      sumNumerator = sumNumerator / gcd;
      sumDenominator = sumDenominator / gcd;
      
      this.correctAnswer = `${sumNumerator}/${sumDenominator}`;
      
      // Handle improper fractions
      if (sumNumerator >= sumDenominator) {
          const wholeNumber = Math.floor(sumNumerator / sumDenominator);
          const remainder = sumNumerator % sumDenominator;
          
          if (remainder === 0) {
              this.correctAnswer = `${wholeNumber}`;
          } else {
              this.correctAnswer = `${wholeNumber} ${remainder}/${sumDenominator}`;
          }
      }
      
      // Display problem
      this.add.text(400, 150, `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`, {
          font: '36px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Generate wrong answers that look plausible
      const wrongAnswers = [
          `${numerator1 + numerator2}/${denominator * 2}`,
          `${numerator1 * numerator2}/${denominator}`,
          `${numerator1 + numerator2 + 1}/${denominator}`
      ];
      
      // Create input options
      this.createAnswerOptions([
          this.correctAnswer,
          ...wrongAnswers
      ]);
  }

  createPatternPuzzle() {
      // Create a pattern recognition puzzle
      const patterns = [
          {
              sequence: [2, 4, 6, 8],
              next: 10,
              rule: "Add 2"
          },
          {
              sequence: [1, 3, 9, 27],
              next: 81,
              rule: "Multiply by 3"
          },
          {
              sequence: [1, 4, 9, 16],
              next: 25,
              rule: "Square numbers"
          }
      ];
      
      // Pick a random pattern
      const pattern = Phaser.Utils.Array.GetRandom(patterns);
      this.correctAnswer = pattern.next;
      
      // Display problem
      this.add.text(400, 150, "What number comes next in this pattern?", {
          font: '24px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      this.add.text(400, 200, pattern.sequence.join(", ") + ", ?", {
          font: '36px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add hint text
      this.add.text(400, 250, "Hint: " + pattern.rule, {
          font: '18px Arial',
          fill: '#aaaaaa'
      }).setOrigin(0.5);
      
      // Generate wrong answers
      const wrongAnswers = [
          pattern.next + 1,
          pattern.next - 1,
          pattern.sequence[pattern.sequence.length - 1] + 1
      ];
      
      // Create input options
      this.createAnswerOptions([
          this.correctAnswer,
          ...wrongAnswers
      ]);
  }

  createAnswerOptions(answers) {
      // Shuffle the answers
      Phaser.Utils.Array.Shuffle(answers);
      
      // Position for options
      const positions = [
          { x: 250, y: 300 },
          { x: 550, y: 300 },
          { x: 250, y: 400 },
          { x: 550, y: 400 }
      ];
      
      // Create buttons for each option
      answers.forEach((answer, index) => {
          const pos = positions[index];
          
          const button = this.add.rectangle(pos.x, pos.y, 200, 80, 0x006699, 1)
              .setInteractive();
          
          const text = this.add.text(pos.x, pos.y, answer.toString(), {
              font: '24px Arial',
              fill: '#ffffff'
          }).setOrigin(0.5);
          
          // Button hover effect
          button.on('pointerover', () => {
              button.setFillStyle(0x0088cc);
          });
          
          button.on('pointerout', () => {
              button.setFillStyle(0x006699);
          });
          
          // Check answer when clicked
          button.on('pointerdown', () => {
              this.checkAnswer(answer);
          });
      });
  }

  createButtons() {
      // Create a close button to exit the puzzle
      const closeButton = this.add.text(700, 50, 'X', {
          font: '32px Arial',
          fill: '#ffffff',
          backgroundColor: '#880000',
          padding: { x: 15, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      closeButton.on('pointerdown', () => {
          this.closePuzzle(false);
      });
  }

  createSidekick() {
      // Add sidekick character with a hint
      const sidekick = this.add.image(100, 500, 'sidekick').setScale(0.2);
      
      // Add speech bubble
      const speechBubble = this.add.rectangle(220, 500, 240, 80, 0xffffff, 1);
      
      // Add hint text
      const hints = [
          "Think carefully!",
          "You can do it!",
          "Remember the patterns we learned!"
      ];
      
      this.add.text(220, 500, Phaser.Utils.Array.GetRandom(hints), {
          font: '16px Arial',
          fill: '#000000',
          align: 'center'
      }).setOrigin(0.5);
      
      // Add simple animation to sidekick
      this.tweens.add({
          targets: sidekick,
          y: 480,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }

  checkAnswer(answer) {
      if (answer.toString() === this.correctAnswer.toString()) {
          this.handleCorrectAnswer();
      } else {
          this.handleWrongAnswer();
      }
  }

  handleCorrectAnswer() {
      // Show success message
      const success = this.add.text(400, 200, 'Correct!', {
          font: '48px Arial',
          fill: '#00ff00'
      }).setOrigin(0.5);
      
      // Update game state
      window.gameState.mathPuzzlesSolved++;
      window.gameState.score += 200;
      
      // Add a ship upgrade
      window.gameState.shipUpgrades.push(`Upgrade from Puzzle ${this.puzzleId}`);
      
      // Wait a moment and close
      this.time.delayedCall(2000, () => {
          this.closePuzzle(true);
      });
  }

  handleWrongAnswer() {
      // Show error message
      const error = this.add.text(400, 200, 'Try Again!', {
          font: '48px Arial',
          fill: '#ff0000'
      }).setOrigin(0.5);
      
      // Remove after a short delay
      this.time.delayedCall(1500, () => {
          error.destroy();
      });
  }

  closePuzzle(success) {
      // Resume the parent scene
      this.scene.resume(this.parentScene);
      
      // If puzzle was successful, show a message in the parent scene
      if (success) {
          this.parentScene.showMessage("Puzzle solved! Ship upgrade acquired!");
      }
      
      // Close this scene
      this.scene.stop();
  }

  calculateGCD(a, b) {
      // Calculate greatest common divisor using Euclidean algorithm
      return b === 0 ? a : this.calculateGCD(b, a % b);
  }
}