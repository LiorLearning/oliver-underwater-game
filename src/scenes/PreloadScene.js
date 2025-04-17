export class PreloadScene extends Phaser.Scene {
  constructor() {
      super('PreloadScene');
  }

  preload() {
      // Display loading progress
      this.createLoadingBar();
      
      // Load all game assets
      this.loadImages();
      this.loadSpritesheets();
      this.loadAudio();
      
      // Font loading
      this.loadFonts();
      
      // Load utilities
      this.loadUtilities();
  }

  create() {
      // Initialize game state
      window.gameState = {
          score: 0,
          health: 100,
          collectedTools: []
      };
      
      // Go to menu scene
      this.scene.start('MenuScene');
  }

  createLoadingBar() {
      // Create a loading bar
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      
      // Progress bar background
      const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x222222);
      
      // Progress bar
      const progressBar = this.add.rectangle(
          width / 2 - 195, 
          height / 2, 
          10, 
          20, 
          0x00ff00
      ).setOrigin(0, 0.5);
      
      // Loading text
      const loadingText = this.add.text(
          width / 2, 
          height / 2 - 50,
          'Loading...', 
          { 
              font: '24px Arial',
              fill: '#ffffff' 
          }
      ).setOrigin(0.5);
      
      // Update progress bar as assets load
      this.load.on('progress', (value) => {
          // Resize progress bar based on load progress
          progressBar.width = 390 * value;
      });
      
      // Remove progress bar when done
      this.load.on('complete', () => {
          progressBar.destroy();
          progressBarBg.destroy();
          loadingText.destroy();
      });
  }

  loadImages() {
      // Background 
      this.load.image('bg', 'assets/images/bg.png');
      
      // Game objects
      this.load.image('wall', 'assets/images/wall.png');
      this.load.image('collectible', 'assets/images/collectible.png');
      this.load.image('exit', 'assets/images/exit.png');
      this.load.image('particle', 'assets/images/particle.png');
      
      // UI elements
      this.load.image('button', 'assets/images/button.png');
      
      // Tools
      this.load.image('wrench', 'assets/images/wrench.png');
      this.load.image('hammer', 'assets/images/hammer.png');
      this.load.image('screwdriver', 'assets/images/screwdriver.png');
      
      // Sidekick
      this.load.image('sidekick', 'assets/images/sidekick.png');
      
      // Weapons
      this.load.image('smoke-bomb', 'assets/images/smoke-bomb.png');
  }

  loadSpritesheets() {
      // Load the hero directly as an image if we have no spritesheet
      this.load.image('hero', 'assets/images/hero.png');
      
      // Load the assistant directly as an image
      this.load.image('assistant', 'assets/images/assistant.png');
      
      // Load boss image
      this.load.image('boss', 'assets/images/villain.png');
  }

  loadAudio() {
      // Audio will be loaded in a future version
      // Currently commented to avoid errors if files don't exist
      
      // // Sound effects
      this.load.audio('click', 'assets/audio/sfx/click.mp3');
      this.load.audio('correct', 'assets/audio/sfx/correct.mp3');
      this.load.audio('incorrect', 'assets/audio/sfx/incorrect.mp3');
      // this.load.audio('hit', 'assets/audio/hit.mp3');
      // this.load.audio('win', 'assets/audio/win.mp3');
      // this.load.audio('lose', 'assets/audio/lose.mp3');
      
      // // Music
      this.load.audio('theme', 'assets/audio/music/theme.mp3');
      // this.load.audio('boss_theme', 'assets/audio/boss_theme.mp3');
  }

  loadFonts() {
      // No custom fonts for now, using system fonts
  }

  loadUtilities() {
      // Import the MathPuzzle utility directly
      import('../utils/MathPuzzle.js').then(module => {
          // Make MathPuzzle accessible globally
          window.MathPuzzle = module.MathPuzzle;
          console.log('MathPuzzle utility loaded successfully');
      }).catch(error => {
          console.error('Failed to load MathPuzzle utility:', error);
      });
  }
}