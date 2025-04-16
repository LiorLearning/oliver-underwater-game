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
      this.add.image(800, 600, 'bg').setTint(0xaa0000).setScale(1.0); // Red tint for danger
      
      // Add some atmosphere with particles
      this.createParticleEffects();
  }

  createParticleEffects() {
      // Create floating bubble particles
      const bubbleParticles = this.add.particles('sidekick'); // Reusing sidekick sprite as particle
      
      bubbleParticles.createEmitter({
          x: { min: 0, max: 1600 },
          y: { min: 0, max: 1200 },
          scale: { start: 0.1, end: 0.02 },
          alpha: { start: 0.5, end: 0 },
          speed: 40,
          lifespan: 4000,
          blendMode: 'ADD',
          frequency: 200
      });
  }

  createBoss() {
      // Create the boss villain
      this.boss = this.physics.add.sprite(1200, 600, 'villain').setScale(0.8);
      
      // Set up boss animations and behavior
      this.boss.body.setAllowGravity(false);
      
      // Add health bar for boss
      this.bossHealthBar = this.add.rectangle(1200, 400, 400, 40, 0xff0000);
      
      // Make boss float up and down
      this.tweens.add({
          targets: this.boss,
          y: 700,
          duration: 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
      });
  }

  createPlayer() {
      // Create player
      this.player = new Player(this, 400, 600, 'hero');
      
      // Create sidekick (Blub)
      this.sidekick = new Sidekick(this, 500, 600, 'sidekick');
      
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
      this.add.text(1200, 300, 'DEEP SEA VILLAIN', {
          font: '48px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add player health
      this.playerHealthBar = this.add.rectangle(400, 200, 300, 30, 0x00ff00);
      
      this.add.text(400, 160, 'OLIVER', {
          font: '36px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Add instructions
      this.instructionText = this.add.text(800, 1000, 'Press SPACE to attack when close to the boss!', {
          font: '36px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
      
      // Add special attack button
      this.specialAttackButton = this.add.text(800, 1100, 'SPECIAL ATTACK', {
          font: '40px Arial',
          fill: '#ffffff',
          backgroundColor: '#880088',
          padding: { x: 30, y: 20 }
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
      const dialogueBox = this.add.rectangle(800, 600, 1200, 300, 0x000000, 0.8);
      const dialogueText = this.add.text(800, 600, '', {
          font: '36px Arial',
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
      this.add.text(800, 600, 'BATTLE START!', {
          font: '96px Arial',
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
                  x: 1200,
                  y: 600,
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
      this.bossHealthBar.width = (this.bossHealth / 3) * 400;
      
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
      const overlay = this.add.rectangle(800, 600, 1600, 1200, 0x000000, 0.8);
      
      // Victory text
      this.add.text(800, 400, 'VICTORY!', {
          font: '128px Arial',
          fill: '#ffff00'
      }).setOrigin(0.5);
      
      // Score display
      this.add.text(800, 600, `Final Score: ${window.gameState.score + 1000}`, {
          font: '64px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Unlocks
      this.add.text(800, 700, `Ship Upgrades: ${window.gameState.shipUpgrades.length}`, {
          font: '48px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Continue button
      const continueButton = this.add.text(800, 900, 'CONTINUE', {
          font: '64px Arial',
          fill: '#ffffff',
          backgroundColor: '#006699',
          padding: { x: 40, y: 20 }
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
      const message = this.add.text(800, 200, text, {
          font: '48px Arial',
          fill: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 20, y: 10 }
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