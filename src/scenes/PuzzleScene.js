export class PuzzleScene extends Phaser.Scene {
  constructor() {
      super('PuzzleScene');
    this.config = {
      width: 1000,
      height: 800,
      centerX: 800,
      centerY: 600,
      colors: {
        primary: 0x3498db,
        primaryDark: 0x2980b9,
        secondary: 0x27ae60,
        secondaryDark: 0x219653,
        background: 0xecf0f1,
        success: 0x2ecc71,
        successDark: 0x27ae60,
        error: 0xe74c3c,
        errorDark: 0xc0392b,
        text: 0x2c3e50,
        lightText: 0xffffff
      }
    };
      this.parentScene = null;
      this.correctAnswer = null;
      this.toolName = 'Tool';
    this.toolImage = 'wrench';
    this.difficulty = 1;
  }

  init(data) {
      this.parentScene = data.parentScene;
      this.toolName = data.toolName || 'Tool';
    this.toolImage = data.toolImage || 'wrench';
    this.difficulty = data.level || 1;
  }

  create() {
    this.createBackground();
    this.createMultiplicationPuzzle();
      this.createButtons();
      this.createSidekick();
  }

  createBackground() {
    const { width, height, centerX, centerY, colors } = this.config;
    
    // Semi-transparent overlay
    this.overlay = this.add.rectangle(centerX, centerY, 1600, 1200, 0x000000, 0.5);
    
    // Dialog box
    this.dialogBox = this.createRoundedRectangle(
      centerX - width/2, 
      centerY - height/2, 
      width, 
      height, 
      colors.primary, 
      colors.primaryDark,
      20
    );
    
    // Header
    this.headerBox = this.createRoundedRectangle(
      centerX - width/2, 
      centerY - height/2, 
      width, 
      100, 
      colors.primaryDark, 
      null,
      { topLeft: 20, topRight: 20, bottomLeft: 0, bottomRight: 0 }
    );
      
      // Title text
    this.titleText = this.add.text(centerX, centerY - height/2 + 50, `Solve to get the ${this.toolName}`, {
          font: '40px Arial',
          fill: '#ffffff',
          fontStyle: 'bold'
      }).setOrigin(0.5);
      
    // Tool circle background
    this.toolCircle = this.add.circle(centerX, centerY - height/2 + 170, 60, 0xffffff);
    
    // Tool image
    this.toolImage = this.add.image(centerX, centerY - height/2 + 170, this.toolImage)
      .setScale(0.5)
          .setOrigin(0.5);
      
    // Decorative elements
    this.add.rectangle(centerX - 250, centerY - height/2 + 50, 6, 70, colors.error);
    this.add.rectangle(centerX + 250, centerY - height/2 + 50, 6, 70, colors.error);
  }

  createRoundedRectangle(x, y, width, height, fillColor, strokeColor, radius) {
    const graphics = this.add.graphics();
    
    // Fill
    if (fillColor !== null) {
      graphics.fillStyle(fillColor, 1);
      
      if (typeof radius === 'object') {
        graphics.fillRoundedRect(x, y, width, height, radius);
      } else {
        graphics.fillRoundedRect(x, y, width, height, radius);
      }
    }
    
    // Stroke
    if (strokeColor !== null) {
      graphics.lineStyle(4, strokeColor);
      
      if (typeof radius === 'object') {
        graphics.strokeRoundedRect(x, y, width, height, radius);
      } else {
        graphics.strokeRoundedRect(x, y, width, height, radius);
      }
    }
    
    return graphics;
  }

  createMultiplicationPuzzle() {
    const { centerX, centerY, colors } = this.config;
    
    // Question background with secondary color
    this.questionBox = this.createRoundedRectangle(
      centerX - 300,
      centerY - 60,
      600,
      120,
      colors.secondary,
      colors.secondaryDark,
      15
    );
    
    // Generate multiplication problem
    const num1 = Phaser.Math.Between(1, 10 * this.difficulty);
    const num2 = Phaser.Math.Between(1, 10 * this.difficulty);
    const product = num1 * num2;
    this.correctAnswer = product.toString();
    const questionStr = `${num1} × ${num2} = ?`;
    this.questionText = this.add.text(
      centerX,
      centerY,
      questionStr,
      { font: '60px Arial', fill: colors.lightText, fontStyle: 'bold' }
    )
      .setOrigin(0.5)
      .setShadow(2, 2, '#000', 2);
    
    // Generate plausible wrong options
    const wrongOptions = [
      (product + Phaser.Math.Between(1, 5)).toString(),
      (product - Phaser.Math.Between(1, 5) > 0
        ? product - Phaser.Math.Between(1, 5)
        : product + Phaser.Math.Between(6, 10)
      ).toString(),
      ((num1 + Phaser.Math.Between(1, 3)) * num2).toString()
    ];
    
    // Create answer options
    this.createAnswerOptions([this.correctAnswer, ...wrongOptions]);
  }

  createAnswerOptions(answers) {
    const { centerX, centerY, colors } = this.config;
    
      // Shuffle the answers
      Phaser.Utils.Array.Shuffle(answers);
      
    // Button positioning
      const positions = [
      { x: centerX - 150, y: centerY + 150 },
      { x: centerX + 150, y: centerY + 150 },
      { x: centerX - 150, y: centerY + 250 },
      { x: centerX + 150, y: centerY + 250 }
      ];
      
      // Create buttons for each answer
    this.answerButtons = [];
    
      answers.forEach((answer, index) => {
      // Create button container
      const button = this.add.container(positions[index].x, positions[index].y);
      this.answerButtons.push(button);
      
      // Create button background
      const bg = this.createRoundedRectangle(
        -110, 
        -40, 
        220, 
        80, 
        colors.primary, 
        colors.primaryDark,
        15
      );
      button.add(bg);
          
          // Add text
          const text = this.add.text(
        0,
        0,
              answer.toString(),
              {
                  font: '32px Arial',
          fill: colors.lightText,
                  fontWeight: 'bold'
              }
          ).setOrigin(0.5);
      button.add(text);
      
      // Make interactive
      button.setSize(220, 80);
      button.setInteractive(new Phaser.Geom.Rectangle(-110, -40, 220, 80), Phaser.Geom.Rectangle.Contains);
          
          // Button hover effect
          button.on('pointerover', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100
        });
          });
          
          button.on('pointerout', () => {
        this.tweens.add({
          targets: button,
          scaleX: 1,
          scaleY: 1,
          duration: 100
        });
          });
          
          // Check answer when clicked
          button.on('pointerdown', () => {
              this.checkAnswer(answer);
          });
      });
  }

  createButtons() {
    const { centerX, colors } = this.config;
    
    // Create hint button
    this.hintButton = this.add.container(centerX, 950);
    
    // Button background
    const hintBg = this.createRoundedRectangle(
      -100, 
      -30, 
      200, 
      60, 
      colors.secondary, 
      colors.secondaryDark,
      15
    );
    this.hintButton.add(hintBg);
    
    // Button text
    const hintText = this.add.text(
      0,
      0,
      'Get Hint',
      {
          font: '28px Arial',
        fill: colors.lightText,
          fontWeight: 'bold'
      }
    ).setOrigin(0.5);
    this.hintButton.add(hintText);
    
    // Make interactive
    this.hintButton.setSize(200, 60);
    this.hintButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);
      
      // Button effects
    this.hintButton.on('pointerover', () => {
      this.tweens.add({
        targets: this.hintButton,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100
      });
    });
    
    this.hintButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.hintButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100
      });
    });
    
    this.hintButton.on('pointerdown', () => {
          this.showHint();
      });
  }

  createSidekick() {
    const { centerX, centerY } = this.config;
    
      // Add sidekick character
    this.sidekick = this.add.image(centerX - 350, centerY + 250, 'sidekick')
          .setScale(0.35)
          .setOrigin(0.5);
      
    // Add thought bubble
    this.bubbleGraphics = this.createRoundedRectangle(
      centerX - 260, 
      centerY + 130, 
      180, 
      100, 
      0xffffff, 
      0xbdc3c7,
      15
    ).setAlpha(0);
    
    this.bubbleText = this.add.text(centerX - 170, centerY + 180, '', {
          font: '20px Arial',
          fill: '#34495e',
          align: 'center',
          wordWrap: { width: 160 }
      }).setOrigin(0.5).setAlpha(0);
      
    // Add animation
      this.tweens.add({
          targets: this.sidekick,
      y: '+=15',
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }

  showHint() {
          if (this.hintText) {
      // Show hint text with animation
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
      } else {
      // Show hint in sidekick bubble
          this.bubbleGraphics.setAlpha(1);
      this.bubbleText.setText("Add the fractions carefully!").setAlpha(1);
          
          // Hide after a few seconds
          this.time.delayedCall(4000, () => {
              this.bubbleGraphics.setAlpha(0);
              this.bubbleText.setAlpha(0);
          });
      }
      
    // Visual feedback for hint button
    this.cameras.main.flash(300, 255, 255, 255, 0.3);
  }

  checkAnswer(answer) {
      if (answer.toString() === this.correctAnswer.toString()) {
          this.handleCorrectAnswer();
      } else {
          this.handleWrongAnswer();
      }
  }

  handleCorrectAnswer() {
    const { centerX, centerY, colors } = this.config;
    
    // Disable buttons to prevent multiple answers
    this.answerButtons.forEach(button => button.removeInteractive());
    this.hintButton.removeInteractive();
    
    // Create success popup
    const successBox = this.createRoundedRectangle(
      centerX - 250, 
      centerY - 150, 
      500, 
      300, 
      colors.success, 
      colors.successDark,
      20
    );
    
    // Success message
    const successText = this.add.text(centerX, centerY - 80, 'Correct!', {
          font: '64px Arial',
      fill: colors.lightText,
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
    // Tool earned message
    const toolEarnedText = this.add.text(centerX, centerY, `You earned the ${this.toolName}!`, {
          font: '32px Arial',
      fill: colors.lightText,
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
    // Tool image
    const earnedTool = this.add.image(centerX, centerY + 70, this.toolImage)
          .setScale(0.8)
          .setOrigin(0.5);
      
    // Celebrate animation
      this.tweens.add({
          targets: earnedTool,
          scale: 1.2,
          angle: 360,
          duration: 1000,
          ease: 'Back.easeOut'
      });
      
    // Add particle effect
    if (this.scene.systems.game.device.features.webgl) {
      const particles = this.add.particles(centerX, centerY, 'particle', {
          speed: { min: 100, max: 300 },
          scale: { start: 0.4, end: 0 },
          lifespan: 1500,
          blendMode: 'ADD',
          emitting: false
      });
      
      particles.createEmitter().explode(100, centerX, centerY);
    }
      
    // Camera effect
      this.cameras.main.shake(500, 0.01);
      
    // Update game state
      window.gameState.score += 50;
      
    // Close after delay
      this.time.delayedCall(2500, () => {
          this.closePuzzle(true);
      });
  }

  handleWrongAnswer() {
    const { centerX, centerY, colors } = this.config;
    
    // Create error popup
    const errorBox = this.createRoundedRectangle(
      centerX - 200, 
      centerY - 100, 
      400, 
      200, 
      colors.error, 
      colors.errorDark,
      20
    );
    
    // Error message
    const errorText = this.add.text(centerX, centerY - 20, 'Try Again!', {
          font: '48px Arial',
      fill: colors.lightText,
          fontWeight: 'bold'
      }).setOrigin(0.5);
      
    // Hint text
    const hintText = this.add.text(centerX, centerY + 30, 'Check your calculations...', {
          font: '24px Arial',
      fill: colors.lightText
      }).setOrigin(0.5);
      
    // Shake animation
      this.tweens.add({
      targets: [errorBox, errorText, hintText],
          x: '+=10',
          duration: 50,
          yoyo: true,
          repeat: 5
      });
      
    // Red flash
    this.cameras.main.flash(300, 255, 0, 0, 0.3);
    
    // Remove after delay
      this.time.delayedCall(2000, () => {
      errorBox.destroy();
      errorText.destroy();
      hintText.destroy();
    });
  }

  closePuzzle(success) {
      // Fade out animation
      this.tweens.add({
      targets: [
        this.overlay, 
        this.dialogBox, 
        this.headerBox, 
        this.toolCircle, 
        this.titleText,
        this.toolImage
      ],
          alpha: 0,
          duration: 500,
          onComplete: () => {
              if (success) {
          this.handleReward();
        }
        
        // Close scene
        this.scene.stop();
        this.scene.resume(this.parentScene);
        
        // Emit event
        const parentScene = this.scene.get(this.parentScene);
        if (parentScene) {
          parentScene.events.emit('puzzleComplete', success);
        }
      }
    });
  }

  handleReward() {
    // Handle special case for smoke bomb
                  if (this.toolName === 'Smoke Bomb') {
                      const player = this.scene.get(this.parentScene).player;
                      
                      if (player.pendingCollectible) {
                          player.pendingCollectible.collect();
                          player.pendingCollectible = null;
                          
                          player.smokeBombs += 1;
                          
                          this.scene.get(this.parentScene).uiManager.updateSmokeBombUI(player.smokeBombs);
                          this.scene.get(this.parentScene).uiManager.showMessage("Great job! Smoke bomb collected!");
                      }
                  } else {
      // Handle standard tools
                      const parentScene = this.scene.get(this.parentScene);
                      
      // Initialize collectedTools array if not exists
                      if (!window.gameState.collectedTools) {
                          window.gameState.collectedTools = [];
                      }
                      
                      // Add tool if not already collected
                      if (!window.gameState.collectedTools.includes(this.toolImage)) {
                          window.gameState.collectedTools.push(this.toolImage);
                      }
                      
      // Update UI
                      if (parentScene.uiManager && parentScene.uiManager.updateToolsUI) {
                          parentScene.uiManager.updateToolsUI();
                      }
                      
      // Show message
                      if (parentScene.uiManager) {
                          parentScene.uiManager.showMessage(`Great job! ${this.toolName} collected!`);
                      }
                      
      // Add bonus points
                      window.gameState.score += 50;
                      if (parentScene.uiManager) {
                          parentScene.uiManager.updateScore();
                      }
                  }
  }

  calculateGCD(a, b) {
      return b === 0 ? a : this.calculateGCD(b, a % b);
  }
}