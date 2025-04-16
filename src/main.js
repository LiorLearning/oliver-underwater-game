// Import all game classes and components
import { config } from './config.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { Level1Scene } from './scenes/Level1Scene.js';
import { PuzzleScene } from './scenes/PuzzleScene.js';
import { BossScene } from './scenes/BossScene.js';

// Wait for DOM to be ready
window.onload = function() {
    // Register all scenes
    const gameConfig = {
        ...config,
        scene: [
            BootScene,
            PreloadScene,
            MenuScene,
            Level1Scene,
            PuzzleScene,
            BossScene
        ]
    };
    
    // Create the game with the configuration
    const game = new Phaser.Game(gameConfig);
    
    // Add game to global scope for debugging (optional)
    window.game = game;
    
    // Game global variables
    window.gameState = {
        score: 0,
        level: 1,
        collectedItems: 0,
        requiredItems: 3,
        mathPuzzlesSolved: 0,
        shipUpgrades: []
    };
};