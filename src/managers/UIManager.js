export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.healthBarWidth = 300;
        this.healthBarHeight = 30;
        this.toolIcons = [];
        // Store game dimensions for positioning
        this.gameWidth = this.scene.sys.game.config.width;
        this.gameHeight = this.scene.sys.game.config.height;
    }

    createUI() {
        this._createHealthBar();
        this._createScoreText();
        this._createToolsUI();
        this._createSmokeBombUI();
    }

    _createHealthBar() {
        // Position health bar at the top center
        const healthBarX = this.gameWidth / 2 - this.healthBarWidth / 2;
        const healthBarY = 30;
        
        this.healthBarBackground = this.scene.add.rectangle(
            healthBarX, 
            healthBarY, 
            this.healthBarWidth, 
            this.healthBarHeight, 
            0x000000
        ).setOrigin(0, 0.5).setScrollFactor(0);
        
        this.healthBarFill = this.scene.add.rectangle(
            healthBarX, 
            healthBarY, 
            this.healthBarWidth, 
            this.healthBarHeight, 
            0x00ff00
        ).setOrigin(0, 0.5).setScrollFactor(0);
        
        this.healthText = this.scene.add.text(
            this.gameWidth / 2, 
            healthBarY, 
            '100/100', 
            {
                font: '18px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5, 0.5).setScrollFactor(0);
    }

    _createScoreText() {
        // Position score text at the top center, below the health bar
        this.scoreText = this.scene.add.text(
            this.gameWidth / 2, 
            70, 
            'Score: 0', 
            {
                font: '24px Arial',
                fill: '#ffffff'
            }
        ).setOrigin(0.5, 0).setScrollFactor(0);
    }

    _createToolsUI() {
        // Position tools UI at the bottom right
        const bottomMargin = 20; // Distance from bottom of screen
        const toolsStartX = -50; // Position on right side

        // Tool collection status
        // this.toolsText = this.scene.add.text(
        //     toolsStartX, 
        //     this.gameHeight - bottomMargin, 
        //     'Tools: 0/3', 
        //     {
        //         font: '24px Arial',
        //         fill: '#ffffff'
        //     }
        // ).setScrollFactor(0);
        
        // Create tool icons (fixed positions, initially dimmed)
        const toolTypes = ['wrench', 'hammer', 'screwdriver'];
        const startX = toolsStartX;
        const startY = this.gameHeight - bottomMargin + 40;
        const spacing = 55;
        
        toolTypes.forEach((type, index) => {
            // Background circle
            const bg = this.scene.add.circle(
                startX + index * spacing, 
                startY, 
                22, 
                0x333333
            ).setScrollFactor(0).setAlpha(0.7);
            
            // Tool icon
            const icon = this.scene.add.image(
                startX + index * spacing, 
                startY, 
                type
            ).setScrollFactor(0)
             .setScale(0.25)
             .setTint(0x777777); // Dimmed initially
            
            this.toolIcons.push({ type, icon, bg });
        });
    }

    _createSmokeBombUI() {
        // Position smoke bomb UI at bottom left
        const bottomMargin = 0; // Same margin as tools for consistency
        const smokeBombX = 100; // Further from edge
        
        // Add smoke bomb UI
        this.smokeBombsText = this.scene.add.text(
            smokeBombX, 
            this.gameHeight - bottomMargin + 50, 
            'Smoke Bombs: 3', 
            {
                font: '24px Arial',
                fill: '#ffffff'
            }
        ).setScrollFactor(0);
        
        // Create smoke bomb icon
        this.smokeBombIcon = this.scene.add.image(
            smokeBombX, 
            this.gameHeight - bottomMargin - 20, 
            'smoke-bomb'
        ).setScrollFactor(0)
         .setScale(0.25)
         .setOrigin(0, 0.5);
        
        // Instructions for using smoke bombs
        this.scene.add.text(
            smokeBombX + 53, 
            this.gameHeight - bottomMargin - 40, 
            'Press SPACE', 
            {
                font: '18px Arial',
                fill: '#cccccc'
            }
        ).setScrollFactor(0).setOrigin(0, 0.5);
    }

    updateHealthBar() {
        const percentage = window.gameState.health / 100;
        
        // Update health bar width
        this.healthBarFill.width = this.healthBarWidth * percentage;
        
        // Update color based on health
        if (percentage > 0.6) {
            this.healthBarFill.fillColor = 0x00ff00; // Green
        } else if (percentage > 0.3) {
            this.healthBarFill.fillColor = 0xffff00; // Yellow
        } else {
            this.healthBarFill.fillColor = 0xff0000; // Red
        }
        
        // Update text
        this.healthText.setText(`${window.gameState.health}/100`);
    }

    updateScore() {
        this.scoreText.setText('Score: ' + window.gameState.score);
    }

    updateToolsUI() {
        // Update the text display
        // this.toolsText.setText(`Tools: ${window.gameState.collectedTools.length}/3`);
        
        // Update the tool icons
        this.toolIcons.forEach(toolIcon => {
            if (window.gameState.collectedTools.includes(toolIcon.type)) {
                // Tool collected - highlight it
                toolIcon.icon.clearTint();
                toolIcon.bg.setFillStyle(0x00aa00);
                
                // Add a little animation
                this.scene.tweens.add({
                    targets: toolIcon.icon,
                    scale: 0.35,
                    duration: 200,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    updateSmokeBombUI(bombCount) {
        if (this.smokeBombsText) {
            this.smokeBombsText.setText(`Smoke Bombs: ${bombCount}`);
        }
    }

    showMessage(text) {
        // Center message display
        const message = this.scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2, 
            text, 
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 8 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(100);
        
        // Remove after a delay
        this.scene.time.delayedCall(3000, () => {
            message.destroy();
        });
    }

    showInstructions() {
        // Show initial instructions
        const instructions = [
            "Welcome to the Maze Challenge!",
            "Use arrow keys to move",
            "Collect coins for points",
            "Find all 3 tools to open the exit",
            "Avoid the red enemies - they will damage you!",
            "Watch your health bar at the top"
        ];
        
        const instructionBox = this.scene.add.rectangle(
            this.gameWidth / 2, 
            this.gameHeight / 2, 
            700, 
            400, 
            0x000000, 
            0.8
        ).setScrollFactor(0).setDepth(100);
            
        const instructionText = this.scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2, 
            instructions.join('\n\n'), 
            {
                font: '22px Arial',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(101);
        
        // Add continue button
        const continueButton = this.scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2 + 170, 
            'START GAME', 
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#006699',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setInteractive().setDepth(101);
        
        continueButton.on('pointerdown', () => {
            instructionBox.destroy();
            instructionText.destroy();
            continueButton.destroy();
        });
    }

    updateSmokeBombCount(count) {
        if (this.smokeBombsText) {
            this.smokeBombsText.setText(`Smoke Bombs: ${count}`);
        }
    }
} 