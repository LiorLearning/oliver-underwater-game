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
  }

  create() {
      // Set up the underwater background
      this.createBackground();
      
      // Create collectible items
      this.createCollectibles();
      
      // Create puzzle trigger zones
      this.createPuzzleTriggers();
      
      // Create player and sidekick
      this.createPlayerAndSidekick();
      
      // Create assistants (bubble buddies)
      this.createAssistants();
      
      // Create boss trigger area
      this.createBossTrigger();
      
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
      // Update player and sidekick
      this.player.update();
      this.sidekick.update(this.player.x, this.player.y);
      
      // Update assistants
      this.assistants.getChildren().forEach(assistant => {
          assistant.update();
      });
      
      // Check win condition
      this.checkWinCondition();
  }

  createBackground() {
      // Create a background that covers the full screen
      this.bg = this.add.image(0, 0, 'bg')
          .setOrigin(0, 0)
          .setDisplaySize(3200, 2400);
      
      // Make sure the background follows the camera without parallax (full coverage)
      this.bg.setScrollFactor(0);
      
      // Add some depth to the environment
      this.createEnvironmentObjects();
  }

  createEnvironmentObjects() {
      // In v0, we're keeping this minimal
      // Future versions would add coral, rocks, etc.
  }

  createPlayerAndSidekick() {
      // Create player
      this.player = new Player(this, 100, 300, 'hero');
      
      // Create sidekick (Blub)
      this.sidekick = new Sidekick(this, 150, 300, 'sidekick');
  }

  createCollectibles() {
      // Create a group for collectible items
      this.collectibles = this.physics.add.group();
      
      // Add items at specific positions
      const positions = [
          { x: 800, y: 400 },
          { x: 1600, y: 600 },
          { x: 2400, y: 800 }
      ];
      
      positions.forEach(pos => {
          const collectible = new Collectible(this, pos.x, pos.y, 'collectible');
          this.collectibles.add(collectible);
      });
  }

  createAssistants() {
      // Create a group for assistants (bubble buddies)
      this.assistants = this.physics.add.group();
      
      // Add assistants at specific positions
      const positions = [
          { x: 1200, y: 800 },
          { x: 2000, y: 400 }
      ];
      
      positions.forEach(pos => {
          const assistant = new Assistant(this, pos.x, pos.y, 'assistant');
          this.assistants.add(assistant);
      });
  }

  createPuzzleTriggers() {
      // Create trigger zones for math puzzles
      this.puzzleTriggers = this.physics.add.group();
      
      // Create three puzzle trigger areas with tool names
      const positions = [
          { x: 1000, y: 600, tool: 'Wrench', image: 'wrench' },
          { x: 1800, y: 800, tool: 'Hammer', image: 'hammer' },
          { x: 2600, y: 400, tool: 'Screwdriver', image: 'screwdriver' }
      ];
      
      positions.forEach((pos, index) => {
          const trigger = this.add.zone(pos.x, pos.y, 200, 200);
          this.physics.world.enable(trigger);
          trigger.body.setAllowGravity(false);
          trigger.body.moves = false;
          
          // Add visual indicator
          const visual = this.add.circle(pos.x, pos.y, 100, 0x00ffff, 0.3);
          
          // Add tool image instead of text
          const toolImage = this.add.image(pos.x, pos.y, pos.image)
              .setScale(0.3)
              .setOrigin(0.5);
          
          // Store puzzle ID and tool name
          trigger.puzzleId = index + 1;
          trigger.toolName = pos.tool;
          trigger.toolImage = pos.image;
          
          // Store reference to the tool image for later access
          this.toolImages[trigger.puzzleId] = toolImage;
          
          this.puzzleTriggers.add(trigger);
      });
  }

  createBossTrigger() {
      // Create trigger zone for boss battle
      this.bossTrigger = this.add.zone(3000, 1200, 400, 400);
      this.physics.world.enable(this.bossTrigger);
      this.bossTrigger.body.setAllowGravity(false);
      this.bossTrigger.body.moves = false;
      
      // Add visual indicator
      const visual = this.add.circle(3000, 1200, 200, 0xff0000, 0.3);
      
      // Add warning text
      this.add.text(3000, 1200, 'BOSS AREA', {
          font: '40px Arial',
          fill: '#ff0000',
          align: 'center'
      }).setOrigin(0.5);
  }

  createUI() {
      // Create fixed position UI elements
      this.scoreText = this.add.text(32, 32, 'Score: 0', {
          font: '36px Arial',
          fill: '#ffffff'
      }).setScrollFactor(0);
      
      this.itemsText = this.add.text(32, 100, 'Items: 0/' + window.gameState.requiredItems, {
          font: '36px Arial',
          fill: '#ffffff'
      }).setScrollFactor(0);
      
      // Add a small map in the corner showing player position
      this.createMiniMap();
  }

  createMiniMap() {
      // Simple minimap showing player location
      const minimap = this.add.rectangle(1400, 100, 200, 150, 0x000000, 0.5)
          .setScrollFactor(0);
          
      this.minimapPlayer = this.add.circle(1400, 100, 10, 0xffff00)
          .setScrollFactor(0);
          
      // Update minimap in scene update
      this.events.on('update', () => {
          // Calculate player position for minimap
          const x = 1400 + (this.player.x / 3200) * 200 - 100;
          const y = 100 + (this.player.y / 2400) * 150 - 75;
          
          this.minimapPlayer.setPosition(x, y);
      });
  }

  setupCollisions() {
      // Player collects items
      this.physics.add.overlap(
          this.player,
          this.collectibles,
          this.collectItem,
          null,
          this
      );
      
      // Player interacts with assistants
      this.physics.add.overlap(
          this.player,
          this.assistants,
          this.interactWithAssistant,
          null,
          this
      );
      
      // Player enters puzzle trigger areas
      this.physics.add.overlap(
          this.player,
          this.puzzleTriggers,
          this.triggerPuzzle,
          null,
          this
      );
      
      // Player enters boss area
      this.physics.add.overlap(
          this.player,
          this.bossTrigger,
          this.triggerBossBattle,
          null,
          this
      );
  }

  collectItem(player, collectible) {
      // Remove the collectible
      collectible.collect();
      
      // Update game state
      window.gameState.collectedItems++;
      window.gameState.score += 1;
      
      // Update UI
      this.scoreText.setText('Score: ' + window.gameState.score);
      this.itemsText.setText('Items: ' + window.gameState.collectedItems + '/' + window.gameState.requiredItems);
      
      // Show collection message
      this.showMessage('Collected 1 coin! Total: ' + window.gameState.score);
  }

  interactWithAssistant(player, assistant) {
      // Only trigger once
      if (assistant.hasInteracted) return;
      
      assistant.interact();
      
      // Show hint from assistant
      const hints = [
          "Solve math puzzles to upgrade your ship!",
          "Collect all items before facing the boss!",
          "I can help you solve puzzles!"
      ];
      
      this.showMessage(hints[Math.floor(Math.random() * hints.length)]);
  }

  triggerPuzzle(player, trigger) {
      // Don't trigger if already solved
      if (trigger.solved) return;
      
      // Don't trigger too often
      if (this.lastPuzzleTime && this.time.now - this.lastPuzzleTime < 3000) return;
      this.lastPuzzleTime = this.time.now;
      
      // Launch puzzle overlay scene
      this.scene.launch('PuzzleScene', { 
          puzzleId: trigger.puzzleId,
          level: 1,
          parentScene: this,
          toolName: trigger.toolName,
          toolImage: trigger.toolImage
      });
      
      // Pause this scene while puzzle is active
      this.scene.pause();
      
      // Mark as solved
      trigger.solved = true;
  }

  triggerBossBattle(player, trigger) {
      // Only trigger once
      if (this.bossTriggered) return;
      
      // Check requirements
      if (window.gameState.collectedItems < window.gameState.requiredItems) {
          this.showMessage("You need to collect all items first!");
          return;
      }
      
      if (window.gameState.mathPuzzlesSolved < 3) {
          this.showMessage("Solve all math puzzles before facing the boss!");
          return;
      }
      
      // Trigger boss battle
      this.bossTriggered = true;
      this.scene.start('BossScene');
  }

  showMessage(text) {
      // Create a message that appears briefly
      const message = this.add.text(400, 500, text, {
          font: '20px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
      
      // Remove after a delay
      this.time.delayedCall(3000, () => {
          message.destroy();
      });
  }

  showInstructions() {
      // Show initial instructions
      const instructions = [
          "Welcome to Level 1!",
          "Use arrow keys to swim",
          "Collect 3 items for your ship",
          "Solve math puzzles to gain upgrades",
          "Defeat the boss to complete the level"
      ];
      
      const instructionBox = this.add.rectangle(800, 600, 500, 300, 0x000000, 0.8)
          .setScrollFactor(0);
          
      const instructionText = this.add.text(800, 600, instructions.join('\n\n'), {
          font: '18px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5).setScrollFactor(0);
      
      // Add continue button
      const continueButton = this.add.text(800, 730, 'CONTINUE', {
          font: '20px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 15, y: 8 }
      }).setOrigin(0.5).setScrollFactor(0).setInteractive();
      
      continueButton.on('pointerdown', () => {
          instructionBox.destroy();
          instructionText.destroy();
          continueButton.destroy();
      });
  }

  checkWinCondition() {
      // Not used in v0, but would be implemented for level completion logic
  }

  closePuzzle(puzzleId, success) {
      // Handle the puzzle completion
      if (success) {
          // Remove the tool image when puzzle is successfully solved
          if (this.toolImages[puzzleId]) {
              // Fade out animation for the tool image
              this.tweens.add({
                  targets: this.toolImages[puzzleId],
                  alpha: 0,
                  scale: 2,
                  duration: 1000,
                  ease: 'Power2',
                  onComplete: () => {
                      this.toolImages[puzzleId].destroy();
                  }
              });
          }
          
          // Show message
          this.showMessage("Puzzle solved! Ship upgrade acquired!");
      }
  }
}