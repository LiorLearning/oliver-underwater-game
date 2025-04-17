# Underwater Mathematics Adventure Game

An underwater-themed educational game that combines maze navigation, mathematics puzzles, and action elements to create an engaging learning experience.

## Game Overview

Players navigate an underwater maze while solving math puzzles, avoiding enemies, and collecting power-ups. The game features multiple levels with increasing difficulty, culminating in boss battles that test both math skills and game mechanics.

## Project Structure

The codebase is organized using a modular component-based architecture:

```
src/
├── config.js           // Game configuration settings
├── main.js             // Entry point for the game
├── objects/            // Game objects
│   ├── components/     // Reusable component modules
│   │   ├── BubbleTrail.js      // Bubble particle effect component
│   │   ├── HealthManager.js    // Health and damage component
│   │   ├── PlayerMovement.js   // Movement and collision component
│   │   └── SmokeBomb.js        // Smoke bomb ability component
│   ├── Assistant.js    // Enemy AI and behavior
│   ├── Boss.js         // Boss character behavior
│   ├── BossBullet.js   // Projectiles for boss fights
│   ├── Collectible.js  // Items that can be collected
│   ├── Player.js       // Main player character
│   └── Sidekick.js     // Helper character
├── scenes/             // Game scenes
│   ├── BootScene.js       // Initial loading scene
│   ├── BossScene.js       // Boss encounter scene
│   ├── Level1Scene.js     // First level maze scene
│   ├── MenuScene.js       // Main menu scene
│   ├── PreloadScene.js    // Asset preloading scene
│   ├── PuzzleScene.js     // Mathematical puzzle scene
│   └── ToolSelectScene.js // Tool selection interface
└── utils/              // Utility modules
    ├── Animation.js    // Animation handling utilities
    └── MathPuzzle.js   // Math puzzle generation and verification
```

## Component System

The game uses a component-based architecture, which:

1. **Improves code organization** - Related functionality is grouped together
2. **Enhances reusability** - Components can be reused across different game objects
3. **Simplifies maintenance** - Each component has a single responsibility
4. **Facilitates testing** - Components can be tested in isolation

### Player Components:

- **PlayerMovement**: Handles keyboard input, movement physics, and collision detection
- **BubbleTrail**: Creates particle effects that follow the player underwater
- **HealthManager**: Manages player health, damage, and invulnerability
- **SmokeBomb**: Implements the smoke bomb ability to eliminate enemies

## Game Features

- Underwater maze navigation with physics-based movement
- Mathematical puzzles integrated into gameplay
- Enemy AI with different behavior patterns
- Boss battles requiring strategy and skill
- Power-ups and collectibles
- Progressive difficulty across levels

## Development

The game is built using the Phaser 3 game framework and structured for easy expansion with additional levels, puzzles, and game mechanics.

### Future Enhancements

- Additional underwater-themed levels
- More diverse math puzzle types
- Enhanced visual effects
- Mobile device support
- Multiplayer capabilities 