export class PuzzleScene extends Phaser.Scene {
  constructor() {
      super('PuzzleScene');
      this.puzzleId = null;
      this.level = null;
      this.parentScene = null;
      this.correctAnswer = null;
      this.toolName = 'Tool';
      this.toolImage = 'wrench'; // Default to wrench if no image specified
  }

  init(data) {
      this.puzzleId = data.puzzleId;
      this.level = data.level;
      this.parentScene = data.parentScene;
      this.toolName = data.toolName || 'Tool';
      this.toolImage = data.toolImage || 'wrench'; // Default to wrench if no image specified
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
      this.add.rectangle(800, 600, 1600, 1200, 0x000000, 0.8);
      
      // Title
      this.add.text(800, 100, `Solve to get the ${this.toolName}`, {
          font: '64px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Display tool image
      this.add.image(800, 280, this.toolImage)
          .setScale(0.8)
          .setOrigin(0.5);
      
      // Puzzle ID display
      this.add.text(800, 180, `Puzzle ${this.puzzleId} - Level ${this.level}`, {
          font: '40px Arial',
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
      this.add.text(800, 380, `${num1} × ${num2} = ?`, {
          font: '72px Arial',
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
      this.add.text(800, 380, `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`, {
          font: '72px Arial',
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
      this.add.text(800, 380, "What number comes next in this pattern?", {
          font: '48px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      this.add.text(800, 440, pattern.sequence.join(", ") + ", ?", {
          font: '72px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add hint text
      this.add.text(800, 540, "Hint: " + pattern.rule, {
          font: '36px Arial',
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
      
      // Create button positions
      const positions = [
          { x: 500, y: 700 },
          { x: 1100, y: 700 },
          { x: 500, y: 850 },
          { x: 1100, y: 850 }
      ];
      
      // Create buttons for each answer
      answers.forEach((answer, index) => {
          // Create button
          const button = this.add.rectangle(
              positions[index].x,
              positions[index].y,
              300,
              100,
              0x0066aa
          ).setInteractive();
          
          // Add text
          const text = this.add.text(
              positions[index].x,
              positions[index].y,
              answer.toString(),
              {
                  font: '36px Arial',
                  fill: '#ffffff'
              }
          ).setOrigin(0.5);
          
          // Button hover effect
          button.on('pointerover', () => {
              button.setFillStyle(0x0088cc);
          });
          
          button.on('pointerout', () => {
              button.setFillStyle(0x0066aa);
          });
          
          // Check answer when clicked
          button.on('pointerdown', () => {
              this.checkAnswer(answer);
          });
      });
  }

  createButtons() {
      // Add hint button
      const hintButton = this.add.text(800, 1050, 'Get Hint', {
          font: '36px Arial',
          fill: '#ffffff',
          backgroundColor: '#006633',
          padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      // Add close button
      const closeButton = this.add.text(1450, 100, 'X', {
          font: '48px Arial',
          fill: '#ffffff',
          backgroundColor: '#880000',
          padding: { x: 15, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      closeButton.on('pointerdown', () => {
          this.closePuzzle(false);
      });
  }

  createSidekick() {
      // Add sidekick character
      this.sidekick = this.add.image(200, 900, 'sidekick')
          .setScale(0.4)
          .setOrigin(0.5);
      
      // Add thought bubble
      this.bubble = this.add.rectangle(300, 800, 380, 150, 0xffffff, 1)
          .setOrigin(0.5)
          .setAlpha(0);
          
      this.bubbleText = this.add.text(300, 800, '', {
          font: '28px Arial',
          fill: '#000000',
          align: 'center',
          wordWrap: { width: 340 }
      }).setOrigin(0.5).setAlpha(0);
      
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
          targets: this.sidekick,
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
      const success = this.add.text(800, 400, 'Correct!', {
          font: '96px Arial',
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
      const error = this.add.text(800, 400, 'Try Again!', {
          font: '96px Arial',
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