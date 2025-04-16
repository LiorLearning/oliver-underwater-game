import { Collectible } from '../objects/Collectible.js';
import { Player } from '../objects/Player.js';
import { Sidekick } from '../objects/Sidekick.js';
import { Assistant } from '../objects/Assistant.js';

export class Level1Scene extends Phaser.Scene {
  constructor() {
      super('Level1Scene');
      this.player = null;
      this.sidekick = null;
      this.collectibles = null;
      this.assistants = null;
      this.puzzleTriggers = null;
      this.bossTrigger = null;
      this.scoreText = null;
      this.itemsText = null;
      this.toolImages = {}; // Store references to tool images
      this.maze = null; // Maze walls
      this.exit = null; // Exit door
      this.exitOpen = false; // Is exit open?
      
      // Track collected tools
      window.gameState.collectedTools = [];
  }

  create() {
      // Reset score and health
      window.gameState.score = 0;
      window.gameState.health = 100;
      window.gameState.collectedTools = [];
      
      // Set up the game background
      this.createBackground();
      
      // Create maze walls
      this.createMaze();
      
      // Create exit door (initially closed)
      this.createExitDoor();
      
      // Create collectible items (coins)
      this.createCoins();
      
      // Create tools to collect
      this.createTools();
      
      // Create player at the start position
      this.createPlayer();
      
      // Create assistants (enemies)
      this.createAssistants();
      
      // Create UI
      this.createUI();
      
      // Set up collisions
      this.setupCollisions();
      
      // Set up camera
      this.cameras.main.setBounds(0, 0, 3200, 2400);
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
      
      // Add instructions overlay
      this.showInstructions();
  }

  update() {
      // Update player
      if (this.player) {
          this.player.update();
      }
      
      // Update assistants (enemies)
      this.assistants.getChildren().forEach(assistant => {
          assistant.update();
      });
      
      // Check if all tools are collected to open exit
      this.checkExitCondition();
      
      // Update minimap
      this.updateMinimap();
  }

  createBackground() {
      // Create a background
      this.bg = this.add.image(0, 0, 'bg')
          .setOrigin(0, 0)
          .setDisplaySize(3200, 2400);
  }

