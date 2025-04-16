export class MenuScene extends Phaser.Scene {
  constructor() {
      super('MenuScene');
  }

  create() {
      // Add background
      this.add.image(400, 300, 'bg').setScale(0.5);
      
      // Add title text
      this.add.text(400, 150, 'Oliver: Depths of the Neon Sea', {
          font: '32px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5);
      
      // Create start button
      const startButton = this.add.text(400, 300, 'Start Game', {
          font: '24px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 20, y: 10 }
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
      this.add.text(400, 400, 'Collect items, solve puzzles, defeat the boss!', {
          font: '18px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Show character preview
      const hero = this.add.image(200, 500, 'hero').setScale(0.3);
      const sidekick = this.add.image(300, 500, 'sidekick').setScale(0.2);
      
      // Add simple animation to characters
      this.tweens.add({
          targets: [hero, sidekick],
          y: 480,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
}