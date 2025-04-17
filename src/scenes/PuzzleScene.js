export class PuzzleScene extends Phaser.Scene {
  constructor() {
    super('PuzzleScene');
    
    // Get dimensions from config
    // const { width, height } = config;
    
    this.config = {
      width: 800,
      height: 600,
      centerX: 800,
      centerY: 450,
      colors: {
        primary: 0x3498db,
        secondary: 0x27ae60,
        background: 0xecf0f1,
        text: 0x2c3e50,
        success: 0x2ecc71,
        error: 0xe74c3c,
      },
      padding: 20,
      buttonWidth: 150,
      buttonHeight: 50,
    };
    
    this.parentScene = null;
    this.toolName = 'Tool';
    this.toolImage = 'wrench';
    this.correctAnswer = null;
    this.ui = {};
    this.isSmokeBomb = false;
    this.currentProblemIndex = 0;
    this.totalProblems = 2;
    this.problems = [];
  }

  init(data) {
    console.log("Initializing PuzzleScene with data:", data);
    this.parentScene = data.parentScene;
    this.toolName = data.toolName || 'Tool';
    this.toolImage = data.toolImage || 'wrench';
    this.isSmokeBomb = this.toolImage === 'smoke-bomb';
    
    // Reset internal state for fresh instance
    this.currentProblemIndex = 0;
    this.problems = [];
    this.correctAnswer = null;
    this.ui = this.ui || {};
    
    // Safety check for required resources
    try {
      if (!this.textures.exists(this.toolImage)) {
        console.warn(`Warning: Image '${this.toolImage}' does not exist in texture cache. Using fallback.`);
        this.toolImage = 'wrench'; // Fallback to a standard tool
      }
    } catch (error) {
      console.error("Error checking texture:", error);
      this.toolImage = 'wrench'; // Fallback on error
    }
  }

  create() {
    this.createBackground();
    this.createPuzzleContent();
    this.createCloseButton();
  }

  createBackground() {
    const { width, height, centerX, centerY, colors } = this.config;
    
    // Semi-transparent background overlay
    this.ui.overlay = this.add.rectangle(centerX, centerY, width * 2, height * 2, 0x000000, 0.5);
    
    // Main dialog box with proper centering
    this.ui.dialogBox = this.add.rectangle(centerX, centerY, width, height, colors.background)
      .setStrokeStyle(4, colors.primary);
  }

  createPuzzleContent() {
    this.createTitleAndIcon();
    this.generateProblems();
    this.displayCurrentProblem();
  }

  createTitleAndIcon() {
    const { centerX, centerY, colors, height } = this.config;
    // Tool image positioned centrally below title
    this.ui.toolIcon = this.add.image(centerX, centerY - height/4, this.toolImage)
      .setScale(0.5)
      .setOrigin(0.5);
  }

  generateProblems() {
    console.log("Generating problems...");
    // Generate two different problems
    this.problems = [];
    
    try {
      // First problem: multiplication
      const num1 = Phaser.Math.Between(1, 10);
      const num2 = Phaser.Math.Between(1, 10);
      const product = num1 * num2;
      
      console.log(`Created multiplication problem: ${num1} × ${num2} = ${product}`);
      
      this.problems.push({
        type: 'multiplication',
        questionStr: `${num1} × ${num2} = ?`,
        correctAnswer: product.toString(),
        wrongOptions: this.generateWrongOptions(product, num1, num2)
      });
      
      // Second problem: addition
      const num3 = Phaser.Math.Between(10, 30);
      const num4 = Phaser.Math.Between(10, 30);
      const sum = num3 + num4;
      
      console.log(`Created addition problem: ${num3} + ${num4} = ${sum}`);
      
      this.problems.push({
        type: 'addition',
        questionStr: `${num3} + ${num4} = ?`,
        correctAnswer: sum.toString(),
        wrongOptions: [
          (sum + Phaser.Math.Between(1, 5)).toString(),
          (sum - Phaser.Math.Between(1, 5)).toString(),
          (sum + 10).toString()
        ]
      });
      
      console.log(`Generated ${this.problems.length} problems successfully`);
    } catch (error) {
      console.error("Error in generateProblems:", error);
      
      // Fallback to hardcoded problems
      this.problems = [
        {
          type: 'multiplication',
          questionStr: "5 × 5 = ?",
          correctAnswer: "25",
          wrongOptions: ["20", "30", "10"]
        },
        {
          type: 'addition',
          questionStr: "15 + 10 = ?",
          correctAnswer: "25",
          wrongOptions: ["20", "30", "35"]
        }
      ];
      console.log("Used fallback problems");
    }
  }

  displayCurrentProblem() {
    const { centerX, centerY } = this.config;
    
    // Clear any existing problem elements
    if (this.ui.questionText) this.ui.questionText.destroy();
    if (this.ui.answerButtons) {
      this.ui.answerButtons.forEach(button => {
        button.background.destroy();
        button.text.destroy();
      });
    }
    
    // Get current problem
    let problem = this.problems[this.currentProblemIndex];
    
    // Check if problem exists before proceeding
    if (!problem) {
      console.error(`Problem not found at index ${this.currentProblemIndex}`);
      // Regenerate problems if needed
      this.generateProblems();
      // Try again with the first problem
      this.currentProblemIndex = 0;
      problem = this.problems[0];
      if (!problem) {
        console.error("Could not generate problems");
        return; // Exit function if still no problems
      }
    }
    
    this.correctAnswer = problem.correctAnswer;
    
    // Display problem counter
    if (this.ui.problemCounter) this.ui.problemCounter.destroy();
    this.ui.problemCounter = this.add.text(
      centerX - 300,
      centerY - 250,
      `Problem ${this.currentProblemIndex + 1} of ${this.totalProblems}`,
      { font: '24px Arial', fill: '#000000' }
    ).setOrigin(0.5);
    
    // Display question
    this.ui.questionText = this.add.text(
      centerX,
      centerY,
      problem.questionStr,
      { font: '48px Arial', fill: '#000000', fontWeight: 'bold' }
    ).setOrigin(0.5);
    
    // Create answer options
    const answers = [problem.correctAnswer, ...problem.wrongOptions];
    this.createAnswerOptions(answers);
  }

  generateWrongOptions(product, num1, num2) {
    return [
      (product + Phaser.Math.Between(1, 5)).toString(),
      (product - Phaser.Math.Between(1, 5) > 0 ? product - Phaser.Math.Between(1, 5) : product + 6).toString(),
      (num1 + num2).toString() // Common mistake
    ];
  }

  createAnswerOptions(answers) {
    const { centerX, centerY, colors, buttonWidth, buttonHeight } = this.config;
    
    // Shuffle the answers
    Phaser.Utils.Array.Shuffle(answers);
    
    // Improved grid layout for better central alignment
    const gridSpacing = 20;
    const totalGridWidth = (buttonWidth * 2) + gridSpacing;
    const startX = centerX - totalGridWidth/2 + buttonWidth/2;
    const buttonStartY = centerY + 100;
    
    const positions = [
      { x: startX, y: buttonStartY },
      { x: startX + buttonWidth + gridSpacing, y: buttonStartY },
      { x: startX, y: buttonStartY + buttonHeight + gridSpacing },
      { x: startX + buttonWidth + gridSpacing, y: buttonStartY + buttonHeight + gridSpacing }
    ];
    
    this.ui.answerButtons = [];
    
    answers.forEach((answer, index) => {
      const button = this.createButton(
        positions[index].x,
        positions[index].y,
        buttonWidth,
        buttonHeight,
        answer,
        colors.primary,
        () => this.checkAnswer(answer)
      );
      
      this.ui.answerButtons.push(button);
    });
  }

  createButton(x, y, width, height, text, color, callback) {
    // Create button background
    const buttonBg = this.add.rectangle(x, y, width, height, color)
      .setInteractive();
    
    // Add text to button
    const buttonText = this.add.text(x, y, text, { 
      font: '24px Arial', 
      fill: '#ffffff' 
    }).setOrigin(0.5);
    
    // Button interactions
    buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x2980b9));
    buttonBg.on('pointerout', () => buttonBg.setFillStyle(color));
    buttonBg.on('pointerdown', callback);
    
    return {
      background: buttonBg,
      text: buttonText,
      answer: text
    };
  }

  createCloseButton() {
    const { centerX, centerY, width, height, colors } = this.config;
    
    // Create close button at top right of dialog
    const closeButton = this.createButton(
      centerX + width/2 - 30,
      centerY - height/2 + 30,
      40,
      40,
      'X',
      colors.error,
      () => this.closePuzzle(false)
    );
    
    this.ui.closeButton = closeButton;
  }

  checkAnswer(answer) {
    if (answer === this.correctAnswer) {
      this.handleCorrectAnswer();
    } else {
      this.handleWrongAnswer();
    }
  }

  handleCorrectAnswer() {
    const { centerX, centerY } = this.config;
    
    // Play correct sound effect
    this.sound.play('correct');
    
    // Disable buttons to prevent multiple answers
    this.ui.answerButtons.forEach(button => button.background.disableInteractive());
    
    // Success message
    if (this.ui.successText) this.ui.successText.destroy();
    this.ui.successText = this.add.text(centerX, centerY + 170, 'Correct!', {
      font: '48px Arial',
      fill: '#2ecc71',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // Move to next problem or complete puzzle
    this.currentProblemIndex++;
    
    if (this.currentProblemIndex < this.totalProblems) {
      // Continue to next problem after delay
      this.time.delayedCall(1000, () => {
        if (this.ui.successText) this.ui.successText.destroy();
        this.displayCurrentProblem();
      });
    } else {
      // All problems completed - reward message
      if (this.ui.rewardText) this.ui.rewardText.destroy();
      this.ui.rewardText = this.add.text(centerX, centerY + 220, `You earned the ${this.toolName}!`, {
        font: '24px Arial',
        fill: '#000000'
      }).setOrigin(0.5);
      
      // Close after delay
      this.time.delayedCall(2000, () => {
        this.closePuzzle(true);
      });
    }
  }

  handleWrongAnswer() {
    const { centerX, centerY, colors } = this.config;
    
    // Play incorrect sound effect
    this.sound.play('incorrect');
    
    // Create error message
    const errorText = this.add.text(centerX, centerY + 170, 'Try Again', {
      font: '28px Arial',
      fill: '#e74c3c',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    
    // Remove after delay
    this.time.delayedCall(1500, () => {
      errorText.destroy();
    });
  }

  closePuzzle(success) {
    // Gather all UI elements to fade out
    const allElements = [
      this.ui.overlay,
      this.ui.dialogBox,
      this.ui.toolIcon,
      this.ui.questionText,
      this.ui.closeButton.background,
      this.ui.closeButton.text,
      ...this.ui.answerButtons.flatMap(b => [b.background, b.text])
    ];
    
    // Add conditional elements only if they exist
    if (this.ui.titleText) allElements.push(this.ui.titleText);
    if (this.ui.successText) allElements.push(this.ui.successText);
    if (this.ui.rewardText) allElements.push(this.ui.rewardText);
    
    // Fade out
    this.tweens.add({
      targets: allElements,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        if (success) {
          this.handleReward();
        }
        
        this.scene.stop();
        this.scene.resume(this.parentScene);
        
        // Emit completion event
        const parentScene = this.scene.get(this.parentScene);
        if (parentScene) {
          parentScene.events.emit('puzzleComplete', success);
        }
      }
    });
  }

  handleReward() {
    this.updateGameState();
    this.updateParentScene();
  }

  updateGameState() {
    // Initialize collections if needed
    if (!window.gameState.collectedTools) {
      window.gameState.collectedTools = [];
    }
    
    if (!window.gameState.collectedSmokeBombs) {
      window.gameState.collectedSmokeBombs = [];
    }
    
    // Add item to the appropriate collection
    if (this.isSmokeBomb) {
      // For smoke bombs, just add to the smoke bomb collection
      // We don't need to check if it's already included since these are consumable
      window.gameState.collectedSmokeBombs.push(this.toolImage);
    } else {
      // For regular tools, only add if not already collected
      if (!window.gameState.collectedTools.includes(this.toolImage)) {
        window.gameState.collectedTools.push(this.toolImage);
      }
    }
    
    // Update score
    if (window.gameState) {
      window.gameState.score += 50;
    }
  }

  updateParentScene() {
    const parentScene = this.scene.get(this.parentScene);
    
    // Update UI if available
    if (parentScene.uiManager) {
      if (parentScene.uiManager.updateToolsUI) {
        parentScene.uiManager.updateToolsUI();
      }
      
      if (parentScene.uiManager.updateScore) {
        parentScene.uiManager.updateScore();
      }
    }
  }
}