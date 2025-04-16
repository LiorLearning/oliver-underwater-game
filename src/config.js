// Game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 100 }, // Light gravity for underwater effect
          debug: false
      }
  },
  scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      Level1Scene,
      PuzzleScene,
      BossScene
  ],
  pixelArt: false,
  backgroundColor: '#0a2239', // Deep blue ocean color
  scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
  }
};