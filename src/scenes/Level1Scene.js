import { Collectible } from '../objects/Collectible.js';
import { Player } from '../objects/Player.js';
import { Assistant } from '../objects/Assistant.js';
import { Sidekick } from '../objects/Sidekick.js';
import { MazeGenerator } from '../managers/MazeGenerator.js';
import { UIManager } from '../managers/UIManager.js';
import { MiniMapManager } from '../managers/MiniMapManager.js';
import { CollisionManager } from '../managers/CollisionManager.js';
import { ToolManager } from '../managers/ToolManager.js';
import { ExitManager } from '../managers/ExitManager.js';

export class Level1Scene extends Phaser.Scene {
  constructor() {
      super('Level1Scene');
      this.player = null;
      this.collectibles = null;
      this.assistants = null;
      this.maze = null;
      this.tools = null;
      this.exit = null;
      this.exitOpen = false;
      this.sidekick = null;
      
      // Scene dimensions
      this.worldWidth = 3200;
      this.worldHeight = 2400;
      
      // Keep track of current tool for puzzle scene
      this.currentTool = null;
      
      // Initialize game state
      window.gameState = window.gameState || {};
      window.gameState.collectedTools = [];
      window.gameState.collectedSmokeBombs = [];
  }

  create() {
      console.log('Level1Scene create method starting');
      
      // Reset game state
      this.resetGameState();
      
      // Configure physics world bounds
      this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight, true, true, true, true);
      
      // Create game background
      this.createBackground();
      
      // Initialize managers
      this.initializeManagers();
      
      // Create maze and level elements
      this.mazeGenerator.createMaze();
      this.exitManager.createExitDoor();
      
      // Create collectibles
    //   this.createCoins();
      this.toolManager.createTools();
      // Create smoke bomb collectibles
      this.createSmokeBombs();
      
      // Create player and enemies
      this.createPlayer();
      console.log('Player created:', !!this.player);
      
      this.createSidekick();
      console.log('Sidekick created:', !!this.sidekick);
      
      this.createAssistants();
      console.log('Assistants created:', !!this.assistants);
      console.log('Number of assistants:', this.assistants ? this.assistants.getChildren().length : 0);
      
      // Setup UI
      this.uiManager.createUI();
      this.miniMapManager.createMiniMap();
      
      // Setup collisions - ensure this happens AFTER creating player and assistants
      console.log('Setting up collisions...');
      if (this.player && this.assistants && this.assistants.getChildren().length > 0) {
          this.collisionManager.setupCollisions();
          console.log('Collisions setup complete');
      } else {
          console.error('Cannot setup collisions: player or assistants missing');
      }
      
      // Setup camera
      this.setupCamera();
      
      // Setup debug graphics if needed
      this.setupDebugGraphics();
      
      // Show instructions
      this.uiManager.showInstructions();

      // Add background music
      // this.sound.play('theme', {
      //   loop: true,
      //   volume: 0.2
      // });
      
      // Listen for puzzle completion event
      this.events.on('puzzleComplete', (success) => {
          if (success && this.currentTool) {
              this.currentTool.collect();
              this.uiManager.updateToolsUI();
              this.uiManager.showMessage(`Puzzle solved! Collected ${this.currentTool.toolName || this.currentTool.type}!`);
          }
      });
      
