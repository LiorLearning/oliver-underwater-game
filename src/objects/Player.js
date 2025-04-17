export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        
        // Add player to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up physics properties
        this.body.setAllowGravity(false); // No gravity underwater
        this.setCollideWorldBounds(false); // Don't collide with world bounds - maze walls will keep player contained
        this.setDamping(true); // Simulate water resistance
        this.setDrag(0.8); // Reduced water resistance for smoother movement
        
        // Set scale and make sure player is visible
        this.setScale(0.6);
        this.setDepth(10);
        
        // Create circular hitbox for better navigation around corners
        const circleRadius = Math.min(this.width, this.height) * 0.3;
        this.body.setCircle(circleRadius);
        this.body.setOffset(
            (this.width - circleRadius * 2) / 2, 
            (this.height - circleRadius * 2) / 2
        );
        
        // Movement properties
        this.moveSpeed = 300; // Slightly reduced for better control
        this.diagonalFactor = 0.7071; // 1/sqrt(2)
        
        // Control inputs
        this.cursors = scene.input.keyboard.createCursorKeys();
        
        // Add E key for collecting coins/tools
        this.eKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        
        // Bubble trail particles
        this.createBubbleTrail(scene);

        // Player health properties - now using the global gameState
        this.maxHealth = 100;
        this.health = window.gameState.health;
        this.invulnerable = false;
        this.invulnerableTime = 1000; // ms
        
        // Smoke bomb properties
        this.smokeBombs = 3;
        this.canDeployBomb = true;
        this.bombCooldown = 1000; // ms
        
        // Collection properties
        this.collectibleInRange = null;
        this.collectRange = 100; // Distance within which collectibles can be picked up
        
        // Add spacebar input for smoke bombs
        this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
    
    update() {
        // Movement logic
        this.handleMovement();
        
        // Emit bubble particles based on velocity
        this.updateBubbleEmitter();
        
        // Check if player is outside the playable area and restrict movement
        this.checkBounds();
        
        // Handle smoke bomb deployment
        this.handleSmokeBomb();
        
        // Handle item collection with E key
        this.handleCollection();
    }
    
    handleCollection() {
        // Check for nearby collectibles
        this.updateNearbyCollectibles();
        
        // Check if E key is pressed and player is near a collectible
        if (Phaser.Input.Keyboard.JustDown(this.eKey) && this.collectibleInRange) {
            this.collectItem(this.collectibleInRange);
        }
    }
    
    updateNearbyCollectibles() {
        // Reset the collectible in range
        this.collectibleInRange = null;
        
        // Check for coins in range
        if (this.scene.collectibles) {
            const nearestCoin = this.findNearestCollectible(this.scene.collectibles.getChildren());
            if (nearestCoin) {
                this.collectibleInRange = nearestCoin;
            }
        }
        
        // If no coin is in range, check for tools
        if (!this.collectibleInRange && this.scene.tools) {
            const nearestTool = this.findNearestCollectible(this.scene.tools.getChildren());
            if (nearestTool) {
                this.collectibleInRange = nearestTool;
            }
        }
        
        // Visual feedback for nearby collectible
        if (this.collectibleInRange && !this.collectibleInRange.isHighlighted) {
            // Add highlight effect to indicate collectible can be picked up
            this.collectibleInRange.isHighlighted = true;
            this.scene.tweens.add({
                targets: this.collectibleInRange,
                scale: this.collectibleInRange.scale * 1.2,
                duration: 300,
                yoyo: true,
                repeat: -1
            });
            
            // Show hint
            this.scene.uiManager.showMessage('Press E to collect');
        } else if (!this.collectibleInRange) {
            // Remove highlight from any previously highlighted collectibles
            if (this.scene.collectibles) {
                this.scene.collectibles.getChildren().forEach(coin => {
                    if (coin.isHighlighted) {
                        coin.isHighlighted = false;
                        this.scene.tweens.killTweensOf(coin);
                        coin.setScale(coin.type === 'coin' ? 0.5 : 0.8);
                    }
                });
            }
            
            if (this.scene.tools) {
                this.scene.tools.getChildren().forEach(tool => {
                    if (tool.isHighlighted) {
                        tool.isHighlighted = false;
                        this.scene.tweens.killTweensOf(tool);
                        tool.setScale(0.8);
                    }
                });
            }
        }
    }
    
    findNearestCollectible(collectibles) {
        let nearestCollectible = null;
        let nearestDistance = this.collectRange;
        
        collectibles.forEach(collectible => {
            if (collectible.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.x, this.y, collectible.x, collectible.y
                );
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestCollectible = collectible;
                }
            }
        });
        
        return nearestCollectible;
    }
    
    collectItem(collectible) {
        // Determine type of collectible (coin or tool)
        if (collectible.type === 'coin') {
            this.scene.collectCoin(this, collectible);
        } else {
            this.scene.collectTool(this, collectible);
        }
    }
    
    handleSmokeBomb() {
        // Check if space is pressed, player has bombs, and can deploy
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
        if (this.body.velocity.x !== 0 || this.body.velocity.y !== 0) {
            // Normalize the velocity vector
            const velMagnitude = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
            throwDirectionX = this.body.velocity.x / velMagnitude;
            throwDirectionY = this.body.velocity.y / velMagnitude;
        } else {
            // If not moving, use the facing direction
            throwDirectionX = this.flipX ? -1 : 1;
            throwDirectionY = 0;
        }
        
        // Distance to throw the bomb (1 cell ahead)
        const throwDistance = 150;
        
        // Calculate the bomb position (1 cell ahead of player)
        const bombX = this.x + throwDirectionX * throwDistance;
        const bombY = this.y + throwDirectionY * throwDistance;
        
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
        const smokeBomb = this.scene.add.image(this.x, this.y, 'smoke-bomb')
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
    
    checkBounds() {
        // The maze area is from (0,0) to (3200,2400)
        // Allow slight buffer outside this area
        const buffer = 20;
        const minX = -buffer;
        const minY = -buffer;
        const maxX = 3200 + buffer;
        const maxY = 2400 + buffer;
        
        // Check if player is outside bounds and restrict movement
        if (this.x < minX) {
            this.x = minX;
            this.body.velocity.x = Math.max(0, this.body.velocity.x);
        } else if (this.x > maxX) {
            this.x = maxX;
            this.body.velocity.x = Math.min(0, this.body.velocity.x);
        }
        
        if (this.y < minY) {
            this.y = minY;
            this.body.velocity.y = Math.max(0, this.body.velocity.y);
        } else if (this.y > maxY) {
            this.y = maxY;
            this.body.velocity.y = Math.min(0, this.body.velocity.y);
        }
    }
    
    handleMovement() {
        // Apply "friction" by slowing down the player gradually
        // rather than instantly setting velocity to 0
        if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
            this.body.velocity.x *= 0.9;
        }
        if (!this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.body.velocity.y *= 0.9;
        }
        
        // Get input
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
        
        // Check for walls directly in our path and adjust movement accordingly
        const wallLayer = this.scene.maze;
        
        if (wallLayer && (vx !== 0 || vy !== 0)) {
            // Set up ray casting parameters
            const rayLength = 60; // How far ahead to check
            const rayWidth = 40;  // Width of the ray (for detecting walls to the sides)
            
            // Calculate ray end position based on movement direction
            const rayEndX = this.x + vx * 0.5;
            const rayEndY = this.y + vy * 0.5;
            
            // Check if there's a wall in our path using overlap rect (like a wide ray)
            const nearbyBodies = this.scene.physics.overlapRect(
                Math.min(this.x, rayEndX) - rayWidth/2, 
                Math.min(this.y, rayEndY) - rayWidth/2,
                Math.abs(rayEndX - this.x) + rayWidth,
                Math.abs(rayEndY - this.y) + rayWidth
            );
            
            // Filter for only maze walls (not boundaries)
            const nearbyWalls = nearbyBodies.filter(body => 
                wallLayer.contains(body.gameObject) && 
                body.gameObject.name === 'wall'
            );
            
            // Check for potential collisions
            if (nearbyWalls.length > 0) {
                // Handle wall collisions separately in x and y directions
                
                // For each nearby wall, check if movement in X or Y would cause more collision
                nearbyWalls.forEach(body => {
                    const wall = body.gameObject;
                    
                    // Calculate distance from player to wall edges
                    const playerLeft = this.x - this.body.width / 2;
                    const playerRight = this.x + this.body.width / 2;
                    const playerTop = this.y - this.body.height / 2;
                    const playerBottom = this.y + this.body.height / 2;
                    
                    const wallLeft = wall.x - wall.body.width / 2;
                    const wallRight = wall.x + wall.body.width / 2;
                    const wallTop = wall.y - wall.body.height / 2;
                    const wallBottom = wall.y + wall.body.height / 2;
                    
                    // Horizontal separation
                    const xOverlap = Math.min(playerRight - wallLeft, wallRight - playerLeft);
                    
                    // Vertical separation
                    const yOverlap = Math.min(playerBottom - wallTop, wallBottom - playerTop);
                    
                    // Adjust velocity to avoid wall
                    if (xOverlap < yOverlap) {
                        // Horizontal collision is more important
                        if (this.x < wall.x && vx > 0) {
                            vx = 0; // Stop moving right into wall
                        } else if (this.x > wall.x && vx < 0) {
                            vx = 0; // Stop moving left into wall
                        }
                    } else {
                        // Vertical collision is more important
                        if (this.y < wall.y && vy > 0) {
                            vy = 0; // Stop moving down into wall
                        } else if (this.y > wall.y && vy < 0) {
                            vy = 0; // Stop moving up into wall
                        }
                    }
                });
            }
        }
        
        // Check for "stuck" condition (very low velocity when input is active)
        const isMoving = Math.abs(vx) > 0 || Math.abs(vy) > 0;
        const isStuck = isMoving && 
                        Math.abs(this.body.velocity.x) < 10 && 
                        Math.abs(this.body.velocity.y) < 10;
        
        if (isStuck) {
            // If stuck, give a slightly stronger push to escape
            if (Math.abs(vx) > Math.abs(vy)) {
                // If moving more horizontally, give vertical nudge
                this.body.velocity.y = this.body.velocity.y > 0 ? 60 : -60;
            } else {
                // If moving more vertically, give horizontal nudge
                this.body.velocity.x = this.body.velocity.x > 0 ? 60 : -60;
            }
        }
        
        // Apply velocity (only when input is active)
        if (vx !== 0) {
            this.body.velocity.x = vx;
        }
        if (vy !== 0) {
            this.body.velocity.y = vy;
        }
    }
    
    createBubbleTrail(scene) {
        // Create particle system for bubble trail effect
        this.bubbles = scene.add.particles(0, 0, 'particle', {
            speed: { min: 5, max: 20 },
            scale: { start: 0.2, end: 0 },
            lifespan: 2000,
            alpha: { start: 0.5, end: 0 },
            tint: 0x3385ff, // Light blue tint
            blendMode: 'ADD',
            frequency: -1 // Manual control
        });
    }
    
    updateBubbleEmitter() {
        // Only emit bubbles when moving
        const speed = Math.sqrt(Math.pow(this.body.velocity.x, 2) + Math.pow(this.body.velocity.y, 2));
        
        if (speed > 20) {
            // Emit bubbles from player position
            this.bubbles.emitParticle(1, this.x, this.y);
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