  createMaze() {
      // Create the maze walls group
      this.maze = this.physics.add.staticGroup();
      
      // Define the maze layout (1 = wall, 0 = path)
      const mazeLayout = [
          [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
          [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
          [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
          [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
          [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
          [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
          [1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
          [1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1],
          [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
          [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1],
          [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1],
      ];
      
      const cellSize = 200; // Size of each maze cell
      
      // Create wall objects based on the layout
      for (let y = 0; y < mazeLayout.length; y++) {
          for (let x = 0; x < mazeLayout[y].length; x++) {
              if (mazeLayout[y][x] === 1) {
                  // Create a wall at this position
                  const wall = this.maze.create(
                      x * cellSize + cellSize/2, 
                      y * cellSize + cellSize/2, 
                      'wall'
                  );
                  
                  wall.setDisplaySize(cellSize, cellSize);
                  wall.refreshBody();
              }
          }
      }
  }
  
  createExitDoor() {
      // Create exit door (position at bottom right of maze)
      this.exit = this.physics.add.sprite(3000, 2200, 'exit');
      this.exit.setScale(0.7);
      this.exit.setImmovable(true);
      
      // Initially the exit is closed/locked
      this.exit.setTint(0xff0000);
      
      // Add a visual indicator
      this.exitText = this.add.text(3000, 2150, 'EXIT\n(Collect all 3 tools)', {
          font: '20px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5);
  }
  
  createCoins() {
      // Create a group for collectible coins
      this.collectibles = this.physics.add.group();
      
      // Add coins throughout the maze
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
      
      coinPositions.forEach(pos => {
          const coin = new Collectible(this, pos.x, pos.y, 'collectible', 'coin');
          this.collectibles.add(coin);
      });
  }
  
  createTools() {
      // Create a group for tool collectibles
      this.tools = this.physics.add.group();
      
      // Add tools in different parts of the maze
      const toolPositions = [
          { x: 500, y: 1500, type: 'wrench' },
          { x: 1900, y: 500, type: 'hammer' },
          { x: 2700, y: 1700, type: 'screwdriver' }
      ];
      
      toolPositions.forEach(pos => {
          const tool = new Collectible(this, pos.x, pos.y, 'collectible', pos.type);
          this.tools.add(tool);
      });
  }
  
  createPlayer() {
      // Create player in the top-left corner of the maze
      this.player = new Player(this, 300, 300, 'hero');
      
      // Make sure player is visible (set on top layer)
      this.player.setDepth(10);
  }

  createAssistants() {
      // Create a group for assistants (enemies)
      this.assistants = this.physics.add.group();
      
      // Add assistants at specific positions in the maze
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

  createUI() {
      // Create health bar
      const healthBarWidth = 300;
      const healthBarHeight = 30;
      const healthBarX = 100;
      const healthBarY = 30;
      
      this.healthBarBackground = this.add.rectangle(
          healthBarX, 
          healthBarY, 
          healthBarWidth, 
          healthBarHeight, 
          0x000000
      ).setOrigin(0, 0.5).setScrollFactor(0);
      
      this.healthBarFill = this.add.rectangle(
          healthBarX, 
          healthBarY, 
          healthBarWidth, 
          healthBarHeight, 
          0x00ff00
      ).setOrigin(0, 0.5).setScrollFactor(0);
      
      this.healthText = this.add.text(
          healthBarX + healthBarWidth / 2, 
          healthBarY, 
          '100/100', 
          {
              font: '18px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5, 0.5).setScrollFactor(0);
      
      // Create score text
      this.scoreText = this.add.text(32, 70, 'Score: 0', {
          font: '24px Arial',
          fill: '#ffffff'
      }).setScrollFactor(0);
      
      // Tool collection status
      this.toolsText = this.add.text(32, 110, 'Tools: 0/3', {
          font: '24px Arial',
          fill: '#ffffff'
      }).setScrollFactor(0);
      
      // Add a small map in the corner showing maze and player position
      this.createMiniMap();
  }

  createMiniMap() {
      // Create minimap background - position at top right corner
      this.minimap = this.add.rectangle(1500, 120, 260, 200, 0x000000, 0.7)
          .setScrollFactor(0)
          .setOrigin(0.5)
          .setDepth(20);
      
      // Create minimap frame
      this.minimapFrame = this.add.rectangle(1500, 120, 260, 200, 0xffffff)
          .setScrollFactor(0)
          .setOrigin(0.5)
          .setStrokeStyle(2, 0xffffff)
          .setDepth(20);
      
      // Create player marker (make sure it's highly visible)
      this.minimapPlayer = this.add.circle(1500, 120, 5, 0xffff00)
          .setScrollFactor(0)
          .setDepth(21);
      
      // Create enemy markers group
      this.minimapEnemies = [];
      
      // Create minimap walls group
      this.minimapWalls = [];
      
      // Create tool markers
      this.minimapTools = [];
      
      // Create exit marker
      this.minimapExit = this.add.rectangle(0, 0, 10, 10, 0xff0000)
          .setScrollFactor(0)
          .setDepth(21);
      
      // Initialize minimap elements
      this.initializeMinimap();
  }
  
  initializeMinimap() {
      // Add maze walls to minimap
      this.maze.getChildren().forEach(wall => {
          const marker = this.add.rectangle(0, 0, 3, 3, 0x666666)
              .setScrollFactor(0)
              .setDepth(21);
          this.minimapWalls.push({ wall, marker });
      });
      
      // Add enemies to minimap
      this.assistants.getChildren().forEach(enemy => {
          const marker = this.add.circle(0, 0, 3, 0xff0000)
              .setScrollFactor(0)
              .setDepth(21);
          this.minimapEnemies.push({ enemy, marker });
      });
      
      // Add tools to minimap
      this.tools.getChildren().forEach(tool => {
          const marker = this.add.rectangle(0, 0, 4, 4, 0x00ffff)
              .setScrollFactor(0)
              .setDepth(21);
          this.minimapTools.push({ tool, marker });
      });
  }
  
  updateMinimap() {
      const mapWidth = 260;
      const mapHeight = 200;
      const worldWidth = 3200;
      const worldHeight = 2400;
      
      // Update player marker position (make it more visible)
      if (this.player && this.minimapPlayer) {
          const playerX = 1500 + (this.player.x / worldWidth) * mapWidth - mapWidth/2;
          const playerY = 120 + (this.player.y / worldHeight) * mapHeight - mapHeight/2;
          this.minimapPlayer.setPosition(playerX, playerY);
      }
      
      // Update wall markers
      this.minimapWalls.forEach(item => {
          if (item.wall.active) {
              const x = 1500 + (item.wall.x / worldWidth) * mapWidth - mapWidth/2;
              const y = 120 + (item.wall.y / worldHeight) * mapHeight - mapHeight/2;
              item.marker.setPosition(x, y);
              item.marker.setVisible(true);
          } else {
              item.marker.setVisible(false);
          }
      });
      
      // Update enemy markers
      this.minimapEnemies.forEach(item => {
          if (item.enemy.active) {
              const x = 1500 + (item.enemy.x / worldWidth) * mapWidth - mapWidth/2;
              const y = 120 + (item.enemy.y / worldHeight) * mapHeight - mapHeight/2;
              item.marker.setPosition(x, y);
              item.marker.setVisible(true);
          } else {
              item.marker.setVisible(false);
          }
      });
      
      // Update tool markers
      this.minimapTools.forEach(item => {
          if (item.tool.active) {
              const x = 1500 + (item.tool.x / worldWidth) * mapWidth - mapWidth/2;
              const y = 120 + (item.tool.y / worldHeight) * mapHeight - mapHeight/2;
              item.marker.setPosition(x, y);
              item.marker.setVisible(true);
          } else {
              item.marker.setVisible(false);
          }
      });
      
      // Update exit marker
      if (this.exit && this.minimapExit) {
          const exitX = 1500 + (this.exit.x / worldWidth) * mapWidth - mapWidth/2;
          const exitY = 120 + (this.exit.y / worldHeight) * mapHeight - mapHeight/2;
          this.minimapExit.setPosition(exitX, exitY);
      }
  }

  setupCollisions() {
      // Player collides with maze walls
      this.physics.add.collider(this.player, this.maze);
      
      // Assistants collide with maze walls
      this.physics.add.collider(this.assistants, this.maze);
      
      // Assistants collide with each other
      this.physics.add.collider(this.assistants, this.assistants);
      
      // Player collects coins
      this.physics.add.overlap(
          this.player,
          this.collectibles,
          this.collectCoin,
          null,
          this
      );
      
      // Player collects tools
      this.physics.add.overlap(
          this.player,
          this.tools,
          this.collectTool,
          null,
          this
      );
      
      // Player collides with assistants (enemies), takes damage
      this.physics.add.overlap(
          this.player,
          this.assistants,
          this.hitEnemy,
          null,
          this
      );
      
      // Player reaches exit
      this.physics.add.overlap(
          this.player,
          this.exit,
          this.reachExit,
          null,
          this
      );
  }

  // Update the health bar display
  updateHealthBar() {
      const percentage = window.gameState.health / 100;
      const barWidth = 300;
      
      // Update health bar width
      this.healthBarFill.width = barWidth * percentage;
      
      // Update color based on health
      if (percentage > 0.6) {
          this.healthBarFill.fillColor = 0x00ff00; // Green
      } else if (percentage > 0.3) {
          this.healthBarFill.fillColor = 0xffff00; // Yellow
      } else {
          this.healthBarFill.fillColor = 0xff0000; // Red
      }
      
      // Update text
      this.healthText.setText(`${window.gameState.health}/100`);
  }

  collectCoin(player, coin) {
      // Collect the coin
      coin.collect();
      
      // Update UI
      this.scoreText.setText('Score: ' + window.gameState.score);
      
      // Show collection message
      this.showMessage('Collected coin! +' + coin.value + ' points');
  }
  
  collectTool(player, tool) {
      // Collect the tool
      tool.collect();
      
      // Update tools count
      this.toolsText.setText('Tools: ' + window.gameState.collectedTools.length + '/3');
      
      // Show collection message
      this.showMessage('Collected ' + tool.getDescription() + '!');
  }

  hitEnemy(player, enemy) {
      // Player takes damage from enemy
      enemy.hitPlayer(player);
      
      // Update health bar
      this.updateHealthBar();
      
      // Show message
      this.showMessage('Hit by enemy! -10 health');
  }
  
  checkExitCondition() {
      // Check if all tools are collected
      if (window.gameState.collectedTools.length >= 3 && !this.exitOpen) {
          this.openExit();
      }
  }
  
  openExit() {
      // Mark exit as open
      this.exitOpen = true;
      
      // Change exit appearance
      this.exit.setTint(0x00ff00);
      
      // Update exit text
      this.exitText.setText('EXIT\n(Now Open!)');
      
      // Add effect to show exit is open
      this.tweens.add({
          targets: this.exit,
          scale: 0.9,
          duration: 1000,
          yoyo: true,
          repeat: -1
      });
      
      // Show message to player
      this.showMessage('All tools collected! The exit is now open!');
  }
  
  reachExit(player, exit) {
      // Only allow exit if all tools are collected
      if (!this.exitOpen) {
          this.showMessage('Collect all 3 tools to open the exit!');
          return;
      }
      
      // Show message
      this.showMessage('Level complete! Entering boss area...');
      
      // Stop player movement
      player.body.setVelocity(0, 0);
      
      // Transition to boss scene after delay
      this.time.delayedCall(2000, () => {
          this.scene.start('BossScene');
      });
  }

  showMessage(text) {
      // Create a message that appears briefly
      const message = this.add.text(800, 500, text, {
          font: '24px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
      
      // Remove after a delay
      this.time.delayedCall(3000, () => {
          message.destroy();
      });
  }

  showInstructions() {
      // Show initial instructions
      const instructions = [
          "Welcome to the Maze Challenge!",
          "Use arrow keys to move",
          "Collect coins for points",
          "Find all 3 tools to open the exit",
          "Avoid the red enemies - they will damage you!",
          "Watch your health bar at the top"
      ];
      
      const instructionBox = this.add.rectangle(800, 600, 700, 400, 0x000000, 0.8)
          .setScrollFactor(0)
          .setDepth(100);
          
      const instructionText = this.add.text(800, 600, instructions.join('\n\n'), {
          font: '22px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      
      // Add continue button
      const continueButton = this.add.text(800, 770, 'START GAME', {
          font: '24px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setScrollFactor(0).setInteractive().setDepth(101);
      
      continueButton.on('pointerdown', () => {
          instructionBox.destroy();
          instructionText.destroy();
          continueButton.destroy();
      });
  }
}