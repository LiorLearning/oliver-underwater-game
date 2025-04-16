export class BossBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, velocity) {
        super(scene, x, y, 'bossBullet');
        
        // Add bullet to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set bullet properties
        this.setScale(0.5);
        this.setTint(0xff0000);
        
        // Set velocity
        this.body.setVelocity(velocity.x, velocity.y);
        
        // Set body size
        this.body.setSize(10, 10);
        
        // Destroy bullet when it goes out of bounds
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;
        
        // Set bullet damage
        this.damage = 5;
    }
    
    update() {
        // Rotate the bullet as it moves (optional visual effect)
        this.angle += 2;
        
        // Check if bullet is out of bounds
        if (this.x < 0 || this.x > this.scene.game.config.width || 
            this.y < 0 || this.y > this.scene.game.config.height) {
            this.destroy();
        }
    }
} 