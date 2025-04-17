export class MenuScene extends Phaser.Scene {
  constructor() {
      super('MenuScene');
  }

  create() {
      // Add background
      this.bg = this.add.image(0, 0, 'bg')
          .setOrigin(0, 0)
          .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
      
      // Add title
      this.createTitle();
      
      // Add start button
      this.createStartButton();
  }
  
  createTitle() {
      // Create title text
      const title = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 3,
          'MAZE CHALLENGE',
          {
              font: '64px Arial',
              fill: '#ffffff',
              stroke: '#000000',
              strokeThickness: 8,
              shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, stroke: true, fill: true }
          }
      ).setOrigin(0.5);
      
      // Add subtitle
      this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 3 + 80,
          'Collect Tools and Avoid Enemies!',
          {
              font: '28px Arial',
              fill: '#ffffff',
              stroke: '#000000',
              strokeThickness: 4
          }
      ).setOrigin(0.5);
      
      // Add a pulsing animation to the title
      this.tweens.add({
          targets: title,
          scale: 1.1,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }
  
  createStartButton() {
      // Create start button
      const button = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 150,
          250,
          80,
          0x009900
      ).setInteractive();
      
      // Add button text
      const buttonText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 150,
          'START GAME',
          {
              font: '32px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
      // Add button hover effect
      button.on('pointerover', () => {
          button.fillColor = 0x00cc00;
          buttonText.setScale(1.1);
      });
      
      button.on('pointerout', () => {
          button.fillColor = 0x009900;
          buttonText.setScale(1);
      });
      
      // Add button click action
      button.on('pointerdown', () => {
          // Flash button
          this.tweens.add({
              targets: [button, buttonText],
              alpha: 0.5,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                  // Play sound effect
                //   this.sound.play('collect');
                  
                  // Fade out to game
                  this.cameras.main.fade(500, 0, 0, 0);
                  this.cameras.main.once('camerafadeoutcomplete', () => {
                      // Stop menu music
                      this.sound.stopAll();
                      
                      // Start game
                      this.scene.start('Level1Scene');
                  });
              }
          });
      });
      
      // Add instructions text below button
      this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 250,
          'Arrow keys to move\nFind all tools to unlock the exit',
          {
              font: '20px Arial',
              fill: '#ffffff',
              align: 'center'
          }
      ).setOrigin(0.5);
  }
}