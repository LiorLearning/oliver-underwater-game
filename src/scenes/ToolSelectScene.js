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
        
        // Position variables
        const centerX = width / 2;
        const toolListX = 500; // Moved left
        const startY = 350; // Moved up
        
        // Add title text
        this.add.text(centerX-300, 100, 'Select Your Weapon', {
            font: '64px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Show message
        this.add.text(centerX-300, 200, 'Oliver to design the boss level', {
            font: '36px Arial',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Add villain on the right side with red backdrop
        this.add.circle(1300, 500, 200, 0xff8800, 0.5)
            .setOrigin(0.5);
        this.add.image(1300, 500, 'boss')
            .setScale(0.8)
            .setOrigin(0.5);
        // Define available weapons
        const weapons = [
            { name: 'Laser Beam', image: 'laser', strength: 10, description: 'Precise attack with moderate damage' },
            { name: 'Combat Gun', image: 'gun', strength: 20, description: 'Balanced attack with good damage' },
            { name: 'Rocket Launcher', image: 'rocket-launcher', strength: 30, description: 'Explosive attack with maximum damage' }
        ];

        // Layout variables
        const buttonWidth = 600;
        const buttonHeight = 120;
        const spacing = 150;
        const weaponImageX = toolListX - 220;
        const weaponInfoX = toolListX - 140;
        
        // Create weapon selection buttons
        let yPos = startY;
        weapons.forEach(weapon => {
            const buttonBg = this.add.rectangle(toolListX, yPos, buttonWidth, buttonHeight, 0x333333, 0.8).setOrigin(0.5);
            
            // Weapon image
            const weaponImage = this.add.image(weaponImageX, yPos, weapon.image).setScale(0.3);
            
            // Weapon info
            this.add.text(weaponInfoX, yPos - 30, weapon.name, {
                font: '32px Arial',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            this.add.text(weaponInfoX, yPos, `Damage: ${weapon.strength}`, {
                font: '24px Arial',
                fill: '#00ff00'
            }).setOrigin(0, 0.5);
            
            this.add.text(weaponInfoX, yPos + 30, weapon.description, {
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
            
            // Select weapon when clicked
            buttonBg.on('pointerdown', () => {
                // Store selected weapon in game state
                window.gameState.selectedTool = {
                    name: weapon.name,
                    image: weapon.image,
                    strength: weapon.strength
                };
                
                // Highlight selected weapon
                this.selectTool(buttonBg);
            });
            
            yPos += spacing;
        });
        
        // // Create continue button
        // this.continueButton = this.add.text(centerX, 820, 'CONTINUE TO BOSS', {
        //     font: '40px Arial',
        //     fill: '#ffffff',
        //     backgroundColor: '#555555',
        //     padding: { x: 30, y: 20 }
        // }).setOrigin(0.5).setInteractive();
        
        // // Button hover effect
        // this.continueButton.on('pointerover', () => {
        //     if (window.gameState.selectedTool) {
        //         this.continueButton.setBackgroundColor('#006699');
        //     }
        // });
        
        // this.continueButton.on('pointerout', () => {
        //     if (window.gameState.selectedTool) {
        //         this.continueButton.setBackgroundColor('#004466');
        //     } else {
        //         this.continueButton.setBackgroundColor('#555555');
        //     }
        // });
        
        // // Start boss battle when clicked
        // this.continueButton.on('pointerdown', () => {
        //     if (window.gameState.selectedTool) {
        //         this.scene.start('BossScene');
        //     } else {
        //         this.showMessage("Please select a weapon first!");
        //     }
        // });
    }
    
    selectTool(buttonBg) {
        // Enable continue button
        // this.continueButton.setBackgroundColor('#004466');
        
        // Highlight selected button
        buttonBg.fillColor = 0x006699;
        
        // Show selected message
        // this.showMessage("Weapon selected! Ready for battle!");
    }
    
    showMessage(text) {
        // Create a message that appears briefly
        const message = this.add.text(this.sys.game.config.width / 2, 200, text, {
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