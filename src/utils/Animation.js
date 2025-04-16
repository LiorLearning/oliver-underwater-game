// Animation utility class
class AnimationHelper {
  constructor(scene) {
      this.scene = scene;
  }
  
  // Create a floating animation for an object
  createFloatingAnimation(target, options = {}) {
      const config = {
          y: 10,          // Floating height
          duration: 1500, // Animation duration
          ease: 'Sine.easeInOut',
          ...options
      };
      
      return this.scene.tweens.add({
          targets: target,
          y: target.y + config.y,
          duration: config.duration,
          yoyo: true,
          repeat: -1,
          ease: config.ease
      });
  }
  
  // Create a slow rotation animation
  createRotationAnimation(target, options = {}) {
      const config = {
          angle: 360,     // Full rotation
          duration: 6000, // Animation duration
          ease: 'Linear',
          ...options
      };
      
      return this.scene.tweens.add({
          targets: target,
          angle: config.angle,
          duration: config.duration,
          repeat: -1,
          ease: config.ease
      });
  }
  
  // Create a pulse animation (scale up and down)
  createPulseAnimation(target, options = {}) {
      const config = {
          scale: 1.2,     // Scale factor
          duration: 800,  // Animation duration
          ease: 'Sine.easeInOut',
          ...options
      };
      
      // Store original scale
      const originalScaleX = target.scaleX || 1;
      const originalScaleY = target.scaleY || 1;
      
      return this.scene.tweens.add({
          targets: target,
          scaleX: originalScaleX * config.scale,
          scaleY: originalScaleY * config.scale,
          duration: config.duration,
          yoyo: true,
          repeat: -1,
          ease: config.ease
      });
  }
  
  // Create a fade-in animation
  createFadeInAnimation(target, options = {}) {
      const config = {
          alpha: 1,       // Target alpha
          duration: 500,  // Animation duration
          ease: 'Linear',
          ...options
      };
      
      // Set initial alpha
      target.alpha = 0;
      
      return this.scene.tweens.add({
          targets: target,
          alpha: config.alpha,
          duration: config.duration,
          ease: config.ease
      });
  }
  
  // Create a fade-out animation
  createFadeOutAnimation(target, options = {}) {
      const config = {
          alpha: 0,       // Target alpha
          duration: 500,  // Animation duration
          ease: 'Linear',
          ...options
      };
      
      return this.scene.tweens.add({
          targets: target,
          alpha: config.alpha,
          duration: config.duration,
          ease: config.ease,
          onComplete: () => {
              if (config.destroy) {
                  target.destroy();
              }
          }
      });
  }
  
  // Create a movement animation from one point to another
  createMoveAnimation(target, destX, destY, options = {}) {
      const config = {
          duration: 1000,  // Animation duration
          ease: 'Power2',
          ...options
      };
      
      return this.scene.tweens.add({
          targets: target,
          x: destX,
          y: destY,
          duration: config.duration,
          ease: config.ease
      });
  }
  
  // Create a shake animation (useful for damage effects)
  createShakeAnimation(target, options = {}) {
      const config = {
          intensity: 5,    // Shake intensity
          duration: 500,   // Animation duration
          ...options
      };
      
      // Store original position
      const originalX = target.x;
      const originalY = target.y;
      
      // Shake effect
      const timeline = this.scene.tweens.createTimeline();
      
      for (let i = 0; i < 5; i++) {
          timeline.add({
              targets: target,
              x: originalX + Phaser.Math.Between(-config.intensity, config.intensity),
              y: originalY + Phaser.Math.Between(-config.intensity, config.intensity),
              duration: config.duration / 10,
              ease: 'Power1'
          });
      }
      
      // Return to original position
      timeline.add({
          targets: target,
          x: originalX,
          y: originalY,
          duration: config.duration / 10,
          ease: 'Power1'
      });
      
      timeline.play();
      return timeline;
  }
  
  // Create a collection animation (for collectibles)
  createCollectionAnimation(target, options = {}) {
      const config = {
          scale: 0,        // Final scale
          alpha: 0,        // Final alpha
          duration: 500,   // Animation duration
          ease: 'Back.easeIn',
          particles: true, // Whether to show particles
          ...options
      };
      
      // Create collect animation
      const tween = this.scene.tweens.add({
          targets: target,
          scale: config.scale,
          alpha: config.alpha,
          duration: config.duration,
          ease: config.ease,
          onComplete: () => {
              if (config.particles) {
                  this.createCollectionParticles(target);
              }
              
              if (config.destroy) {
                  target.destroy();
              }
          }
      });
      
      return tween;
  }
  
  // Create particles for collection effect
  createCollectionParticles(target, options = {}) {
      const config = {
          texture: target.texture.key,
          count: 15,       // Particle count
          speed: { min: 50, max: 150 },
          scale: { start: 0.1, end: 0 },
          lifespan: 800,   // Particle lifetime
          ...options
      };
      
      // Create particles
      const particles = this.scene.add.particles(config.texture);
      
      particles.createEmitter({
          x: target.x,
          y: target.y,
          speed: config.speed,
          scale: config.scale,
          alpha: { start: 1, end: 0 },
          lifespan: config.lifespan,
          quantity: config.count,
          blendMode: Phaser.BlendModes.ADD
      });
      
      // Remove particles after they complete
      this.scene.time.delayedCall(config.lifespan + 100, () => {
          particles.destroy();
      });
      
      return particles;
  }
}