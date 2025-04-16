export class Sidekick extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add sidekick to the scene
      scene.add.existing(this);
      
      // Set scale
      this.setScale(0.4);
      
      // Follow parameters
      this.followDistance = 100; // Distance to maintain from player
      this.followSpeed = 0.05; // How quickly to move to position (0-1)
      
      // Offset position (slightly above and to the right of player)
      this.offsetX = 40;
      this.offsetY = -40;
      
      // Timer for hover effect
      this.hoverOffset = 0;
  }
  
  update(playerX, playerY) {
      // Calculate target position (offset from player)
      const targetX = playerX + this.offsetX;
      
      // Simple sine wave hover with slower period
      this.hoverOffset += 0.01;
      const hoverY = Math.sin(this.hoverOffset) * 10;
      const targetY = playerY + this.offsetY + hoverY;
      
      // Smoothly move towards target position
      this.x = Phaser.Math.Linear(this.x, targetX, this.followSpeed);
      this.y = Phaser.Math.Linear(this.y, targetY, this.followSpeed);
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
      const reaction = this.scene.add.text(this.x, this.y - 60, symbol, {
          font: '48px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Animate and remove
      this.scene.tweens.add({
          targets: reaction,
          y: this.y - 100,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
              reaction.destroy();
          }
      });
  }
}