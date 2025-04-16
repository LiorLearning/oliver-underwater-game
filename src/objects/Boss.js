// Import the BossBullet class
import { BossBullet } from './BossBullet.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add to scene and physics
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(1.2);
      
      // Boss stats
      this.health = 100;
      this.maxHealth = 100;
      
      // Attack properties
      this.attackCooldown = false;
      this.attackInterval = 2000; // ms
      this.bulletSpeed = 300;
      this.bulletDamage = 10;
      
      // Create bullet group
      this.bullets = scene.physics.add.group();
      
      // Tint to make more menacing
      this.setTint(0xff0000);
      
      // Add hover animation
      this.createHoverAnimation();
      
      // Add attack pattern
      this.attackPatterns = [
          this.shootProjectile.bind(this),
          this.shootSpreadProjectiles.bind(this),
          this.chargeDash.bind(this)
      ];
      
      // Create boss shield
      this.createShield();
  }
  
  update() {
      // Update shield rotation
      if (this.shield) {
          this.shield.rotation += 0.01;
      }
  }
  
  createHoverAnimation() {
      // Add floating animation
      this.scene.tweens.add({
          targets: this,
          y: this.y + 30,
          duration: 2500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  createShield() {
      // Create shield visual (only active until damage is taken)
      this.shield = this.scene.add.graphics();
      this.shield.lineStyle(5, 0x00ffff, 0.8);
      this.shield.strokeCircle(0, 0, 90);
      this.shield.x = this.x;
      this.shield.y = this.y;
      
      // Update shield position
      this.scene.events.on('update', () => {
          if (this.shield && this.active) {
              this.shield.x = this.x;
              this.shield.y = this.y;
          }
      });
  }
  
  takeDamage(amount) {
      // Flash effect
      this.setTint(0xffffff);
      this.scene.time.delayedCall(100, () => {
          this.setTint(0xff0000);
      });
      
      // Reduce health
      this.health -= amount;
      
      // Remove shield on first hit
      if (this.shield && this.health < this.maxHealth) {
          // Animate shield breaking
          this.scene.tweens.add({
              targets: this.shield,
              alpha: 0,
              scale: 1.5,
              duration: 300,
              onComplete: () => {
                  this.shield.destroy();
                  this.shield = null;
              }
          });
      }
      
      // Check if defeated
      if (this.health <= 0) {
          this.die();
      }
  }
  
  die() {
      // Stop any ongoing attacks
      this.attackCooldown = true;
      
      // Explode animation
      for (let i = 0; i < 20; i++) {
          // Create particle
          const particle = this.scene.add.circle(
              this.x + Phaser.Math.Between(-50, 50),
              this.y + Phaser.Math.Between(-50, 50),
              Phaser.Math.Between(5, 15),
              0xff0000
          );
          
          // Animate particle
      this.scene.tweens.add({
              targets: particle,
              x: particle.x + Phaser.Math.Between(-200, 200),
              y: particle.y + Phaser.Math.Between(-200, 200),
              alpha: 0,
              scale: 0,
              duration: Phaser.Math.Between(500, 1500),
          onComplete: () => {
                  particle.destroy();
              }
          });
      }
      
      // Flash screen
      this.scene.cameras.main.flash(1000, 255, 255, 255);
      
      // Destroy boss
      this.destroy();
  }
  
  attack(player) {
      // Choose random attack pattern
      if (!this.attackCooldown && player && player.active) {
          // Set cooldown flag
          this.attackCooldown = true;
          
          // Choose random attack
          const attackIndex = Phaser.Math.Between(0, this.attackPatterns.length - 1);
          this.attackPatterns[attackIndex](player);
          
          // Reset cooldown
          this.scene.time.delayedCall(this.attackInterval, () => {
              this.attackCooldown = false;
          });
      }
  }
  
  shootProjectile(player) {
      // Basic single projectile attack
      if (!player || !player.active) return;
      
      // Create bullet
      const bullet = this.createBullet(this.x, this.y);
      
      // Calculate angle to player
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      
      // Set velocity
      bullet.body.velocity.x = Math.cos(angle) * this.bulletSpeed;
      bullet.body.velocity.y = Math.sin(angle) * this.bulletSpeed;
      
      // Set damage property
      bullet.damage = this.bulletDamage;
      
      // Auto destroy bullet after 3 seconds
      this.scene.time.delayedCall(3000, () => {
          if (bullet.active) {
              bullet.destroy();
          }
      });
  }
  
  shootSpreadProjectiles(player) {
      // Shoot multiple bullets in a spread pattern
      if (!player || !player.active) return;
      
      // Base angle toward player
      const centerAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      
      // Create multiple bullets in a spread
      for (let i = -2; i <= 2; i++) {
          // Calculate spread angle
          const angle = centerAngle + (i * Math.PI / 10);
          
          // Create bullet
          const bullet = this.createBullet(this.x, this.y);
          
          // Set velocity
          bullet.body.velocity.x = Math.cos(angle) * this.bulletSpeed;
          bullet.body.velocity.y = Math.sin(angle) * this.bulletSpeed;
          
          // Set damage property
          bullet.damage = this.bulletDamage;
          
          // Auto destroy bullet after 3 seconds
          this.scene.time.delayedCall(3000, () => {
              if (bullet.active) {
                  bullet.destroy();
              }
          });
      }
  }
  
  chargeDash(player) {
      // Charge toward player
      if (!player || !player.active) return;
      
      // Flash before charging
      this.setTint(0xffff00);
      
      // Charge preparation
      this.scene.tweens.add({
          targets: this,
          scaleX: 1.5,
          scaleY: 0.8,
          duration: 500,
          onComplete: () => {
              // Reset tint
              this.setTint(0xff0000);
              
              // Get angle to player
              const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
              
              // Charge toward player
              this.scene.tweens.add({
                  targets: this,
                  x: this.x + Math.cos(angle) * 400,
                  y: this.y + Math.sin(angle) * 400,
                  scaleX: 1.2,
                  scaleY: 1.2,
                  duration: 500,
                  ease: 'Power2',
                  onComplete: () => {
                      // Reset scale
                      this.setScale(1.2);
              }
          });
      }
      });
  }
  
  createBullet(x, y) {
      // Create bullet object
      const bullet = this.scene.add.circle(x, y, 10, 0xff0000);
      
      // Add to physics
      this.bullets.add(bullet);
      this.scene.bullets.add(bullet);
      bullet.body.setCircle(10);
      
      // Add glow effect
      const glow = this.scene.add.circle(x, y, 15, 0xff0000, 0.3);
      
      // Make glow follow bullet
      this.scene.events.on('update', () => {
          if (bullet.active) {
              glow.x = bullet.x;
              glow.y = bullet.y;
          } else {
              glow.destroy();
          }
      });
      
      return bullet;
  }
}