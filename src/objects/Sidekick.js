export class Sidekick extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add sidekick to the scene
      scene.add.existing(this);
      
      // Set scale
      this.setScale(0.2);
      
      // Follow parameters
      this.followDistance = 50; // Distance to maintain from player
      this.followSpeed = 0.05; // How quickly to move to position (0-1)
      
      // Offset position (slightly above and to the right of player)
      this.offsetX = 20;
      this.offsetY = -20;
      
      // Glowing effect
      this.createGlowEffect(scene);
      
      // Bubble particles
      this.createBubbles(scene);
  }
  
  update(playerX, playerY) {
      // Calculate target position (offset from player)
      const targetX = playerX + this.offsetX;
      const targetY = playerY + this.offsetY;
      
      // Smoothly move towards target position
      this.x = Phaser.Math.Linear(this.x, targetX, this.followSpeed);
      this.y = Phaser.Math.Linear(this.y, targetY, this.followSpeed);
      
      // Subtle hovering animation
      this.offsetY = -20 + Math.sin(this.scene.time.now / 500) * 5;
      
      // Update particle emitter position
      if (this.bubbleEmitter) {
          this.bubbleEmitter.setPosition(this.x, this.y);
      }
  }
  
  createGlowEffect(scene) {
      // Add a subtle glow around the sidekick
      const glow = scene.add.sprite(this.x, this.y, texture)
          .setScale(this.scale * 1.2)
          .setAlpha(0.3)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0x00ffff);
          
      // Link the glow effect to the sidekick
      this.on('destroy', () => {
          glow.destroy();
      });
      
      // Update glow position
      scene.events.on('update', () => {
          glow.setPosition(this.x, this.y);
      });
  }
  
  createBubbles(scene) {
      // Create occasional bubble particles
      this.bubbleEmitter = scene.add.particles('sidekick').createEmitter({
          speed: { min: 5, max: 15 },
          scale: { start: 0.02, end: 0.01 },
          alpha: { start: 0.2, end: 0 },
          lifespan: 1500,
          frequency: 500
      });
      
      // Set initial position
      this.bubbleEmitter.setPosition(this.x, this.y);
  }
  
  showReaction(type) {
      // Show a reaction icon based on type (excitement, curiosity, etc.)
      const reactions = {
          excited: '!',
          curious: '?',
          alert: '!!'
      };
      
      const symbol = reactions[type] || '!';
      
      // Create reaction text
      const reaction = this.scene.add.text(this.x, this.y - 30, symbol, {
          font: '24px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Animate and remove
      this.scene.tweens.add({
          targets: reaction,
          y: this.y - 50,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
              reaction.destroy();
          }
      });
  }
}