class Boss extends Phaser.Physics.Arcade.Sprite {
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
      this.health = 3;
      this.phase = 1;
      this.attackCooldown = false;
      
      // Create movement pattern
      this.createMovementPattern();
      
      // Glow effect
      this.createGlowEffect();
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
  
  takeDamage() {
      // Reduce health
      this.health--;
      
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
      
      // Update phase based on health
      if (this.health > 0) {
          this.phase = 4 - this.health; // Phase 2 at 2 health, Phase 3 at 1 health
          this.createMovementPattern();
      } else {
          this.defeat();
      }
  }
  
  defeat() {
      // Stop all movement
      if (this.moveTween) this.moveTween.stop();
      if (this.floatTween) this.floatTween.stop();
      if (this.pathTween) this.pathTween.stop();
      
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
  
  attack() {
      // Different attack patterns based on phase
      switch (this.phase) {
          case 1:
              this.basicAttack();
              break;
          case 2:
              this.projectileAttack();
              break;
          case 3:
              this.areaAttack();
              break;
      }
  }
  
  basicAttack() {
      // Simple direct attack (for v0, just visual effect)
      const attackEffect = this.scene.add.sprite(this.x, this.y, 'villain')
          .setScale(0.2)
          .setTint(0xff0000)
          .setAlpha(0.7);
          
      // Animate toward player
      const player = this.scene.player;
      
      if (player) {
          this.scene.tweens.add({
              targets: attackEffect,
              x: player.x,
              y: player.y,
              scale: 0.1,
              alpha: 0,
              duration: 500,
              ease: 'Power1',
              onComplete: () => {
                  attackEffect.destroy();
              }
          });
      }
  }
  
  projectileAttack() {
      // Fire multiple projectiles (for v0, just visual effects)
      for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const xOffset = Math.cos(angle) * 50;
          const yOffset = Math.sin(angle) * 50;
          
          const projectile = this.scene.add.circle(
              this.x + xOffset,
              this.y + yOffset,
              10,
              0xff0000,
              1
          );
          
          // Animate outward
          this.scene.tweens.add({
              targets: projectile,
              x: this.x + xOffset * 10,
              y: this.y + yOffset * 10,
              alpha: 0,
              duration: 1000,
              ease: 'Linear',
              onComplete: () => {
                  projectile.destroy();
              }
          });
      }
  }
  
  areaAttack() {
      // Area effect attack (for v0, just visual effect)
      const areaEffect = this.scene.add.circle(this.x, this.y, 20, 0xff0000, 0.7);
      
      // Expand and fade
      this.scene.tweens.add({
          targets: areaEffect,
          radius: 200,
          alpha: 0,
          duration: 1000,
          ease: 'Linear',
          onUpdate: () => {
              // Need to redraw the circle as it expands
              areaEffect.setRadius(areaEffect.radius);
          },
          onComplete: () => {
              areaEffect.destroy();
          }
      });
  }
}