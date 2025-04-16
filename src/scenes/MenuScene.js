export class MenuScene extends Phaser.Scene {
  constructor() {
      super('MenuScene');
  }

  create() {
      // Add background
      this.add.image(800, 600, 'bg').setScale(1.0);
      
      // Add title text
      this.add.text(800, 300, 'Oliver: Depths of the Neon Sea', {
          font: '64px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5);
      
      // Create start button
      const startButton = this.add.text(800, 600, 'Start Game', {
          font: '48px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 40, y: 20 }
      }).setOrigin(0.5).setInteractive();
      
      // Button hover effect
      startButton.on('pointerover', () => {
          startButton.setBackgroundColor('#0088cc');
      });
      
      startButton.on('pointerout', () => {
          startButton.setBackgroundColor('#006699');
      });
      
      // Start the game when clicked
      startButton.on('pointerdown', () => {
          this.scene.start('Level1Scene');
      });
      
      // Add instructions
      this.add.text(800, 800, 'Collect items, solve puzzles, defeat the boss!', {
          font: '36px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Show character preview
      const hero = this.add.image(400, 1000, 'hero').setScale(0.6);
      const sidekick = this.add.image(600, 1000, 'sidekick').setScale(0.4);
      
      // Add simple animation to characters
      this.tweens.add({
          targets: [hero, sidekick],
          y: 960,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
}