class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add player to the scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set up physics properties
      this.body.setAllowGravity(false); // No gravity underwater
      this.setCollideWorldBounds(true); // Prevent going off-screen
      this.setDamping(true); // Simulate water resistance
      this.setDrag(0.9); // Water resistance value
      
      // Set scale
      this.setScale(0.3);
      
      // Movement properties
      this.moveSpeed = 200;
      this.diagonalFactor = 0.7071; // 1/sqrt(2)
      
      // Control inputs
      this.cursors = scene.input.keyboard.createCursorKeys();
      
      // Bubble trail particles
      this.createBubbleTrail(scene);
  }
  
  update() {
      // Movement logic
      this.handleMovement();
      
      // Emit bubble particles based on velocity
      this.updateBubbleEmitter();
  }
  
  handleMovement() {
      // Reset velocity
      this.body.setVelocity(0);
      
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
      
      // Apply velocity
      this.body.setVelocity(vx, vy);
  }
  
  createBubbleTrail(scene) {
      // Create bubble emitter for underwater effect
      this.bubbleEmitter = scene.add.particles('sidekick').createEmitter({
          speed: { min: 10, max: 30 },
          scale: { start: 0.05, end: 0.01 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 2000,
          frequency: 100,
          emitZone: {
              type: 'edge',
              source: new Phaser.Geom.Rectangle(-10, -10, 20, 20),
              quantity: 5
          }
      });
      
      // Initial position
      this.bubbleEmitter.startFollow(this);
  }
  
  updateBubbleEmitter() {
      // Adjust bubble emission rate based on movement
      const speed = Math.sqrt(this.body.velocity.x * this.body.velocity.x + this.body.velocity.y * this.body.velocity.y);
      
      // Only emit bubbles when moving
      if (speed > 10) {
          this.bubbleEmitter.setFrequency(1000 / speed * 5);
          this.bubbleEmitter.resume();
      } else {
          this.bubbleEmitter.pause();
      }
  }
  
  takeDamage() {
      // Flash red when taking damage
      this.setTint(0xff0000);
      
      // Clear tint after a delay
      this.scene.time.delayedCall(500, () => {
          this.clearTint();
      });
  }
}