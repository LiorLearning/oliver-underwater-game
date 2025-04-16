export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        // Add player to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up physics properties
        this.body.setAllowGravity(false); // No gravity underwater
        this.setCollideWorldBounds(false); // Allow going off-screen
        this.setDamping(true); // Simulate water resistance
        this.setDrag(0.9); // Water resistance value
        
        // Set scale and make sure player is visible
        this.setScale(0.6);
        this.setDepth(10);
        
        // Movement properties
        this.moveSpeed = 400;
        this.diagonalFactor = 0.7071; // 1/sqrt(2)
        
        // Control inputs
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // Bubble trail particles
        this.createBubbleTrail(scene);

        // Player health properties - now using the global gameState
        this.maxHealth = 100;
        this.health = window.gameState.health;
        this.invulnerable = false;
        this.invulnerableTime = 1000; // ms
    }
    
    update() {
        // Movement logic
        this.handleMovement();
        
        // Emit bubble particles based on velocity
        this.updateBubbleEmitter();
    }
    
    handleMovement() {
        // Reset velocity
        this.body.setVelocity(0);
        
        let vx = 0;
        let vy = 0;
        
        // Check for keyboard input
        if (this.cursors.left.isDown) {
            vx = -this.moveSpeed;
            this.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            vx = this.moveSpeed;
            this.setFlipX(false);
        }
        
        if (this.cursors.up.isDown) {
            vy = -this.moveSpeed;
        } else if (this.cursors.down.isDown) {
            vy = this.moveSpeed;
        }
        
        // Normalize diagonal movement
        if (vx !== 0 && vy !== 0) {
            vx *= this.diagonalFactor;
            vy *= this.diagonalFactor;
        }
        
        // Apply velocity
        this.body.setVelocity(vx, vy);
    }
    
    createBubbleTrail(scene) {
        // Create bubble emitter for underwater effect
        this.bubbleEmitter = scene.add.particles('particle').createEmitter({
            speed: { min: 20, max: 60 },
            scale: { start: 0.1, end: 0.02 },
            alpha: { start: 0.5, end: 0 },
            lifespan: 2000,
            frequency: 100,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Rectangle(-20, -20, 40, 40),
                quantity: 10
            }
        });
        
        // Initial position
        this.bubbleEmitter.startFollow(this);
    }
    
    updateBubbleEmitter() {
        // Adjust bubble emission rate based on movement
        const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
        
        // Only emit bubbles when moving
        if (speed > 10) {
            this.bubbleEmitter.setFrequency(1000 / speed * 5);
            this.bubbleEmitter.resume();
        } else {
            this.bubbleEmitter.pause();
        }
    }
    
    takeDamage(amount = 10) {
        // Check if player is currently invulnerable
        if (this.invulnerable) return;
        
        // Apply damage to global health
        window.gameState.health = Math.max(0, window.gameState.health - amount);
        this.health = window.gameState.health;
        
        // Flash red when taking damage
        this.setTint(0xff0000);
        
        // Set invulnerable briefly
        this.invulnerable = true;
        
        // Clear tint and reset invulnerability after a delay
        this.scene.time.delayedCall(this.invulnerableTime, () => {
            this.clearTint();
            this.invulnerable = false;
        });
        
        // Check if health is depleted
        if (window.gameState.health <= 0) {
            this.die();
        }
    }
    
    heal(amount = 10) {
        // Increase health but don't exceed max
        window.gameState.health = Math.min(this.maxHealth, window.gameState.health + amount);
        this.health = window.gameState.health;
        
        // Flash green to indicate healing
        this.setTint(0x00ff00);
        
        // Clear tint after a delay
        this.scene.time.delayedCall(500, () => {
            this.clearTint();
        });
    }
    
    die() {
        // Player death logic
        this.scene.time.delayedCall(500, () => {
            // Restart the level
            this.scene.scene.restart();
        });
    }
}