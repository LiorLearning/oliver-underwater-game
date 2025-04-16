export class Assistant extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add assistant to the scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false); // No gravity underwater
      this.setBounce(1); // Bounce off walls
      this.setCollideWorldBounds(true); // Stay within world bounds
      this.body.setImmovable(false); // Can be pushed by player
      
      // Set scale
      this.setScale(0.5);
      this.setDepth(5); // Above background, below player
      
      // Enemy properties
      this.moveSpeed = 100;
      this.damage = 10;
      this.health = 30;
      this.isDead = false;
      
      // Movement AI
      this.direction = new Phaser.Math.Vector2(
          Phaser.Math.Between(-1, 1),
          Phaser.Math.Between(-1, 1)
      ).normalize();
      
      // Random direction change
      this.directionChangeTime = 0;
      this.directionChangeCooldown = Phaser.Math.Between(2000, 5000);
      
      // Stuck detection
      this.stuckCheckInterval = 1000;
      this.lastPosition = new Phaser.Math.Vector2(x, y);
      this.lastPositionTime = 0;
      this.stuckDistance = 10;
      
      // Set tint to make them look more threatening
      this.setTint(0xff0000);
  }
  
  update(time) {
      if (this.isDead) return;
      
      // Move in current direction
      this.moveInDirection();
      
      // Random direction change
      this.handleDirectionChange(time);
      
      // Check if stuck
      this.checkIfStuck(time);
  }
  
  moveInDirection() {
      // Move based on current direction
      const velocity = this.direction.clone().scale(this.moveSpeed);
      this.body.setVelocity(velocity.x, velocity.y);
      
      // Flip sprite based on movement
      if (velocity.x < 0) {
          this.setFlipX(true);
      } else if (velocity.x > 0) {
          this.setFlipX(false);
      }
  }
  
  handleDirectionChange(time) {
      // Change direction randomly
      if (time > this.directionChangeTime) {
          this.changeDirection();
          this.directionChangeTime = time + this.directionChangeCooldown;
          this.directionChangeCooldown = Phaser.Math.Between(2000, 5000);
      }
  }
  
  changeDirection() {
      // Get a new random direction
      this.direction = new Phaser.Math.Vector2(
          Phaser.Math.Between(-10, 10) / 10,
          Phaser.Math.Between(-10, 10) / 10
      ).normalize();
  }
  
  checkIfStuck(time) {
      // Check if assistant is stuck (not moving)
      if (time > this.lastPositionTime + this.stuckCheckInterval) {
          const distance = Phaser.Math.Distance.Between(
              this.x, this.y, 
              this.lastPosition.x, this.lastPosition.y
          );
          
          // If barely moved, change direction
          if (distance < this.stuckDistance) {
              this.changeDirection();
          }
          
          // Update last position
          this.lastPosition.set(this.x, this.y);
          this.lastPositionTime = time;
      }
  }
  
  hitPlayer(player) {
      // Do damage to player if alive
      if (!this.isDead) {
          player.takeDamage(this.damage);
      }
  }
  
  takeDamage(amount = 10) {
      // Reduce health
      this.health -= amount;
      
      // Flash red
      this.setTint(0xff0000);
      this.scene.time.delayedCall(200, () => {
          this.clearTint();
      });
      
      // Check if health depleted
      if (this.health <= 0 && !this.isDead) {
          this.die();
      }
  }
  
  die() {
      this.isDead = true;
      
      // Death animation
      this.scene.tweens.add({
          targets: this,
          alpha: 0,
          angle: this.angle + 540,
          scale: 0.1,
          duration: 800,
          ease: 'Back.easeIn',
          onComplete: () => {
              this.destroy();
          }
      });
      
      // Create particles for death effect
      const particles = this.scene.add.particles(this.x, this.y, 'particle', {
          speed: { min: 50, max: 200 },
          scale: { start: 0.5, end: 0 },
          lifespan: 800,
          blendMode: 'ADD',
          quantity: 20
      });
      
      // Auto-destroy particles after they're done
      this.scene.time.delayedCall(800, () => {
          particles.destroy();
      });
  }
}