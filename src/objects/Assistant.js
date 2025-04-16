export class Assistant extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add assistant to the scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(0.15);
      
      // State tracking
      this.hasInteracted = false;
      this.isHelping = false;
      
      // Hover animation
      this.createHoverAnimation();
      
      // Glow effect
      this.createGlowEffect();
      
      // Interaction indicator
      this.createInteractionIndicator();
  }
  
  update() {
      // Update interaction indicator position
      if (this.interactionIndicator) {
          this.interactionIndicator.setPosition(this.x, this.y - 40);
      }
  }
  
  createHoverAnimation() {
      // Create a subtle hovering animation
      this.scene.tweens.add({
          targets: this,
          y: this.y + 20,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  createGlowEffect() {
      // Add a subtle glow effect
      const glow = this.scene.add.sprite(this.x, this.y, 'assistant')
          .setScale(this.scale * 1.2)
          .setAlpha(0.3)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0x00ffff);
          
      // Link the glow effect to the assistant
      this.on('destroy', () => {
          glow.destroy();
      });
      
      // Update glow position
      this.scene.events.on('update', () => {
          glow.setPosition(this.x, this.y);
      });
  }
  
  createInteractionIndicator() {
      // Create an indicator showing the assistant can be interacted with
      this.interactionIndicator = this.scene.add.text(this.x, this.y - 40, '?', {
          font: '20px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add a pulsing animation
      this.scene.tweens.add({
          targets: this.interactionIndicator,
          scale: 1.2,
          duration: 800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  interact() {
      // Mark as interacted
      this.hasInteracted = true;
      
      // Remove interaction indicator
      if (this.interactionIndicator) {
          this.interactionIndicator.destroy();
          this.interactionIndicator = null;
      }
      
      // Play interaction animation
      this.scene.tweens.add({
          targets: this,
          scale: this.scale * 1.3,
          duration: 200,
          yoyo: true,
          repeat: 1,
          ease: 'Sine.easeInOut'
      });
      
      // Show particles
      this.createInteractionParticles();
      
      // Return to player after a delay
      this.scene.time.delayedCall(5000, () => {
          this.followPlayer();
      });
  }
  
  createInteractionParticles() {
      // Create particles when interacting
      const particles = this.scene.add.particles('assistant');
      
      particles.createEmitter({
          x: this.x,
          y: this.y,
          speed: { min: 50, max: 100 },
          scale: { start: 0.05, end: 0.01 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 1000,
          quantity: 10,
          blendMode: Phaser.BlendModes.ADD
      });
      
      // Remove particles after they complete
      this.scene.time.delayedCall(1000, () => {
          particles.destroy();
      });
  }
  
  followPlayer() {
      // Once interacted, begin following the player
      if (!this.isHelping) {
          this.isHelping = true;
          
          // Get player reference
          const player = this.scene.player;
          
          // Start following animation
          this.followTween = this.scene.tweens.add({
              targets: this,
              x: player.x + Phaser.Math.Between(-100, 100),
              y: player.y + Phaser.Math.Between(-100, 100),
              duration: 2000,
              ease: 'Sine.easeInOut',
              onComplete: () => {
                  // Continue following at random offsets
                  if (this.isHelping && player) {
                      this.scene.time.delayedCall(1000, () => {
                          this.followPlayer();
                      });
                  }
              }
          });
      }
  }
  
  provideHint() {
      // Display a hint bubble
      const hints = [
          "Remember to solve all puzzles!",
          "Collect items to power your ship!",
          "Use math to overcome obstacles!"
      ];
      
      const hint = Phaser.Utils.Array.GetRandom(hints);
      
      // Create hint bubble
      const bubble = this.scene.add.rectangle(this.x, this.y - 50, hint.length * 7 + 20, 40, 0xffffff, 1)
          .setOrigin(0.5);
          
      const text = this.scene.add.text(this.x, this.y - 50, hint, {
          font: '14px Arial',
          fill: '#000000'
      }).setOrigin(0.5);
      
      // Remove after delay
      this.scene.time.delayedCall(3000, () => {
          bubble.destroy();
          text.destroy();
      });
  }
}