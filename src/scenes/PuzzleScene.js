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
      // Create dialog box background
      this.createDialogBox();
      
      // Create puzzle based on ID
      this.createPuzzle();
      
      // Create UI buttons
      this.createButtons();
      
      // Add sidekick with helpful hints
      this.createSidekick();
  }

  createDialogBox() {
      const width = 1000;
      const height = 800;
      
      // Semi-transparent dark overlay for background
      this.overlay = this.add.rectangle(800, 600, 1600, 1200, 0x000000, 0.7);
      
      // Dialog box background with rounded corners using a Graphics object
      this.dialogBoxGraphics = this.add.graphics();
      this.dialogBoxGraphics.fillStyle(0x3498db, 1);
      this.dialogBoxGraphics.lineStyle(4, 0x2980b9);
      this.dialogBoxGraphics.fillRoundedRect(800 - width/2, 600 - height/2, width, height, 20);
      this.dialogBoxGraphics.strokeRoundedRect(800 - width/2, 600 - height/2, width, height, 20);
      
      // Create an invisible hitarea for interaction
      this.dialogBox = this.add.zone(800, 600, width, height).setInteractive();
      this.dialogBox.input.hitArea.setTo(-width/2, -height/2, width, height);
      
      // Dialog header with rounded corners
      this.headerGraphics = this.add.graphics();
      this.headerGraphics.fillStyle(0x2980b9, 1);
      this.headerGraphics.fillRoundedRect(800 - width/2, 400 - 50, width, 100, 20);
      
      // Title text
      this.titleText = this.add.text(800, 400, `Solve to get the ${this.toolName}`, {
          font: '40px Arial',
          fill: '#ffffff',
          fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // Puzzle ID text
      this.puzzleIdText = this.add.text(800, 450, `Puzzle ${this.puzzleId} - Level ${this.level}`, {
          font: '28px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Display tool image in a circular frame
      this.toolCircle = this.add.circle(800, 530, 80, 0xffffff);
      this.toolImage = this.add.image(800, 530, this.toolImage)
          .setScale(0.6)
          .setOrigin(0.5);
      
      // Add decorative elements
      this.add.rectangle(550, 400, 10, 100, 0xe74c3c);
      this.add.rectangle(1050, 400, 10, 100, 0xe74c3c);
  }

  createPuzzle() {
      // Check if MathPuzzle utility is available
      if (window.MathPuzzle) {
          // Create a new instance with the current level
          const mathPuzzle = new window.MathPuzzle(this.level);
          
          // Generate different puzzles based on ID
          switch(this.puzzleId) {
              case 1:
                  this.puzzleData = mathPuzzle.generatePuzzle('multiplication');
                  break;
              case 2:
                  this.puzzleData = mathPuzzle.generatePuzzle('fraction');
                  break;
              case 3:
                  this.puzzleData = mathPuzzle.generatePuzzle('pattern');
                  break;
              default:
                  // If no specific puzzle type, generate a random one
                  this.puzzleData = mathPuzzle.generatePuzzle();
          }
          
          // Get the correct answer from puzzle data
          this.correctAnswer = this.puzzleData.answer;
      } else {
          // Fallback to built-in puzzle creation methods if MathPuzzle isn't available
          console.warn('MathPuzzle utility not available, using built-in methods');
          switch(this.puzzleId) {
              case 1:
                  this.createMultiplicationPuzzle();
                  return;
              case 2:
                  this.createFractionPuzzle();
                  return;
              case 3:
                  this.createPatternPuzzle();
                  return;
              default:
                  this.createMultiplicationPuzzle();
                  return;
          }
      }
      
      // Add question background with rounded corners using graphics
      this.questionGraphics = this.add.graphics();
      this.questionGraphics.fillStyle(0xecf0f1, 0.9);
      this.questionGraphics.lineStyle(2, 0xbdc3c7);
      this.questionGraphics.fillRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      this.questionGraphics.strokeRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      
      // Display problem - handle multi-line questions
      const question = this.puzzleData.question;
      if (question.includes('\n')) {
          // Split multi-line questions
          const lines = question.split('\n');
          
          // First line
          this.add.text(800, 630, lines[0], {
              font: '38px Arial',
              fill: '#2c3e50',
              fontStyle: 'bold'
          }).setOrigin(0.5);
          
          // Second line (with potentially larger font for the sequence)
          this.add.text(800, 680, lines[1], {
              font: '46px Arial',
              fill: '#2c3e50',
              fontStyle: 'bold'
          }).setOrigin(0.5);
      } else {
          // Single line question
          this.add.text(800, 650, question, {
              font: '50px Arial',
              fill: '#2c3e50',
              fontStyle: 'bold'
          }).setOrigin(0.5);
      }
      
      // Add hint if provided in puzzle data
      if (this.puzzleData.hint) {
          this.hintText = this.add.text(800, 710, "Hint: " + this.puzzleData.hint, {
              font: '24px Arial',
              fill: '#7f8c8d'
          }).setOrigin(0.5).setAlpha(0); // Start hidden
      }
      
      // Create input options using the options from puzzle data
      this.createAnswerOptions(this.puzzleData.options);
  }

  createMultiplicationPuzzle() {
      // Create a simple multiplication puzzle
      const num1 = Phaser.Math.Between(2, 10);
      const num2 = Phaser.Math.Between(2, 10);
      this.correctAnswer = num1 * num2;
      
      // Add question background with rounded corners using graphics
      this.questionGraphics = this.add.graphics();
      this.questionGraphics.fillStyle(0xecf0f1, 0.9);
      this.questionGraphics.lineStyle(2, 0xbdc3c7);
      this.questionGraphics.fillRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      this.questionGraphics.strokeRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      
      // Display problem
      this.add.text(800, 650, `${num1} × ${num2} = ?`, {
          font: '60px Arial',
          fill: '#2c3e50',
          fontStyle: 'bold'
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
      
      // Add question background with rounded corners using graphics
      this.questionGraphics = this.add.graphics();
      this.questionGraphics.fillStyle(0xecf0f1, 0.9);
      this.questionGraphics.lineStyle(2, 0xbdc3c7);
      this.questionGraphics.fillRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      this.questionGraphics.strokeRoundedRect(800 - 300, 650 - 60, 600, 120, 15);
      
      // Display problem
      this.add.text(800, 650, `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?`, {
          font: '50px Arial',
          fill: '#2c3e50',
          fontStyle: 'bold'
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
      
      // Add question background with rounded corners using graphics
      this.questionGraphics = this.add.graphics();
      this.questionGraphics.fillStyle(0xecf0f1, 0.9);
      this.questionGraphics.lineStyle(2, 0xbdc3c7);
      this.questionGraphics.fillRoundedRect(800 - 350, 630 - 75, 700, 150, 15);
      this.questionGraphics.strokeRoundedRect(800 - 350, 630 - 75, 700, 150, 15);
      
      // Display problem
      this.add.text(800, 600, "What number comes next in this pattern?", {
          font: '36px Arial',
          fill: '#2c3e50',
          fontStyle: 'bold'
      }).setOrigin(0.5);
      
      this.add.text(800, 650, pattern.sequence.join(", ") + ", ?", {
          font: '48px Arial',
          fill: '#2c3e50',
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
      // Add hint text
      this.hintText = this.add.text(800, 710, "Hint: " + pattern.rule, {
          font: '24px Arial',
          fill: '#7f8c8d'
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
          { x: 650, y: 750 },
          { x: 950, y: 750 },
          { x: 650, y: 850 },
          { x: 950, y: 850 }
      ];
      
      // Create buttons for each answer
      answers.forEach((answer, index) => {
          // Create button graphics with rounded corners
          const buttonGraphics = this.add.graphics();
          buttonGraphics.fillStyle(0x3498db, 1);
          buttonGraphics.lineStyle(3, 0x2980b9);
          buttonGraphics.fillRoundedRect(positions[index].x - 120, positions[index].y - 40, 240, 80, 15);
          buttonGraphics.strokeRoundedRect(positions[index].x - 120, positions[index].y - 40, 240, 80, 15);
          
          // Create interactive zone for button
          const button = this.add.zone(positions[index].x, positions[index].y, 240, 80).setInteractive();
          
          // Add text
          const text = this.add.text(
              positions[index].x,
              positions[index].y,
              answer.toString(),
              {
                  font: '32px Arial',
                  fill: '#ffffff',
                  fontWeight: 'bold'
              }
          ).setOrigin(0.5);
          
          // Button hover effect
          button.on('pointerover', () => {
              buttonGraphics.clear();
              buttonGraphics.fillStyle(0x2980b9, 1);
              buttonGraphics.lineStyle(3, 0x2980b9);
              buttonGraphics.fillRoundedRect(positions[index].x - 126, positions[index].y - 42, 252, 84, 15);
              buttonGraphics.strokeRoundedRect(positions[index].x - 126, positions[index].y - 42, 252, 84, 15);
          });
          
          button.on('pointerout', () => {
              buttonGraphics.clear();
              buttonGraphics.fillStyle(0x3498db, 1);
              buttonGraphics.lineStyle(3, 0x2980b9);
              buttonGraphics.fillRoundedRect(positions[index].x - 120, positions[index].y - 40, 240, 80, 15);
              buttonGraphics.strokeRoundedRect(positions[index].x - 120, positions[index].y - 40, 240, 80, 15);
          });
          
          // Check answer when clicked
          button.on('pointerdown', () => {
              this.checkAnswer(answer);
          });
      });
  }

  createButtons() {
      // Add hint button with icon using graphics for rounded corners
      const hintButtonGraphics = this.add.graphics();
      hintButtonGraphics.fillStyle(0x27ae60, 1);
      hintButtonGraphics.lineStyle(3, 0x219653);
      hintButtonGraphics.fillRoundedRect(800 - 100, 950 - 30, 200, 60, 15);
      hintButtonGraphics.strokeRoundedRect(800 - 100, 950 - 30, 200, 60, 15);
      
      // Create interactive zone for hint button
      const hintButton = this.add.zone(800, 950, 200, 60).setInteractive();
      
      this.add.text(800, 950, 'Get Hint', {
          font: '28px Arial',
          fill: '#ffffff',
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
      // Button effects
      hintButton.on('pointerover', () => {
          hintButtonGraphics.clear();
          hintButtonGraphics.fillStyle(0x219653, 1);
          hintButtonGraphics.lineStyle(3, 0x219653);
          hintButtonGraphics.fillRoundedRect(800 - 105, 950 - 31.5, 210, 63, 15);
          hintButtonGraphics.strokeRoundedRect(800 - 105, 950 - 31.5, 210, 63, 15);
      });
      
      hintButton.on('pointerout', () => {
          hintButtonGraphics.clear();
          hintButtonGraphics.fillStyle(0x27ae60, 1);
          hintButtonGraphics.lineStyle(3, 0x219653);
          hintButtonGraphics.fillRoundedRect(800 - 100, 950 - 30, 200, 60, 15);
          hintButtonGraphics.strokeRoundedRect(800 - 100, 950 - 30, 200, 60, 15);
      });
      
      hintButton.on('pointerdown', () => {
          this.showHint();
      });
  }

  createSidekick() {
      // Add sidekick character
      this.sidekick = this.add.image(450, 850, 'sidekick')
          .setScale(0.35)
          .setOrigin(0.5);
      
      // Add thought bubble with rounded corners using graphics
      this.bubbleGraphics = this.add.graphics();
      this.bubbleGraphics.fillStyle(0xffffff, 1);
      this.bubbleGraphics.lineStyle(3, 0xbdc3c7);
      this.bubbleGraphics.fillRoundedRect(520 - 90, 780 - 50, 180, 100, 15);
      this.bubbleGraphics.strokeRoundedRect(520 - 90, 780 - 50, 180, 100, 15);
      this.bubbleGraphics.setAlpha(0);
          
      this.bubbleText = this.add.text(520, 780, '', {
          font: '20px Arial',
          fill: '#34495e',
          align: 'center',
          wordWrap: { width: 160 }
      }).setOrigin(0.5).setAlpha(0);
      
      // Add simple animation to sidekick
      this.tweens.add({
          targets: this.sidekick,
          y: '-=20',
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }

  showHint() {
      // Show hint based on puzzle data
      if (this.puzzleData && this.puzzleData.hint) {
          // If we have a hint from the puzzle data, show it
          if (this.hintText) {
              // Animate the hint text to appear
              this.tweens.add({
                  targets: this.hintText,
                  alpha: 1,
                  duration: 500,
                  ease: 'Power2'
              });
              
              // Hide after a few seconds
              this.time.delayedCall(4000, () => {
                  this.tweens.add({
                      targets: this.hintText,
                      alpha: 0,
                      duration: 500
                  });
              });
          }
      } else {
          // If no hint from puzzle data, show generic hint based on puzzle type
          let hintText = "";
          
          switch(this.puzzleId) {
              case 1:
                  hintText = "Multiply the numbers!";
                  break;
              case 2:
                  hintText = "Remember to keep the denominators the same!";
                  break;
              case 3:
                  hintText = "Look for a pattern in how the numbers change!";
                  break;
              default:
                  hintText = "Think carefully about the math problem!";
          }
          
          // Show hint in bubble
          this.bubbleGraphics.setAlpha(1);
          this.bubbleText.setText(hintText).setAlpha(1);
          
          // Hide after a few seconds
          this.time.delayedCall(4000, () => {
              this.bubbleGraphics.setAlpha(0);
              this.bubbleText.setAlpha(0);
          });
      }
      
      // Add a visual effect to the hint button
      const hintEffect = this.add.circle(800, 950, 30, 0xffffff, 0.5);
      this.tweens.add({
          targets: hintEffect,
          scale: 2,
          alpha: 0,
          duration: 800,
          onComplete: () => {
              hintEffect.destroy();
          }
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
      // Create success popup with rounded corners using graphics
      const successGraphics = this.add.graphics();
      successGraphics.fillStyle(0x2ecc71, 1);
      successGraphics.lineStyle(4, 0x27ae60);
      successGraphics.fillRoundedRect(800 - 250, 600 - 150, 500, 300, 20);
      successGraphics.strokeRoundedRect(800 - 250, 600 - 150, 500, 300, 20);
      
      // Show success message
      const success = this.add.text(800, 520, 'Correct!', {
          font: '64px Arial',
          fill: '#ffffff',
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
      // Show tool earned message
      const toolEarned = this.add.text(800, 600, `You earned the ${this.toolName}!`, {
          font: '32px Arial',
          fill: '#ffffff',
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
      // Add animated tool image
      const earnedTool = this.add.image(800, 670, this.toolImage)
          .setScale(0.8)
          .setOrigin(0.5);
      
      // Add animation to earned tool
      this.tweens.add({
          targets: earnedTool,
          scale: 1.2,
          angle: 360,
          duration: 1000,
          ease: 'Back.easeOut'
      });
      
      // Add stars animation
      for (let i = 0; i < 20; i++) {
          const star = this.add.star(
              800 + Phaser.Math.Between(-200, 200),
              600 + Phaser.Math.Between(-150, 150),
              5, 10, 25, 0xf1c40f
          );
          
          this.tweens.add({
              targets: star,
              angle: 360,
              scale: { from: 0.2, to: 1 },
              alpha: { from: 0, to: 1 },
              duration: 1500,
              ease: 'Cubic.easeOut',
              delay: i * 50
          });
      }
      
      // Add particles burst
      const particles = this.add.particles(800, 600, 'particle', {
          speed: { min: 100, max: 300 },
          scale: { start: 0.4, end: 0 },
          lifespan: 1500,
          blendMode: 'ADD',
          emitting: false
      });
      
      // Emit a burst of particles
      particles.createEmitter().explode(100, 800, 600);
      
      // Camera shake effect
      this.cameras.main.shake(500, 0.01);
      
      // Update game state - bonus points for solving puzzle
      window.gameState.score += 50;
      
      // Wait a moment and close
      this.time.delayedCall(2500, () => {
          this.closePuzzle(true);
      });
  }

  handleWrongAnswer() {
      // Create error popup with rounded corners using graphics
      const errorGraphics = this.add.graphics();
      errorGraphics.fillStyle(0xe74c3c, 0.9);
      errorGraphics.lineStyle(4, 0xc0392b);
      errorGraphics.fillRoundedRect(800 - 200, 600 - 100, 400, 200, 20);
      errorGraphics.strokeRoundedRect(800 - 200, 600 - 100, 400, 200, 20);
      
      // Show error message
      const error = this.add.text(800, 580, 'Try Again!', {
          font: '48px Arial',
          fill: '#ffffff',
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
      // Add a hint text
      const hint = this.add.text(800, 630, 'Check your calculations...', {
          font: '24px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add shake animation
      this.tweens.add({
          targets: [errorGraphics, error, hint],
          x: '+=10',
          duration: 50,
          yoyo: true,
          repeat: 5
      });
      
      // Add a red flash overlay
      const flash = this.add.rectangle(800, 600, 1600, 1200, 0xff0000, 0.3);
      flash.setAlpha(0);
      
      this.tweens.add({
          targets: flash,
          alpha: 0.3,
          duration: 100,
          yoyo: true,
          onComplete: () => {
              flash.destroy();
          }
      });
      
      // Remove after a short delay
      this.time.delayedCall(2000, () => {
          errorGraphics.destroy();
          error.destroy();
          hint.destroy();
      });
  }

  closePuzzle(success) {
      // Fade out animation
      this.tweens.add({
          targets: [this.overlay, this.dialogBoxGraphics, this.headerGraphics, this.toolCircle, this.toolImage],
          alpha: 0,
          duration: 500,
          onComplete: () => {
              // Close the puzzle scene
              this.scene.stop();
              
              // Emit event to parent scene with result
              const parentScene = this.scene.get(this.parentScene);
              if (parentScene) {
                  parentScene.events.emit('puzzleComplete', success);
              }
          }
      });
  }

  calculateGCD(a, b) {
      // Calculate greatest common divisor using Euclidean algorithm
      return b === 0 ? a : this.calculateGCD(b, a % b);
  }
}