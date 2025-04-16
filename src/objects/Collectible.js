export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type = 'coin') {
      super(scene, x, y, texture);
      
      // Add collectible to scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(0.4);
      
      // Collectible type (coin or tool)
      this.type = type;
      
      // Configure based on type
      this.configureByType();
      
      // Add rotation animation
      this.createRotationAnimation();
      
      // Add hover animation
      this.createHoverAnimation();
      
      // Add collectible ID
      this.id = Phaser.Math.Between(1, 1000);
  }
  
  configureByType() {
      // Different properties based on type
      if (this.type === 'coin') {
          // Coins are smaller and gold
          this.setScale(0.3);
          this.setTint(0xffd700);
          this.value = 10;
      } else {
          // Tools are larger
          this.setScale(0.5);
          
          // Different tints based on tool type
          const toolColors = {
              'wrench': 0xaaaaaa,
              'hammer': 0xaa5555,
              'screwdriver': 0x5555aa
          };
          
          if (toolColors[this.type]) {
              this.setTint(toolColors[this.type]);
          }
      }
  }
  
  createRotationAnimation() {
      // Add constant rotation
      this.scene.tweens.add({
          targets: this,
          angle: 360,
          duration: 3000,
          repeat: -1,
          ease: 'Linear'
      });
  }
  
  createHoverAnimation() {
      // Add floating animation
      this.scene.tweens.add({
          targets: this,
          y: this.y + 8,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  collect() {
      // Store scene reference before destroying
      const scene = this.scene;
      
      // Collection animation
      this.scene.tweens.add({
          targets: this,
          scale: 0,
          alpha: 0,
          angle: this.angle + 720, // Double rotation on collect
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
              // Remove from scene
              this.destroy();
          }
      });
      
      // Add sparkle effect
      this.createCollectEffect();
      
      // If this is a coin, increase score
      if (this.type === 'coin') {
          window.gameState.score += this.value;
      } 
      // If this is a tool, add to collected tools
      else {
          window.gameState.collectedTools = window.gameState.collectedTools || [];
          window.gameState.collectedTools.push(this.type);
      }
  }
  
  createCollectEffect() {
      // Create particles for collection effect
      const particles = this.scene.add.particles(this.x, this.y, 'particle', {
          speed: { min: 50, max: 200 },
          scale: { start: 0.2, end: 0 },
          lifespan: 800,
          blendMode: 'ADD',
          quantity: 10
      });
      
      // Auto-destroy particles after they're done
      this.scene.time.delayedCall(800, () => {
          particles.destroy();
      });
  }
  
  getDescription() {
      // Return a description based on type
      if (this.type === 'coin') {
          return "A shiny coin worth " + this.value + " points";
      } else {
          const descriptions = {
              'wrench': "A sturdy wrench for loosening bolts",
              'hammer': "A heavy hammer for construction",
              'screwdriver': "A precision screwdriver for detailed work"
          };
          
          return descriptions[this.type] || "A mysterious tool";
      }
  }
}