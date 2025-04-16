export class ToolSelectScene extends Phaser.Scene {
    constructor() {
        super('ToolSelectScene');
        this.selectedTool = null;
    }

    create() {
        // Add background
        const { width, height } = this.sys.game.config;
        this.add.image(0, 0, 'bg')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);
        
        // Add title text
        this.add.text(800, 200, 'Select Your Weapon', {
            font: '64px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Show player coins
        this.add.text(800, 300, `Available Coins: ${window.gameState.score || 0}`, {
            font: '36px Arial',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Define available tools
        const tools = [
            { name: 'Laser Wrench', image: 'wrench', cost: 50, strength: 10, description: 'Basic attack with moderate damage' },
            { name: 'Plasma Hammer', image: 'hammer', cost: 100, strength: 20, description: 'Heavy attack with high damage' },
            { name: 'Quantum Screwdriver', image: 'screwdriver', cost: 150, strength: 30, description: 'Advanced tool with maximum damage' }
        ];

        // Create tool selection buttons
        let yPos = 450;
        tools.forEach(tool => {
            const buttonBg = this.add.rectangle(800, yPos, 600, 120, 0x333333, 0.8).setOrigin(0.5);
            
            // Tool image
            const toolImage = this.add.image(500, yPos, tool.image).setScale(0.3);
            
            // Tool info
            this.add.text(650, yPos - 30, tool.name, {
                font: '32px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            this.add.text(650, yPos, `Damage: ${tool.strength}`, {
                font: '24px Arial',
                fill: '#00ff00'
            }).setOrigin(0, 0.5);
            
            this.add.text(650, yPos + 30, `Cost: ${tool.cost} coins`, {
                font: '24px Arial',
                fill: '#ffff00'
            }).setOrigin(0, 0.5);
            
            // Make button interactive
            buttonBg.setInteractive();
            
            // Button hover effect
            buttonBg.on('pointerover', () => {
                buttonBg.fillColor = 0x555555;
            });
            
            buttonBg.on('pointerout', () => {
                buttonBg.fillColor = 0x333333;
            });
            
            // Select tool when clicked
            buttonBg.on('pointerdown', () => {
                // Check if player has enough coins
                if ((window.gameState.score || 0) >= tool.cost) {
                    // Store selected tool in game state
                    window.gameState.selectedTool = {
                        name: tool.name,
                        image: tool.image,
                        strength: tool.strength
                    };
                    
                    // Deduct coins
                    window.gameState.score -= tool.cost;
                    
                    // Highlight selected tool
                    this.selectTool(buttonBg);
                } else {
                    this.showMessage("Not enough coins!");
                }
            });
            
            yPos += 150;
        });
        
        // Create continue button (disabled until tool is selected)
        this.continueButton = this.add.text(800, 900, 'CONTINUE TO BOSS', {
            font: '40px Arial',
            fill: '#ffffff',
            backgroundColor: '#555555',
            padding: { x: 30, y: 20 }
        }).setOrigin(0.5).setInteractive();
        
        // Button hover effect
        this.continueButton.on('pointerover', () => {
            if (window.gameState.selectedTool) {
                this.continueButton.setBackgroundColor('#006699');
            }
        });
        
        this.continueButton.on('pointerout', () => {
            if (window.gameState.selectedTool) {
                this.continueButton.setBackgroundColor('#004466');
            } else {
                this.continueButton.setBackgroundColor('#555555');
            }
        });
        
        // Start boss battle when clicked
        this.continueButton.on('pointerdown', () => {
            if (window.gameState.selectedTool) {
                this.scene.start('BossScene');
            } else {
                this.showMessage("Please select a tool first!");
            }
        });
    }
    
    selectTool(buttonBg) {
        // Enable continue button
        this.continueButton.setBackgroundColor('#004466');
        
        // Highlight selected button
        buttonBg.fillColor = 0x006699;
        
        // Show selected message
        this.showMessage("Tool selected! Ready for battle!");
    }
    
    showMessage(text) {
        // Create a message that appears briefly
        const message = this.add.text(800, 200, text, {
            font: '36px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(100);
        
        // Remove after a delay
        this.time.delayedCall(2000, () => {
            message.destroy();
        });
    }
} 