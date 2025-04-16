import { Player } from '../objects/Player.js';
import { Sidekick } from '../objects/Sidekick.js';

export class BossScene extends Phaser.Scene {
  constructor() {
      super('BossScene');
      this.player = null;
      this.sidekick = null;
      this.boss = null;
      this.bossHealth = 3; // Number of hits to defeat boss
      this.playerCanAttack = true;
      this.bossPhase = 1; // Boss has multiple attack patterns
      this.bossAttackTimer = null;
  }

  create() {
      // Set up the background for boss arena
      this.createBackground();
      
      // Create the boss character
      this.createBoss();
      
      // Create the player
      this.createPlayer();
      
      // Create UI elements
      this.createUI();
      
      // Start intro sequence
      this.startIntroSequence();
      
      // Start boss AI
      this.startBossAI();
  }

  update() {
      // Update player movement
      if (this.player) {
          this.player.update();
      }
      
      // Update sidekick position
      if (this.sidekick) {
          this.sidekick.update(this.player.x, this.player.y);
      }
      
      // Boss-related updates
      if (this.boss && this.boss.active) {
          this.updateBoss();
      }
  }

  createBackground() {
      // Create a special background for the boss area
      this.add.image(400, 300, 'bg').setTint(0xaa0000); // Red tint for danger
      
      // Add some atmosphere with particles
      this.createParticleEffects();
  }

  createParticleEffects() {
      // Create floating bubble particles
      const bubbleParticles = this.add.particles('sidekick'); // Reusing sidekick sprite as particle
      
      bubbleParticles.createEmitter({
          x: { min: 0, max: 800 },
          y: { min: 0, max: 600 },
          scale: { start: 0.05, end: 0.01 },
          alpha: { start: 0.5, end: 0 },
          speed: 20,
          lifespan: 4000,
          blendMode: 'ADD',
          frequency: 200
      });
  }

