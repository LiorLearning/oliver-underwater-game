export class BootScene extends Phaser.Scene {
  constructor() {
      super('BootScene');
  }

  preload() {
      // Load loading screen assets
      this.load.image('logo', 'assets/images/logo.png'); // Optional: Add a logo if you have one
      
      // Create loading bar
      this.createLoadingBar();
  }

  create() {
      // Transition to PreloadScene for main assets loading
      this.scene.start('PreloadScene');
  }

  createLoadingBar() {
      // Loading bar background
      this.add.rectangle(800, 600, 800, 60, 0x123456);
      
      // Loading progress bar
      const progressBar = this.add.rectangle(800, 600, 0, 40, 0x55aaff);
      progressBar.setOrigin(0.5, 0.5);
      
      // Loading text
      const loadingText = this.add.text(800, 700, 'Loading...', {
          font: '40px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Progress event
      this.load.on('progress', (value) => {
          progressBar.width = 780 * value;
      });
  }
}