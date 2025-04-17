export class ExitManager {
    constructor(scene) {
        this.scene = scene;
        this.exitOpen = false;
    }

    createExitDoor() {
        // Create exit door (position at bottom right of maze)
        this.scene.exit = this.scene.physics.add.sprite(3000, 2200, 'exit');
        this.scene.exit.setScale(0.7);
        this.scene.exit.setImmovable(true);
        
        // Initially the exit is closed/locked
        this.scene.exit.setTint(0xff0000);
        
        // Add a visual indicator
        this.exitText = this.scene.add.text(3000, 2150, 'EXIT\n(Collect 3 tool)', {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    checkExitCondition() {
        // Check if at least 1 tool is collected (changed from 3)
        console.log('Checking exit condition:', window.gameState.collectedTools.length);
        if (window.gameState.collectedTools.length >= 3 && !this.exitOpen) {
            this.openExit();
        }
    }

    openExit() {
        // Mark exit as open
        this.exitOpen = true;
        this.scene.exitOpen = true;
        
        // Change exit appearance
        this.scene.exit.setTint(0x00ff00);
        
        // Update exit text
        this.exitText.setText('EXIT\n(Now Open!)');
        
        // Create visual effects
        this._createOpenExitEffects();
    }

    _createOpenExitEffects() {
        // First make the exit invisible
        this.scene.exit.setAlpha(0);
        this.exitText.setAlpha(0);
        
        // Create a flash effect
        const flash = this.scene.add.rectangle(
            this.scene.exit.x, 
            this.scene.exit.y, 
            300, 
            300, 
            0xffffff, 
            1
        );
        flash.setAlpha(0);
        
        // Flash sequence
        this.scene.tweens.add({
            targets: flash,
            alpha: 1,
            duration: 400,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                flash.destroy();
                
                // Make exit appear with scaling effect
                this.scene.exit.setAlpha(1);
                this.exitText.setAlpha(1);
                
                this.scene.tweens.add({
                    targets: [this.scene.exit, this.exitText],
                    scale: { from: 0, to: 1 },
                    duration: 1000,
                    ease: 'Back.easeOut'
                });
                
                // Add particles around the exit
                const particles = this.scene.add.particles(
                    this.scene.exit.x, 
                    this.scene.exit.y, 
                    'particle', 
                    {
                        speed: { min: 50, max: 150 },
                        scale: { start: 0.4, end: 0 },
                        lifespan: 3000,
                        blendMode: 'ADD',
                        frequency: 50,
                        emitZone: { 
                            type: 'edge', 
                            source: new Phaser.Geom.Circle(0, 0, 100), 
                            quantity: 16 
                        }
                    }
                );
                
                // Add pulsing effect to exit
                this.scene.tweens.add({
                    targets: this.scene.exit,
                    scale: 0.9,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
                
                // Camera shake effect
                this.scene.cameras.main.shake(500, 0.005);
            }
        });
        
        // Play exit appearance sound if available
        // if (this.scene.sound && this.scene.sound.add) {
        //     const exitSound = this.scene.sound.add('exit_appear', { volume: 0.8 });
        //     exitSound.play();
        // }
        
        // Show message to player
        this.scene.uiManager.showMessage('Tool collected! The exit is now open!');
    }

    isExitOpen() {
        return this.exitOpen;
    }
} 