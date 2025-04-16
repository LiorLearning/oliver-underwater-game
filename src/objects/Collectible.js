export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
      super(scene, x, y, texture);
      
      // Add collectible to scene
      scene.add.existing(this);
      scene.physics.add.existing(this);
      
      // Set physics properties
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      
      // Set scale
      this.setScale(0.4);
      
      // Add simple hover animation
      this.createHoverAnimation();
      
      // Add collectible ID
      this.id = Phaser.Math.Between(1, 1000);
      
      // Add item type (random for v0)
      this.itemTypes = ['gear', 'crystal', 'tool', 'part'];
      this.itemType = Phaser.Utils.Array.GetRandom(this.itemTypes);
  }
  
  createHoverAnimation() {
      // Create a simple floating animation - fewer frames, longer duration
      this.scene.tweens.add({
          targets: this,
          y: this.y + 10,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  collect() {
      // Store scene reference before destroying
      const scene = this.scene;
      
      // Simplify collection animation
      this.scene.tweens.add({
          targets: this,
          scale: 0,
          alpha: 0,
          duration: 300,
          ease: 'Back.easeIn',
          onComplete: () => {
              // Remove from scene
              this.destroy();
          }
      });
  }
  
  getDescription() {
      // Return a description of the item based on type
      const descriptions = {
          gear: "A precision gear for ship navigation",
          crystal: "An energy crystal to power ship systems",
          tool: "A specialized tool for ship repairs",
          part: "A critical engine part for the ship"
      };
      
      return descriptions[this.itemType] || "A mysterious ship component";
  }
}