  createBoss() {
      // Create the boss villain
      this.boss = this.physics.add.sprite(600, 300, 'villain').setScale(0.4);
      
      // Set up boss animations and behavior
      this.boss.body.setAllowGravity(false);
      
      // Add health bar for boss
      this.bossHealthBar = this.add.rectangle(600, 200, 200, 20, 0xff0000);
      
      // Make boss float up and down
      this.tweens.add({
          targets: this.boss,
          y: 350,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }

  createPlayer() {
      // Create player
      this.player = new Player(this, 200, 300, 'hero');
      
      // Create sidekick (Blub)
      this.sidekick = new Sidekick(this, 250, 300, 'sidekick');
      
      // Set up collision with boss
      this.physics.add.overlap(
          this.player,
          this.boss,
          this.playerHitBoss,
          null,
          this
      );
  }

  createUI() {
      // Add boss name and health display
      this.add.text(600, 150, 'DEEP SEA VILLAIN', {
          font: '24px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add player health
      this.playerHealthBar = this.add.rectangle(200, 100, 150, 15, 0x00ff00);
      
      this.add.text(200, 80, 'OLIVER', {
          font: '18px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add instructions
      this.instructionText = this.add.text(400, 500, 'Press SPACE to attack when close to the boss!', {
          font: '18px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      // Add special attack button
      this.specialAttackButton = this.add.text(400, 550, 'SPECIAL ATTACK', {
          font: '20px Arial',
          fill: '#ffffff',
          backgroundColor: '#880088',
          padding: { x: 15, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      this.specialAttackButton.on('pointerdown', () => {
          this.useSpecialAttack();
      });
  }

  startIntroSequence() {
      // Show boss introduction dialogue
      const dialogue = [
          "VILLAIN: So you've made it this far, Oliver?",
          "OLIVER: I'm going to stop your evil plans!",
          "VILLAIN: You'll need more than math skills to defeat me!",
          "BLUB: We've collected all the items and solved the puzzles!",
          "VILLAIN: Let's see if that's enough!"
      ];
      
      // Create dialogue box
      const dialogueBox = this.add.rectangle(400, 300, 600, 150, 0x000000, 0.8);
      const dialogueText = this.add.text(400, 300, '', {
          font: '18px Arial',
          fill: '#ffffff',
          align: 'center'
      }).setOrigin(0.5);
      
      // Display dialogue sequentially
      let currentLine = 0;
      const showNextLine = () => {
          if (currentLine < dialogue.length) {
              dialogueText.setText(dialogue[currentLine]);
              currentLine++;
              this.time.delayedCall(2000, showNextLine);
          } else {
              // End dialogue and start battle
              dialogueBox.destroy();
              dialogueText.destroy();
              this.startBattle();
          }
      };
      
      showNextLine();
  }

  startBattle() {
      // Show battle start message
      this.add.text(400, 300, 'BATTLE START!', {
          font: '48px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5)
      .setAlpha(0)
      .setScale(0.5);
      
      // Animate the message
      this.tweens.add({
          targets: this.children.list[this.children.list.length - 1],
          alpha: 1,
          scale: 1,
          duration: 500,
          ease: 'Power2',
          yoyo: true,
          hold: 1000,
          onComplete: () => {
              // Enable player attack input
              this.input.keyboard.on('keydown-SPACE', this.attackBoss, this);
          }
      });
  }

  startBossAI() {
      // Set up boss attack pattern
      this.bossAttackTimer = this.time.addEvent({
          delay: 3000,
          callback: this.bossTryAttack,
          callbackScope: this,
          loop: true
      });
  }

  bossTryAttack() {
      // Boss attacks differently based on health/phase
      if (!this.boss || !this.boss.active) return;
      
      // Choose attack based on current phase
      switch(this.bossPhase) {
          case 1:
              this.bossAttackDirect();
              break;
          case 2:
              this.bossAttackPattern();
              break;
          case 3:
              this.bossAttackMath();
              break;
      }
  }

  bossAttackDirect() {
      // Boss charges directly at player
      this.tweens.add({
          targets: this.boss,
          x: this.player.x,
          y: this.player.y,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
              // Return to original position
              this.tweens.add({
                  targets: this.boss,
                  x: 600,
                  y: 300,
                  duration: 1500,
                  ease: 'Sine.easeInOut'
              });
          }
      });
  }

  bossAttackPattern() {
      // Boss creates a pattern attack
      // In v0, we'll just show a visual indicator
      this.add.circle(this.player.x, this.player.y, 50, 0xff0000, 0.3)
          .setAlpha(0.5);
          
      this.tweens.add({
          targets: this.children.list[this.children.list.length - 1],
          alpha: 0,
          scale: 1.5,
          duration: 1000,
          ease: 'Power2',
          onComplete: function(tween, targets) {
              targets[0].destroy();
          }
      });
  }

  bossAttackMath() {
      // In final phase, boss uses math attack
      // For v0, just create a circle pattern
      for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = this.boss.x + Math.cos(angle) * 150;
          const y = this.boss.y + Math.sin(angle) * 150;
          
          const projectile = this.add.circle(this.boss.x, this.boss.y, 15, 0xff0000, 1);
          
          this.tweens.add({
              targets: projectile,
              x: x,
              y: y,
              duration: 1000,
              ease: 'Linear',
              onComplete: function(tween, targets) {
                  targets[0].destroy();
              }
          });
      }
  }

  attackBoss() {
      // Check if player can attack
      if (!this.playerCanAttack) return;
      
      // Check if player is close enough to boss
      const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.boss.x, this.boss.y
      );
      
      if (distance < 150) {
          // Perform attack
          this.playerCanAttack = false;
          
          // Visual effect
          this.player.setTint(0xffff00);
          
          // Attack animation
          this.tweens.add({
              targets: this.player,
              x: this.boss.x - 80,
              duration: 200,
              yoyo: true,
              ease: 'Power1',
              onComplete: () => {
                  this.player.clearTint();
                  
                  // Cooldown before next attack
                  this.time.delayedCall(1000, () => {
                      this.playerCanAttack = true;
                  });
                  
                  // Damage boss
                  this.damageTheBoss();
              }
          });
      } else {
          // Player too far
          this.showMessage("Get closer to attack!");
      }
  }

  useSpecialAttack() {
      // Use special attack (only if all math puzzles solved)
      if (window.gameState.mathPuzzlesSolved < 3) {
          this.showMessage("Need to solve all math puzzles to use special attack!");
          return;
      }
      
      // Disable button to prevent spam
      this.specialAttackButton.disableInteractive();
      this.specialAttackButton.setBackgroundColor('#555555');
      
      // Visual effect
      this.sidekick.setTint(0x00ffff);
      
      // Show math symbols
      for (let i = 0; i < 10; i++) {
          const symbols = ['+', '-', '×', '÷', '=', '%'];
          const symbol = Phaser.Utils.Array.GetRandom(symbols);
          
          const x = this.sidekick.x;
          const y = this.sidekick.y;
          
          const text = this.add.text(x, y, symbol, {
              font: '32px Arial',
              fill: '#00ffff'
          }).setOrigin(0.5);
          
          // Animate symbol toward boss
          this.tweens.add({
              targets: text,
              x: this.boss.x,
              y: this.boss.y,
              duration: 1000,
              ease: 'Power2',
              onComplete: function(tween, targets) {
                  targets[0].destroy();
              }
          });
      }
      
      // Damage boss after a delay
      this.time.delayedCall(1000, () => {
          // Deal extra damage
          this.damageTheBoss();
          this.damageTheBoss();
          this.sidekick.clearTint();
      });
  }

  damageTheBoss() {
      // Reduce boss health
      this.bossHealth--;
      
      // Update health bar
      this.bossHealthBar.width = (this.bossHealth / 3) * 200;
      
      // Visual feedback
      this.boss.setTint(0xff0000);
      this.tweens.add({
          targets: this.boss,
          alpha: 0.7,
          duration: 100,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
              this.boss.clearTint();
              this.boss.setAlpha(1);
          }
      });
      
      // Check if boss is defeated
      if (this.bossHealth <= 0) {
          this.defeatBoss();
      } else {
          // Advance to next phase
          this.bossPhase = 4 - this.bossHealth; // Phase 2 at 2 health, Phase 3 at 1 health
          this.showMessage(`Boss entering phase ${this.bossPhase}!`);
      }
  }

  defeatBoss() {
      // Stop boss AI
      if (this.bossAttackTimer) {
          this.bossAttackTimer.remove();
      }
      
      // Stop player input
      this.input.keyboard.off('keydown-SPACE', this.attackBoss, this);
      
      // Boss defeat animation
      this.tweens.add({
          targets: this.boss,
          alpha: 0,
          scale: 1.5,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => {
              this.boss.destroy();
              this.showVictoryScreen();
          }
      });
  }

  showVictoryScreen() {
      // Create victory overlay
      const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
      
      // Victory text
      this.add.text(400, 200, 'VICTORY!', {
          font: '64px Arial',
          fill: '#ffff00'
      }).setOrigin(0.5);
      
      // Score display
      this.add.text(400, 300, `Final Score: ${window.gameState.score + 1000}`, {
          font: '32px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Unlocks
      this.add.text(400, 380, `Ship Upgrades: ${window.gameState.shipUpgrades.length}`, {
          font: '24px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Continue button
      const continueButton = this.add.text(400, 480, 'CONTINUE', {
          font: '32px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setInteractive();
      
      continueButton.on('pointerdown', () => {
          // In v0, we just return to menu
          this.scene.start('MenuScene');
      });
  }

  playerHitBoss(player, boss) {
      // Only trigger if not recently hit
      if (this.playerInvulnerable) return;
      
      // Player takes damage
      this.playerInvulnerable = true;
      
      // Visual effect
      player.setTint(0xff0000);
      
      // Reduce health bar
      this.playerHealthBar.width = Math.max(0, this.playerHealthBar.width - 30);
      
      // Knockback effect
      this.tweens.add({
          targets: player,
          x: player.x - 100,
          duration: 300,
          ease: 'Power2',
          onComplete: () => {
              // Invulnerability period
              this.time.delayedCall(1500, () => {
                  player.clearTint();
                  this.playerInvulnerable = false;
              });
          }
      });
      
      // Game over if health is zero
      if (this.playerHealthBar.width <= 0) {
          this.gameOver();
      }
  }

  gameOver() {
      // Game over handling
      this.scene.start('MenuScene');
  }

  showMessage(text) {
      // Create a message that appears briefly
      const message = this.add.text(400, 100, text, {
          font: '20px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setDepth(100);
      
      // Remove after a delay
      this.time.delayedCall(3000, () => {
          message.destroy();
      });
  }

  updateBoss() {
      // Additional boss behavior (empty in v0)
  }
}