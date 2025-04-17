export class SmokeBomb {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        
        // Smoke bomb properties
        this.smokeBombs = 3;
        this.canDeployBomb = true;
        this.bombCooldown = 1000; // ms
        
        // Add spacebar input for smoke bombs
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    update() {
        // Handle smoke bomb deployment
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.smokeBombs > 0 && this.canDeployBomb) {
            this.deploySmokeBomb();
        }
    }
    
    deploySmokeBomb() {
        // Only deploy if we have bombs
        if (this.smokeBombs <= 0) return;
        
        this.smokeBombs--;
        this.canDeployBomb = false;
        
        // Determine direction to throw the bomb (based on facing direction or movement)
        let throwDirectionX = 0;
        let throwDirectionY = 0;
        
        // First check if player is moving and use that direction
        if (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0) {
            // Normalize the velocity vector
            const velMagnitude = Math.sqrt(this.player.body.velocity.x * this.player.body.velocity.x + this.player.body.velocity.y * this.player.body.velocity.y);
            throwDirectionX = this.player.body.velocity.x / velMagnitude;
            throwDirectionY = this.player.body.velocity.y / velMagnitude;
        } else {
            // If not moving, use the facing direction
            throwDirectionX = this.player.flipX ? -1 : 1;
            throwDirectionY = 0;
        }
        
        // Distance to throw the bomb (1 cell ahead)
        const throwDistance = 150;
        
        // Calculate the bomb position (1 cell ahead of player)
        const bombX = this.player.x + throwDirectionX * throwDistance;
        const bombY = this.player.y + throwDirectionY * throwDistance;
        
        // Create smoke explosion effect at the calculated position
        const smokeParticles = this.scene.add.particles(bombX, bombY, 'particle', {
            speed: { min: 100, max: 300 },
            scale: { start: 0.5, end: 0 },
            lifespan: 1500,
            blendMode: 'ADD',
            tint: 0xaaaaaa,
            quantity: 40,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 120), quantity: 40 }
        });
        
        // Create smoke bomb animation from player to target position
        const smokeBomb = this.scene.add.image(this.player.x, this.player.y, 'smoke-bomb')
            .setScale(0.4)
            .setDepth(9);
        
        // Animate smoke bomb traveling from player to target position
        this.scene.tweens.add({
            targets: smokeBomb,
            x: bombX,
            y: bombY,
            duration: 200,
            onComplete: () => {
                // Animate smoke bomb explosion once it reaches target
                this.scene.tweens.add({
                    targets: smokeBomb,
                    scale: 0.6,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        smokeBomb.destroy();
                    }
                });
            }
        });
        
        // Destroy any enemies within the smoke bomb radius
        const hitRadius = 150; // Larger than visual effect for gameplay
        const assistants = this.scene.assistants.getChildren();
        
        for (let i = 0; i < assistants.length; i++) {
            const assistant = assistants[i];
            const distance = Phaser.Math.Distance.Between(bombX, bombY, assistant.x, assistant.y);
            
            if (distance <= hitRadius) {
                // Destroy this assistant
                assistant.destroy();
                
                // Create destruction effect for the assistant
                const destroyParticles = this.scene.add.particles(assistant.x, assistant.y, 'particle', {
                    speed: { min: 50, max: 150 },
                    scale: { start: 0.3, end: 0 },
                    lifespan: 800,
                    blendMode: 'ADD',
                    tint: 0xff0000,
                    quantity: 15
                });
                
                // Auto-destroy particles
                this.scene.time.delayedCall(800, () => {
                    destroyParticles.destroy();
                });
            }
        }
        
        // Show message about using smoke bomb
        this.scene.uiManager.showMessage(`Smoke bomb deployed! ${this.smokeBombs} remaining`);
        
        // Start cooldown
        this.scene.time.delayedCall(this.bombCooldown, () => {
            this.canDeployBomb = true;
        });
    }
} 