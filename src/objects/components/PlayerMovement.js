export class PlayerMovement {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        
        // Movement properties
        this.moveSpeed = 300; // Slightly reduced for better control
        this.diagonalFactor = 0.7071; // 1/sqrt(2)
        
        // Control inputs
        this.cursors = scene.input.keyboard.createCursorKeys();
    }
    
    update() {
        // Handle player movement
        this.handleMovement();
        
        // Check if player is outside the playable area and restrict movement
        this.checkBounds();
    }
    
    handleMovement() {
        // Apply "friction" by slowing down the player gradually
        // rather than instantly setting velocity to 0
        if (!this.cursors.left.isDown && !this.cursors.right.isDown) {
            this.player.body.velocity.x *= 0.9;
        }
        if (!this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.player.body.velocity.y *= 0.9;
        }
        
        // Get input
        let vx = 0;
        let vy = 0;
        
        // Check for keyboard input
        if (this.cursors.left.isDown) {
            vx = -this.moveSpeed;
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            vx = this.moveSpeed;
            this.player.setFlipX(false);
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
            const rayEndX = this.player.x + vx * 0.5;
            const rayEndY = this.player.y + vy * 0.5;
            
            // Check if there's a wall in our path using overlap rect (like a wide ray)
            const nearbyBodies = this.scene.physics.overlapRect(
                Math.min(this.player.x, rayEndX) - rayWidth/2, 
                Math.min(this.player.y, rayEndY) - rayWidth/2,
                Math.abs(rayEndX - this.player.x) + rayWidth,
                Math.abs(rayEndY - this.player.y) + rayWidth
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
                    const playerLeft = this.player.x - this.player.body.width / 2;
                    const playerRight = this.player.x + this.player.body.width / 2;
                    const playerTop = this.player.y - this.player.body.height / 2;
                    const playerBottom = this.player.y + this.player.body.height / 2;
                    
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
                        if (this.player.x < wall.x && vx > 0) {
                            vx = 0; // Stop moving right into wall
                        } else if (this.player.x > wall.x && vx < 0) {
                            vx = 0; // Stop moving left into wall
                        }
                    } else {
                        // Vertical collision is more important
                        if (this.player.y < wall.y && vy > 0) {
                            vy = 0; // Stop moving down into wall
                        } else if (this.player.y > wall.y && vy < 0) {
                            vy = 0; // Stop moving up into wall
                        }
                    }
                });
            }
        }
        
        // Check for "stuck" condition (very low velocity when input is active)
        const isMoving = Math.abs(vx) > 0 || Math.abs(vy) > 0;
        const isStuck = isMoving && 
                        Math.abs(this.player.body.velocity.x) < 10 && 
                        Math.abs(this.player.body.velocity.y) < 10;
        
        if (isStuck) {
            // If stuck, give a slightly stronger push to escape
            if (Math.abs(vx) > Math.abs(vy)) {
                // If moving more horizontally, give vertical nudge
                this.player.body.velocity.y = this.player.body.velocity.y > 0 ? 60 : -60;
            } else {
                // If moving more vertically, give horizontal nudge
                this.player.body.velocity.x = this.player.body.velocity.x > 0 ? 60 : -60;
            }
        }
        
        // Apply velocity (only when input is active)
        if (vx !== 0) {
            this.player.body.velocity.x = vx;
        }
        if (vy !== 0) {
            this.player.body.velocity.y = vy;
        }
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
        if (this.player.x < minX) {
            this.player.x = minX;
            this.player.body.velocity.x = Math.max(0, this.player.body.velocity.x);
        } else if (this.player.x > maxX) {
            this.player.x = maxX;
            this.player.body.velocity.x = Math.min(0, this.player.body.velocity.x);
        }
        
        if (this.player.y < minY) {
            this.player.y = minY;
            this.player.body.velocity.y = Math.max(0, this.player.body.velocity.y);
        } else if (this.player.y > maxY) {
            this.player.y = maxY;
            this.player.body.velocity.y = Math.min(0, this.player.body.velocity.y);
        }
    }
} 