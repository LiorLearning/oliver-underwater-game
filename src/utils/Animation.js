// Animation utility class - Lightweight version
export class AnimationHelper {
  constructor(scene) {
    this.scene = scene;
  }
  
  // Create a slow up and down animation with reduced complexity
  createFloatingAnimation(target, options = {}) {
    const config = {
      y: 10,           // Reduced floating height
      duration: 3000,  // Slower animation for fewer frames
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
//   createRotationAnimation(target, options = {}) {
//       const config = {
//           angle: 360,     // Full rotation
//           duration: 6000, // Animation duration
//           ease: 'Linear',
//           ...options
//       };
      
//       return this.scene.tweens.add({
//           targets: target,
//           angle: config.angle,
//           duration: config.duration,
//           repeat: -1,
//           ease: config.ease
//       });
//   }
  
  // Create a pulse animation (scale up and down)
//   createPulseAnimation(target, options = {}) {
//       const config = {
//           scale: 1.2,     // Scale factor
//           duration: 800,  // Animation duration
//           ease: 'Sine.easeInOut',
//           ...options
//       };
      
//       // Store original scale
//       const originalScaleX = target.scaleX || 1;
//       const originalScaleY = target.scaleY || 1;
      
//       return this.scene.tweens.add({
//           targets: target,
//           scaleX: originalScaleX * config.scale,
//           scaleY: originalScaleY * config.scale,
//           duration: config.duration,
//           yoyo: true,
//           repeat: -1,
//           ease: config.ease
//       });
//   }
  
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
  
//   // Create a shake animation (useful for damage effects)
//   createShakeAnimation(target, options = {}) {
//       const config = {
//           intensity: 5,    // Shake intensity
//           duration: 500,   // Animation duration
//           ...options
//       };
      
//       // Store original position
//       const originalX = target.x;
//       const originalY = target.y;
      
//       // Shake effect
//       const timeline = this.scene.tweens.createTimeline();
      
//       for (let i = 0; i < 5; i++) {
//           timeline.add({
//               targets: target,
//               x: originalX + Phaser.Math.Between(-config.intensity, config.intensity),
//               y: originalY + Phaser.Math.Between(-config.intensity, config.intensity),
//               duration: config.duration / 10,
//               ease: 'Power1'
//           });
//       }
      
//       // Return to original position
//       timeline.add({
//           targets: target,
//           x: originalX,
//           y: originalY,
//           duration: config.duration / 10,
//           ease: 'Power1'
//       });
      
//       timeline.play();
//       return timeline;
//   }
  
  // Create a simplified collection animation (for collectibles)
  createCollectionAnimation(target, options = {}) {
      const config = {
          scale: 0,        // Final scale
          alpha: 0,        // Final alpha
          duration: 300,   // Shorter duration for lightweight animation
          ease: 'Back.easeIn',
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
              if (config.destroy) {
                  target.destroy();
              }
          }
      });
      
      return tween;
  }
  
//   // Create glow effect for collection
//   createCollectionParticles(target, options = {}) {
//       const config = {
//           texture: target.texture.key,
//           scale: { start: 1.5, end: 0 },
//           alpha: { start: 0.8, end: 0 },
//           duration: 500,   // Duration of glow effect
//           tint: 0xffffaa,  // Light yellow glow
//           ...options
//       };
      
//       // Create glow sprite
//       const glow = this.scene.add.sprite(target.x, target.y, config.texture)
//           .setScale(config.scale.start)
//           .setAlpha(config.alpha.start)
//           .setBlendMode(Phaser.BlendModes.ADD)
//           .setTint(config.tint);
      
//       // Animate the glow
//       this.scene.tweens.add({
//           targets: glow,
//           scale: config.scale.end,
//           alpha: config.alpha.end,
//           duration: config.duration,
//           ease: 'Sine.easeOut',
//           onComplete: () => {
//               glow.destroy();
//           }
//       });
      
//       return glow;
//   }
}