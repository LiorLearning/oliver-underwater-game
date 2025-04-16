// Game configuration
export const config = {
    type: Phaser.AUTO,
    width: window.innerWidth * (1200 / window.innerHeight), // Width adapts to screen aspect ratio
    height: 1200, // Fixed height
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 100 }, // Light gravity for underwater effect
            debug: false
        }
    },
    // Scenes will be added in main.js
    pixelArt: false,
    backgroundColor: '#0a2239', // Deep blue ocean color
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};