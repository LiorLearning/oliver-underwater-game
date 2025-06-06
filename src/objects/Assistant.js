export class Assistant extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, isGuard = false, guardingTool = null) {
      super(scene, x, y, texture);
      
      // Add assistant to the scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false); // No gravity underwater
      this.setBounce(1); // Bounce off walls
      this.setCollideWorldBounds(true); // Stay within world bounds
      this.body.setImmovable(false); // Can be pushed by player
      
      // Set scale first
      this.setScale(0.5);
      
      // Set a fixed hitbox size instead of a circular one
      this.body.setSize(80, 80);
      this.body.setOffset(30, 30);
      
      this.setDepth(5); // Above background, below player
      
      // Guard properties
      this.isGuard = isGuard;
      this.guardingTool = guardingTool;
      this.guardRadius = 100; // How far from tool the guard will patrol
      this.playerDetectionRadius = 200; // How far the guard can detect the player
      
      // Enemy properties
      this.damage = this.isGuard ? 30 : 20; // Guards do more damage
      this.health = this.isGuard ? 50 : 30; // Guards have more health
      this.isDead = false;
      
      // Movement AI
      this.direction = new Phaser.Math.Vector2(
          Phaser.Math.Between(-1, 1),
          Phaser.Math.Between(-1, 1)
      ).normalize();
      
      // Random direction change
      this.directionChangeTime = 0;
      this.directionChangeCooldown = this.isGuard ? 1500 : Phaser.Math.Between(2000, 5000);
      
      // Stuck detection
      this.stuckCheckInterval = 1000;
      this.lastPosition = new Phaser.Math.Vector2(x, y);
      this.lastPositionTime = 0;
      this.stuckDistance = this.isGuard ? 5 : 10;
      
      // Set tint based on type
      if (this.isGuard) {
        this.setTint(0xff00ff); // Purple tint for guards
      } else {
        this.setTint(0xff0000); // Red tint for regular assistants
      }
      
      // Debug assistant creation
      console.log(`Assistant created at (${x}, ${y}) with fixed body size ${this.body.width}x${this.body.height}, isGuard: ${this.isGuard}`);
  }
  
  update(time) {
      // Debug position occasionally
      if (time % 1000 < 20) {
          console.log(`Assistant at (${Math.round(this.x)}, ${Math.round(this.y)}) with velocity (${Math.round(this.body.velocity.x)}, ${Math.round(this.body.velocity.y)})`);
      }
      
      if (this.isDead) return;
      
      // Special behavior for guards
      if (this.isGuard && this.guardingTool && this.guardingTool.active) {
          this.updateGuardBehavior(time);
      } else {
          // Random direction change for regular assistants
          this.handleDirectionChange(time);
      }
      
      // Check if stuck
      this.checkIfStuck(time);
  }
  
  updateGuardBehavior(time) {
      const scene = this.scene;
      const player = scene.player;
      
      // If player is near the guarded tool, chase the player
      if (player && Phaser.Math.Distance.Between(player.x, player.y, this.guardingTool.x, this.guardingTool.y) < this.playerDetectionRadius) {
          // Chase the player
          const directionToPlayer = new Phaser.Math.Vector2(
              player.x - this.x,
              player.y - this.y
          ).normalize();
          
          this.direction = directionToPlayer;
          
          // Increase speed when chasing
          const chaseSpeed = 80;
          this.body.setVelocity(this.direction.x * chaseSpeed, this.direction.y * chaseSpeed);
      } 
      // If assistant is too far from the tool, move back toward it
      else if (Phaser.Math.Distance.Between(this.x, this.y, this.guardingTool.x, this.guardingTool.y) > this.guardRadius) {
          // Move back toward the tool
          const directionToTool = new Phaser.Math.Vector2(
              this.guardingTool.x - this.x,
              this.guardingTool.y - this.y
          ).normalize();
          
          this.direction = directionToTool;
          
          // Regular patrol speed
          const patrolSpeed = 60;
          this.body.setVelocity(this.direction.x * patrolSpeed, this.direction.y * patrolSpeed);
      }
      // Otherwise continue random patrol around the tool
      else {
          this.handleDirectionChange(time);
          
          // Slower patrol speed
          const patrolSpeed = 40;
          this.body.setVelocity(this.direction.x * patrolSpeed, this.direction.y * patrolSpeed);
      }
  }
  
  handleDirectionChange(time) {
      // Change direction randomly
      if (time > this.directionChangeTime) {
          this.changeDirection();
          this.directionChangeTime = time + this.directionChangeCooldown;
          this.directionChangeCooldown = Phaser.Math.Between(2000, 5000);
          
          // Set velocity based on direction for regular assistants
          const speed = this.isGuard ? 20 : 30; // Guards move slower in patrol mode
          this.body.setVelocity(this.direction.x * speed, this.direction.y * speed);
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
  
  hitPlayer(player, damage = 30) {
      // Do damage to player if alive
      if (!this.isDead && !player.invulnerable) {
          // Apply damage to global health
          window.gameState.health = Math.max(0, window.gameState.health - damage);
          player.health = window.gameState.health;
          
          // Flash red when taking damage
          player.setTint(0xff0000);
          
          // Make player invincible for 5 seconds
          player.invulnerable = true;
          player.invulnerableTime = 5000; // 5 seconds
          
          // Reset invulnerability after 5 seconds
          player.scene.time.delayedCall(5000, () => {
              player.clearTint();
              player.invulnerable = false;
              // Reset the invulnerability time back to original
              player.invulnerableTime = 1000;
          });
          
          // Check if player is defeated
          if (window.gameState.health <= 0) {
              player.die();
          }
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