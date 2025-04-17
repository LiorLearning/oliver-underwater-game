import { Collectible } from '../objects/Collectible.js';
import { Player } from '../objects/Player.js';
import { Assistant } from '../objects/Assistant.js';
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
      
      // Scene dimensions
      this.worldWidth = 3200;
      this.worldHeight = 2400;
      
      // Keep track of current tool for puzzle scene
      this.currentTool = null;
      
      // Initialize game state
      window.gameState = window.gameState || {};
      window.gameState.collectedTools = [];
  }

  create() {
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
      this.createCoins();
      this.toolManager.createTools();
      
      // Create player and enemies
      this.createPlayer();
      this.createAssistants();
      
      // Setup UI
      this.uiManager.createUI();
      this.miniMapManager.createMiniMap();
      
      // Setup collisions
      this.collisionManager.setupCollisions();
      
      // Setup camera
      this.setupCamera();
      
      // Setup debug graphics if needed
      this.setupDebugGraphics();
      
      // Show instructions
      this.uiManager.showInstructions();
  }

  update() {
      // Update player
      if (this.player) {
          this.player.update();
          this.uiManager.updateSmokeBombUI(this.player.smokeBombs);
      }
      
      // Update assistants (enemies)
      this.assistants.getChildren().forEach(assistant => {
          assistant.update();
      });
      
      // Check exit condition
      this.exitManager.checkExitCondition();
      
      // Update minimap
      this.miniMapManager.updateMiniMap();
  }

  resetGameState() {
      window.gameState.score = 0;
      window.gameState.health = 100;
      window.gameState.collectedTools = [];
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
      
      // Define coins positions
      const coinPositions = [
          { x: 300, y: 300 },
          { x: 700, y: 500 },
          { x: 1100, y: 300 },
          { x: 1500, y: 900 },
          { x: 900, y: 1100 },
          { x: 1700, y: 1300 },
          { x: 2100, y: 500 },
          { x: 2500, y: 900 },
          { x: 2300, y: 1700 },
          { x: 1300, y: 1900 },
          { x: 500, y: 1700 },
          { x: 300, y: 1100 }
      ];
      
      // Adjust coin positions to be centered in maze cells
      const cellSize = 200;
      const coinPositionsAdjusted = coinPositions.map(pos => {
          const cellX = Math.floor(pos.x / cellSize);
          const cellY = Math.floor(pos.y / cellSize);
          
          return {
              x: (cellX * cellSize) + (cellSize / 2),
              y: (cellY * cellSize) + (cellSize / 2)
          };
      });
      
      // Create coins at adjusted positions
      coinPositionsAdjusted.forEach(pos => {
          const coin = new Collectible(this, pos.x, pos.y, 'collectible', 'coin');
          this.collectibles.add(coin);
      });
  }

  createPlayer() {
      this.player = new Player(this, 150, 150, 'hero');
      this.player.setDepth(10);
  }

  createAssistants() {
      this.assistants = this.physics.add.group();
      
      const positions = [
          { x: 1200, y: 800 },
          { x: 2000, y: 400 },
          { x: 800, y: 1600 },
          { x: 2400, y: 1300 }
      ];
      
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
      
      // Play sound effect
      if (this.sound && this.sound.add) {
          const puzzleSound = this.sound.add('puzzle_start', { volume: 0.5 });
          puzzleSound.play();
      }
      
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
      enemy.hitPlayer(player);
      this.uiManager.updateHealthBar();
      this.uiManager.showMessage('Hit by enemy! -10 health');
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
}