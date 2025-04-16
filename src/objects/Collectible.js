export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add collectible to scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(0.2);
      
      // Add hover animation
      this.createHoverAnimation();
      
      // Add glow effect
      this.createGlowEffect();
      
      // Add collectible ID
      this.id = Phaser.Math.Between(1, 1000);
      
      // Add item type (random for v0)
      this.itemTypes = ['gear', 'crystal', 'tool', 'part'];
      this.itemType = Phaser.Utils.Array.GetRandom(this.itemTypes);
  }
  
  createHoverAnimation() {
      // Create a subtle floating animation
      this.scene.tweens.add({
          targets: this,
          y: this.y + 10,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
      
      // Add slow rotation
      this.scene.tweens.add({
          targets: this,
          angle: 360,
          duration: 6000,
          repeat: -1,
          ease: 'Linear'
      });
  }
  
  createGlowEffect() {
      // Add a subtle glow effect
      const glow = this.scene.add.sprite(this.x, this.y, 'collectible')
          .setScale(this.scale * 1.3)
          .setAlpha(0.4)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0xffffaa);
          
      // Link the glow effect to the collectible
      this.on('destroy', () => {
          glow.destroy();
      });
      
      // Update glow position
      this.scene.events.on('update', () => {
          glow.setPosition(this.x, this.y);
          glow.angle = this.angle;
      });
  }
  
  collect() {
      // Create collection animation
      this.scene.tweens.add({
          targets: this,
          scale: 0,
          alpha: 0,
          duration: 500,
          ease: 'Back.easeIn',
          onComplete: () => {
              // Create particle effect
              this.createCollectionParticles();
              
              // Remove from scene
              this.destroy();
          }
      });
  }
  
  createCollectionParticles() {
      // Create particles when collected
      const particles = this.scene.add.particles('collectible');
      
      particles.createEmitter({
          x: this.x,
          y: this.y,
          speed: { min: 50, max: 150 },
          scale: { start: 0.1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 800,
          quantity: 15,
          blendMode: Phaser.BlendModes.ADD
      });
      
      // Remove particles after they complete
      this.scene.time.delayedCall(1000, () => {
          particles.destroy();
      });
  }
  
  getDescription() {
      // Return a description of the item based on type
      const descriptions = {
          gear: "A precision gear for ship navigation",
          crystal: "An energy crystal to power ship systems",
          tool: "A specialized tool for ship repairs",
          part: "A critical engine part for the ship"
      };
      
      return descriptions[this.itemType] || "A mysterious ship component";
  }
}