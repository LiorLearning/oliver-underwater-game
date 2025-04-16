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
      this.setScale(0.3);
      
      // State tracking
      this.hasInteracted = false;
      this.isHelping = false;
      
      // Hover animation
      this.createHoverAnimation();
      
      // Interaction indicator
      this.createInteractionIndicator();
  }
  
  update() {
      // Update interaction indicator position
      if (this.interactionIndicator) {
          this.interactionIndicator.setPosition(this.x, this.y - 80);
      }
  }
  
  createHoverAnimation() {
      // Create a simple hovering animation
      this.scene.tweens.add({
          targets: this,
          y: this.y + 20,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  createInteractionIndicator() {
      // Create an indicator showing the assistant can be interacted with
      this.interactionIndicator = this.scene.add.text(this.x, this.y - 80, '?', {
          font: '40px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add a simple pulsing animation
      this.scene.tweens.add({
          targets: this.interactionIndicator,
          scale: 1.2,
          duration: 1500,
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
      
      // Return to player after a delay
      this.scene.time.delayedCall(5000, () => {
          this.followPlayer();
      });
  }
  
  followPlayer() {
      // Once interacted, begin following the player
      if (!this.isHelping) {
          this.isHelping = true;
          
          // Get player reference
          const player = this.scene.player;
          
          // Start following animation with longer duration
          this.followTween = this.scene.tweens.add({
              targets: this,
              x: player.x + Phaser.Math.Between(-200, 200),
              y: player.y + Phaser.Math.Between(-200, 200),
              duration: 3000,
              ease: 'Sine.easeInOut',
              onComplete: () => {
                  // Continue following at random offsets with longer delay
                  if (this.isHelping && player) {
                      this.scene.time.delayedCall(2000, () => {
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
      const bubble = this.scene.add.rectangle(this.x, this.y - 100, hint.length * 14 + 40, 80, 0xffffff, 1)
          .setOrigin(0.5);
          
      const text = this.scene.add.text(this.x, this.y - 100, hint, {
          font: '28px Arial',
          fill: '#000000'
      }).setOrigin(0.5);
      
      // Remove after delay
      this.scene.time.delayedCall(3000, () => {
          bubble.destroy();
          text.destroy();
      });
  }
}