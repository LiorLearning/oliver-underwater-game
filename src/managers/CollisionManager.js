export class CollisionManager {
    constructor(scene) {
        this.scene = scene;
    }

    setupCollisions() {
        this._setupPlayerWallCollisions();
        this._setupEnemyCollisions();
        this._setupCollectibleCollisions();
        this._setupExitCollision();
    }

    _setupPlayerWallCollisions() {
        // Player collides with maze walls with improved handling
        this.scene.physics.add.collider(
            this.scene.player, 
            this.scene.maze, 
            null, 
            this._handleWallCollision, 
            this
        );
    }

    _handleWallCollision(player, wall) {
        // Calculate collision normal
        const dx = player.x - wall.x;
        const dy = player.y - wall.y;
        
        // Apply a small bounce-back effect to prevent sticking
        const bounceForce = 5;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal collision
            player.body.velocity.x += Math.sign(dx) * bounceForce;
        } else {
            // Vertical collision
            player.body.velocity.y += Math.sign(dy) * bounceForce;
        }
        
        return true; // Allow normal collision
    }

    _setupEnemyCollisions() {
        console.log('Setting up enemy collisions');
        console.log('Assistants group exists:', !!this.scene.assistants);
        console.log('Number of assistants:', this.scene.assistants ? this.scene.assistants.getChildren().length : 0);
        console.log('Player exists:', !!this.scene.player);
        
        if (!this.scene.assistants || !this.scene.player) {
            console.error('Missing required game objects for collision setup!');
            return;
        }
        
        // Assistants collide with maze walls
        this.scene.physics.add.collider(this.scene.assistants, this.scene.maze);
        
        // Assistants collide with each other
        this.scene.physics.add.collider(this.scene.assistants, this.scene.assistants);
        
        // DIRECT COLLISION SETUP - try this approach instead
        // Create a direct collision handler function that doesn't use process callback
        const handleEnemyCollision = (player, assistant) => {
            console.log('Direct enemy collision detected!');
            
            // Only handle collision if player is not invulnerable
            if (player.invulnerable) {
                console.log('Player is invulnerable, ignoring collision');
                return;
            }
            
            console.log('Processing enemy collision with', assistant);
            
            // Apply damage to player
            window.gameState.health = Math.max(0, window.gameState.health - 10);
            player.health = window.gameState.health;
            
            // Flash red when taking damage
            player.setTint(0xff0000);
            
            // Make player invincible for 5 seconds
            player.invulnerable = true;
            player.invulnerableTime = 5000; // 5 seconds
            
            // Reset invulnerability after 5 seconds
            player.scene.time.delayedCall(5000, () => {
                player.clearTint();
                player.invulnerable = false;
                // Reset the invulnerability time back to original
                player.invulnerableTime = 1000;
            });
            
            // Check if player is defeated
            if (window.gameState.health <= 0) {
                player.die();
            }
            
            // Update UI
            this.scene.uiManager.updateHealthBar();
            this.scene.uiManager.showMessage('Hit by enemy! -10 health, invincible for 5 seconds!');
            
            console.log('Player hit by enemy! Health reduced to:', window.gameState.health);
        };
        
        // Try both approaches to see which one works:
        
        // 1. Regular overlap with scene's hitEnemy method
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.assistants,
            this.scene.hitEnemy,
            null,  // Try without the process callback
            this.scene
        );
        
        // 2. Direct collision handler
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.assistants,
            handleEnemyCollision
        );
        
        console.log('Enemy collision setup complete');
    }

    _setupCollectibleCollisions() {
        // Player collects coins
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.collectibles,
            this.scene.collectCoin,
            null,
            this.scene
        );
        
        // Player collects tools
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.tools,
            this.scene.collectTool,
            null,
            this.scene
        );
        // Player collects smoke bombs
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.smokeBombsGroup,
            this.scene.collectSmokeBomb,
            null,
            this.scene
        );
    }

    _setupExitCollision() {
        // Player reaches exit
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.exit,
            this.scene.reachExit,
            null,
            this.scene
        );
    }
} 