      console.log('Level1Scene create method complete');
  }

  update() {
      // Update player
      if (this.player) {
          this.player.update();
          this.uiManager.updateSmokeBombUI(this.player.smokeBombs);
      }
      
      // Update sidekick to follow player
      if (this.player && this.sidekick) {
          this.sidekick.update(this.player.x, this.player.y);
      }
      
      // Update assistants (enemies)
      this.assistants.getChildren().forEach(assistant => {
          assistant.update();
      });
      
      // Update minimap
      this.miniMapManager.updateMiniMap();
  }

  resetGameState() {
      window.gameState.score = 0;
      window.gameState.health = 100;
      window.gameState.collectedTools = [];
      window.gameState.collectedSmokeBombs = [];
  }

  initializeManagers() {
      this.mazeGenerator = new MazeGenerator(this);
      this.uiManager = new UIManager(this);
      this.miniMapManager = new MiniMapManager(this);
      this.collisionManager = new CollisionManager(this);
      this.toolManager = new ToolManager(this);
      this.exitManager = new ExitManager(this);
  }

  createBackground() {
      this.bg = this.add.image(0, 0, 'bg')
          .setOrigin(0, 0)
          .setDisplaySize(this.worldWidth, this.worldHeight);
  }

  createCoins() {
      // Create a group for collectible coins
      this.collectibles = this.physics.add.group();
      
      // Get safe positions for coins using the mazeGenerator
      const coinCount = 12; // Number of coins to place
      const coinPositions = this.mazeGenerator.getSafePositions(coinCount);
      
      // Create coins at these safe positions
      coinPositions.forEach(pos => {
          const coin = new Collectible(this, pos.x, pos.y, 'collectible', 'coin');
          this.collectibles.add(coin);
      });
  }

  createPlayer() {
      this.player = new Player(this, 150, 150, 'hero');
      this.player.setDepth(10);
  }

  createSidekick() {
      // Create sidekick slightly behind the player's initial position
      this.sidekick = new Sidekick(this, this.player.x + 40, this.player.y - 40, 'sidekick');
      this.sidekick.setDepth(9); // Below player but above most other objects
  }

  createAssistants() {
    this.assistants = this.physics.add.group();
    
    // Get safe positions from maze generator where walls are not present
    const assistantCount = 8; // Number of assistants to place
    const positions = this.mazeGenerator.getSafePositions(assistantCount);
    
    positions.forEach(pos => {
        const assistant = new Assistant(this, pos.x, pos.y, 'assistant');
        this.assistants.add(assistant);
    });
}

  setupCamera() {
      this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      this.cameras.main.setZoom(0.8);
  }

  setupDebugGraphics() {
      const debugEnabled = false;
      
      if (debugEnabled) {
          this.debugGraphics = this.add.graphics();
          this.debugGraphics.lineStyle(1, 0x00ff00, 1);
          this.maze.getChildren().forEach(wall => {
              const body = wall.body;
              this.debugGraphics.strokeRect(
                  body.x, body.y, body.width, body.height
              );
          });
          this.debugGraphics.setDepth(100);
      }
  }

  collectCoin(player, coin) {
      coin.collect();
      this.uiManager.updateScore();
      this.uiManager.showMessage('Collected coin! +' + coin.value + ' points');
  }

  collectTool(player, tool) {
      this.scene.pause();
      
      // Launch puzzle scene
      this.scene.launch('PuzzleScene', {
          puzzleId: Phaser.Math.Between(1, 3),
          level: Phaser.Math.Between(1, Math.min(2, window.gameState.collectedTools.length + 1)),
          parentScene: 'Level1Scene',
          toolName: tool.toolName || tool.type.charAt(0).toUpperCase() + tool.type.slice(1),
          toolImage: tool.type
      });
      
      // Store reference to the tool
      this.currentTool = tool;
      
      // Show message
      this.uiManager.showMessage(`Solve the puzzle to collect the ${tool.toolName || tool.type}!`);
      
      // Listen for puzzle completion
      this.events.once('puzzleComplete', (success) => {
          this.scene.resume();
          
          if (success) {
              this.currentTool.collect();
              this.uiManager.updateToolsUI();
              this.uiManager.showMessage(`Puzzle solved! Collected ${this.currentTool.toolName || this.currentTool.type}!`);
              
              if (window.gameState.collectedTools.length >= 3) {
                  this.time.delayedCall(2000, () => {
                      // Open the exit door here
                      this.exitManager.openExit();
                      this.uiManager.showMessage('All tools collected! Find the exit!');
                  });
              } else {
                  const remaining = 3 - window.gameState.collectedTools.length;
                  this.time.delayedCall(2000, () => {
                      this.uiManager.showMessage(`Find ${remaining} more tool${remaining > 1 ? 's' : ''}!`);
                  });
              }
          } else {
              this.uiManager.showMessage('Puzzle failed! Try again to collect the tool.');
          }
          
          this.currentTool = null;
      });
  }

  hitEnemy(player, enemy) {
      console.log('hitEnemy function called');
      console.log('Player details:', {
          x: player.x,
          y: player.y,
          invulnerable: player.invulnerable,
          health: window.gameState.health
      });
      console.log('Enemy details:', {
          x: enemy.x,
          y: enemy.y,
          active: enemy.active
      });
      
      // Don't process if player is already invulnerable
      if (player.invulnerable) {
          console.log('Player is invulnerable, ignoring collision');
          return;
      }
      
      enemy.hitPlayer(player);
      this.uiManager.updateHealthBar();
      this.uiManager.showMessage('Hit by enemy! -10 health, invincible for 5 seconds!');
      
      // Add additional debugging feedback
      console.log('Player hit by enemy! Health reduced to:', window.gameState.health);
  }

  reachExit(player, exit) {
      if (!this.exitManager.isExitOpen()) {
          this.uiManager.showMessage('Collect all 3 tools to open the exit!');
          return;
      }
      
      this.uiManager.showMessage('Level complete! Choose your weapon...');
      player.body.setVelocity(0, 0);
      
      this.time.delayedCall(2000, () => {
          this.scene.start('ToolSelectScene');
      });
  }

  // Spawn smoke bomb collectibles in the maze
  createSmokeBombs() {
      this.smokeBombsGroup = this.physics.add.group();
      const smokeBombCount = 6;
      const positions = this.mazeGenerator.getSafePositions(smokeBombCount);
      positions.forEach(pos => {
          const smokeBomb = new Collectible(this, pos.x, pos.y, 'smoke-bomb', 'smoke-bomb');
          this.smokeBombsGroup.add(smokeBomb);
      });
  }

  // Handler for collecting smoke bombs
  collectSmokeBomb(player, smokeBomb) {
      // Instead of collecting immediately, present a puzzle
      this.collectSmokeBombWithPuzzle(player, smokeBomb);
  }

  // Handle smoke bomb collection with puzzle
  collectSmokeBombWithPuzzle(player, smokeBomb) {
      this.scene.pause();
      
      // Store reference to the smoke bomb
      this.currentSmokeBomb = smokeBomb;
      
      // Launch puzzle scene
      this.scene.launch('PuzzleScene', {
          puzzleId: Phaser.Math.Between(1, 3),
          level: Phaser.Math.Between(1, Math.min(2, player.smokeBombs + 1)),
          parentScene: 'Level1Scene',
          toolName: 'Smoke Bomb',
          toolImage: 'smoke-bomb'
      });
      
      // Show message
      this.uiManager.showMessage('Solve the puzzle to collect the Smoke Bomb!');
      
      // Listen for puzzle completion
      this.events.once('puzzleComplete', (success) => {
          this.scene.resume();
          
          if (success) {
              // Collect the smoke bomb
              this.currentSmokeBomb.collect();
              
              // Increment player's smoke bomb count
              player.smokeBombs += 1;
              
              // Update the UI
              this.uiManager.updateSmokeBombUI(player.smokeBombs);
              
              // Show a message
              this.uiManager.showMessage(`Puzzle solved! Collected Smoke Bomb! Total: ${player.smokeBombs}`);
          } else {
              this.uiManager.showMessage('Puzzle failed! Try again to collect the Smoke Bomb.');
          }
          
          this.currentSmokeBomb = null;
      });
  }
}