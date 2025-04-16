// Import the BossBullet class
import { BossBullet } from './BossBullet.js';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add boss to scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(0.4);
      
      // Boss properties
      this.health = 100; // New health value
      this.phase = 1;
      this.attackCooldown = false;
      
      // Bullet properties
      this.bullets = scene.physics.add.group({ classType: BossBullet });
      this.lastBulletTime = 0;
      this.bulletCooldown = 3000; // Time between bullet patterns in ms
      
      // Create movement pattern
      this.createMovementPattern();
      
      // Glow effect
      this.createGlowEffect();
      
      // Start bullet timer
      this.bulletTimer = scene.time.addEvent({
          delay: this.bulletCooldown,
          callback: this.firePattern,
          callbackScope: this,
          loop: true
      });
  }
  
  createMovementPattern() {
      // Create a movement pattern based on current phase
      switch (this.phase) {
          case 1:
              this.patternPhaseOne();
              break;
          case 2:
              this.patternPhaseTwo();
              break;
          case 3:
              this.patternPhaseThree();
              break;
      }
  }
  
  patternPhaseOne() {
      // Phase 1: Simple side-to-side movement
      this.moveTween = this.scene.tweens.add({
          targets: this,
          x: this.x + 200,
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
      
      // Slight up and down movement
      this.floatTween = this.scene.tweens.add({
          targets: this,
          y: this.y + 50,
          duration: 5000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  patternPhaseTwo() {
      // Phase 2: Circular movement
      // Stop previous tweens
      if (this.moveTween) this.moveTween.stop();
      if (this.floatTween) this.floatTween.stop();
      
      // Create path for circular movement
      const path = new Phaser.Curves.Path(this.x, this.y);
      path.ellipseTo(150, 100, 0, 360, false);
      
      // Follow path
      this.pathTween = this.scene.tweens.add({
          targets: this,
          z: 1, // Dummy property to track progress
          duration: 5000,
          repeat: -1,
          ease: 'Linear',
          onUpdate: (tween) => {
              const point = path.getPoint(tween.progress);
              this.x = point.x;
              this.y = point.y;
          }
      });
  }
  
  patternPhaseThree() {
      // Phase 3: Aggressive movement toward player
      // Stop previous tweens
      if (this.moveTween) this.moveTween.stop();
      if (this.floatTween) this.floatTween.stop();
      if (this.pathTween) this.pathTween.stop();
      
      // Erratic movement
      this.scene.time.addEvent({
          delay: 2000,
          callback: this.moveTowardPlayer,
          callbackScope: this,
          loop: true
      });
  }
  
  moveTowardPlayer() {
      // Get player reference
      const player = this.scene.player;
      
      if (player && !this.attackCooldown) {
          // Set attack cooldown
          this.attackCooldown = true;
          
          // Move toward player
          this.scene.tweens.add({
              targets: this,
              x: player.x,
              y: player.y,
              duration: 1500,
              ease: 'Power2',
              onComplete: () => {
                  // Return to center
                  this.scene.tweens.add({
                      targets: this,
                      x: 600,
                      y: 300,
                      duration: 2000,
                      ease: 'Sine.easeInOut',
                      onComplete: () => {
                          // Reset cooldown
                          this.attackCooldown = false;
                      }
                  });
              }
          });
      }
  }
  
  createGlowEffect() {
      // Add a menacing glow effect
      const glow = this.scene.add.sprite(this.x, this.y, 'villain')
          .setScale(this.scale * 1.1)
          .setAlpha(0.3)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(0xff0000);
          
      // Link the glow effect to the boss
      this.on('destroy', () => {
          glow.destroy();
      });
      
      // Update glow position
      this.scene.events.on('update', () => {
          glow.setPosition(this.x, this.y);
      });
  }
  
  takeDamage(damage) {
      // Calculate damage (default to 10 if not specified)
      const damageAmount = damage || 10;
      
      // Reduce health
      this.health -= damageAmount;
      
      // Visual feedback
      this.setTint(0xff0000);
      this.scene.tweens.add({
          targets: this,
          alpha: 0.7,
          duration: 100,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
              this.clearTint();
              this.setAlpha(1);
          }
      });
      
      // Update phase based on health percentage
      const healthPercent = this.health / 100;
      
      if (healthPercent <= 0.3) {
          this.phase = 3;
          this.bulletCooldown = 1500; // Faster bullets in phase 3
          this.updatePhase();
      } else if (healthPercent <= 0.6) {
          this.phase = 2;
          this.bulletCooldown = 2000; // Faster bullets in phase 2
          this.updatePhase();
      }
      
      // Check if boss is defeated
      if (this.health <= 0) {
          this.defeat();
      }
  }
  
  updatePhase() {
      // Update bullet timer
      if (this.bulletTimer) {
          this.bulletTimer.remove();
      }
      
      // Create new timer with updated cooldown
      this.bulletTimer = this.scene.time.addEvent({
          delay: this.bulletCooldown,
          callback: this.firePattern,
          callbackScope: this,
          loop: true
      });
      
      // Update movement pattern
      this.createMovementPattern();
  }
  
  defeat() {
      // Stop all movement
      if (this.moveTween) this.moveTween.stop();
      if (this.floatTween) this.floatTween.stop();
      if (this.pathTween) this.pathTween.stop();
      
      // Stop bullet timer
      if (this.bulletTimer) {
          this.bulletTimer.remove();
      }
      
      // Defeat animation
      this.scene.tweens.add({
          targets: this,
          alpha: 0,
          scale: 1.5,
          rotation: 2 * Math.PI,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => {
              this.createDefeatEffect();
              this.destroy();
          }
      });
  }
  
  createDefeatEffect() {
      // Create explosion effect
      const particles = this.scene.add.particles('villain');
      
      particles.createEmitter({
          x: this.x,
          y: this.y,
          speed: { min: 100, max: 200 },
          scale: { start: 0.1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 1500,
          quantity: 30,
          blendMode: Phaser.BlendModes.ADD
      });
      
      // Remove particles after they complete
      this.scene.time.delayedCall(2000, () => {
          particles.destroy();
      });
  }
  
  firePattern() {
      // Choose firing pattern based on current phase
      switch (this.phase) {
          case 1:
              this.fireCirclePattern(8); // 8 bullets in a circle
              break;
          case 2:
              this.fireCirclePattern(12); // 12 bullets in a circle
              break;
          case 3:
              this.fireCirclePattern(16); // 16 bullets in a circle
              
              // Also fire spiral pattern in phase 3
              this.scene.time.delayedCall(1000, () => {
                  this.fireSpiralPattern(8);
              });
              break;
      }
  }
  
  fireCirclePattern(bulletCount) {
      // Fire bullets in a circle pattern
      const angleStep = (Math.PI * 2) / bulletCount;
      const speed = 150;
      
      for (let i = 0; i < bulletCount; i++) {
          const angle = i * angleStep;
          
          // Calculate velocity based on angle
          const velocityX = Math.cos(angle) * speed;
          const velocityY = Math.sin(angle) * speed;
          
          // Create bullet
          if (!this.scene.textures.exists('bossBullet')) {
              // If bullet texture doesn't exist, create a temporary circle
              const bullet = new BossBullet(this.scene, this.x, this.y, { x: velocityX, y: velocityY });
              bullet.setTexture('villain'); // Use villain texture temporarily
          } else {
              // Use proper bullet texture
              const bullet = new BossBullet(this.scene, this.x, this.y, { x: velocityX, y: velocityY });
          }
      }
  }
  
  fireSpiralPattern(bulletCount) {
      // Fire bullets in a spiral pattern
      const angleStep = (Math.PI * 2) / bulletCount;
      const speed = 150;
      
      for (let i = 0; i < bulletCount; i++) {
          // Delayed firing for spiral effect
          this.scene.time.delayedCall(i * 100, () => {
              if (!this.active) return; // Skip if boss is destroyed
              
              const angle = i * angleStep;
              
              // Calculate velocity based on angle
              const velocityX = Math.cos(angle) * speed;
              const velocityY = Math.sin(angle) * speed;
              
              // Create bullet
              if (!this.scene.textures.exists('bossBullet')) {
                  // If bullet texture doesn't exist, create a temporary circle
                  const bullet = new BossBullet(this.scene, this.x, this.y, { x: velocityX, y: velocityY });
                  bullet.setTexture('villain'); // Use villain texture temporarily
              } else {
                  // Use proper bullet texture
                  const bullet = new BossBullet(this.scene, this.x, this.y, { x: velocityX, y: velocityY });
              }
          });
      }
  }
  
  update() {
      // Update all bullets
      this.bullets.getChildren().forEach(bullet => {
          bullet.update();
      });
  }
}