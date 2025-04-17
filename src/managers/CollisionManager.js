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
        // Assistants collide with maze walls
        this.scene.physics.add.collider(this.scene.assistants, this.scene.maze);
        
        // Assistants collide with each other
        this.scene.physics.add.collider(this.scene.assistants, this.scene.assistants);
        
        // Player collides with assistants (enemies), takes damage
        this.scene.physics.add.overlap(
            this.scene.player,
            this.scene.assistants,
            this.scene.hitEnemy,
            this._isCollisionValid,
            this.scene
        );
    }

    _isCollisionValid(player, assistant) {
        // Only register hit if player and assistant are both active
        // This helps prevent collision issues
        return player.active && assistant.active;
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