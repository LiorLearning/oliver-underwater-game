import { Player } from '../objects/Player.js';
import { Sidekick } from '../objects/Sidekick.js';
import { Boss } from '../objects/Boss.js'; // Import the Boss class

export class BossScene extends Phaser.Scene {
  constructor() {
      super('BossScene');
      this.player = null;
      this.sidekick = null;
      this.boss = null;
      this.playerCanAttack = true;
      this.bossAttackTimer = null;
      this.playerHealth = 100;
      this.bullets = null;
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
          this.boss.update();
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
      // Create the boss using our Boss class
      this.boss = new Boss(this, 1200, 600, 'villain');
      
      // Add health bar for boss
      this.bossHealthBar = this.add.rectangle(1200, 400, 400, 40, 0xff0000);
      
      // Add health text
      this.bossHealthText = this.add.text(1200, 400, '100/100', {
          font: '20px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
      // Listen for boss health updates
      this.events.on('update', () => {
          if (this.boss && this.boss.active) {
              // Update health bar width
              this.bossHealthBar.width = (this.boss.health / 100) * 400;
              
              // Update health text
              this.bossHealthText.setText(`${Math.max(0, this.boss.health)}/100`);
          }
      });
  }

  createPlayer() {
      // Create player
      this.player = new Player(this, 400, 600, 'hero');
      
      // Create sidekick (Blub)
      this.sidekick = new Sidekick(this, 500, 600, 'sidekick');
      
      // Create player's tool sprite based on selection
      if (window.gameState.selectedTool) {
          this.playerTool = this.add.image(this.player.x + 30, this.player.y, window.gameState.selectedTool.image)
              .setScale(0.2)
              .setDepth(11);
          
          // Follow player
          this.events.on('update', () => {
              if (this.player && this.player.active && this.playerTool) {
                  this.playerTool.x = this.player.x + 30;
                  this.playerTool.y = this.player.y;
              }
          });
      }
      
      // Set up collision with boss
      this.physics.add.overlap(
          this.player,
          this.boss,
          this.playerHitBoss,
          null,
          this
      );
      
      // Set up player tool to hit boss when close
      this.input.keyboard.on('keydown-SPACE', this.attackBoss, this);
      
      // Set up collision with bullets (added by boss)
      this.physics.add.collider(
          this.player,
          this.boss.bullets,
          this.playerHitBullet,
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
      
      // Add player health text
      this.playerHealthText = this.add.text(400, 200, '100/100', {
          font: '20px Arial',
          fill: '#ffffff'
      }).setOrigin(0.5);
      
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
      
      // Display equipped tool info
      if (window.gameState.selectedTool) {
          this.add.text(400, 240, `Tool: ${window.gameState.selectedTool.name}`, {
              font: '24px Arial',
              fill: '#ffff00'
          }).setOrigin(0.5);
          
          this.add.text(400, 270, `Damage: ${window.gameState.selectedTool.strength}`, {
              font: '20px Arial',
              fill: '#ffff00'
          }).setOrigin(0.5);
      }
      
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
          hold: 1000
      });
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
          
          // Tool attack animation
          if (this.playerTool) {
              this.tweens.add({
                  targets: this.playerTool,
                  angle: 360,
                  duration: 500,
                  ease: 'Power1'
              });
          }
          
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
                  
                  // Damage boss with tool damage
                  const damage = window.gameState.selectedTool ? 
                      window.gameState.selectedTool.strength : 10;
                  
                  this.boss.takeDamage(damage);
                  
                  // Show damage number
                  this.showDamageNumber(this.boss.x, this.boss.y, damage);
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
          // Deal special damage (50% more than tool damage)
          const baseDamage = window.gameState.selectedTool ? 
              window.gameState.selectedTool.strength : 10;
          
          const specialDamage = Math.floor(baseDamage * 1.5);
          
          this.boss.takeDamage(specialDamage);
          this.showDamageNumber(this.boss.x, this.boss.y, specialDamage, 0x00ffff);
          
          this.sidekick.clearTint();
      });
  }

  showDamageNumber(x, y, amount, color = 0xffff00) {
      // Create a floating damage number
      const damageText = this.add.text(x, y, `-${amount}`, {
          font: '32px Arial',
          fill: color ? `#${color.toString(16)}` : '#ffff00',
          stroke: '#000000',
          strokeThickness: 4
      }).setOrigin(0.5);
      
      // Animate floating up and fading
      this.tweens.add({
          targets: damageText,
          y: y - 50,
          alpha: 0,
          duration: 1000,
          ease: 'Power1',
          onComplete: function(tween, targets) {
              targets[0].destroy();
          }
      });
  }

  playerHitBoss(player, boss) {
      // Only trigger if not recently hit
      if (this.playerInvulnerable) return;
      
      // Player takes damage
      this.playerInvulnerable = true;
      
      // Visual effect
      player.setTint(0xff0000);
      
      // Reduce player health
      this.playerHealth -= 10;
      this.playerHealth = Math.max(0, this.playerHealth);
      
      // Update health display
      this.playerHealthBar.width = (this.playerHealth / 100) * 300;
      this.playerHealthText.setText(`${this.playerHealth}/100`);
      
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
      if (this.playerHealth <= 0) {
          this.gameOver();
      }
  }

  playerHitBullet(player, bullet) {
      // Only trigger if not recently hit
      if (this.playerInvulnerable) return;
      
      // Player takes damage
      this.playerInvulnerable = true;
      
      // Visual effect
      player.setTint(0xff0000);
      
      // Reduce player health
      this.playerHealth -= bullet.damage || 5;
      this.playerHealth = Math.max(0, this.playerHealth);
      
      // Update health display
      this.playerHealthBar.width = (this.playerHealth / 100) * 300;
      this.playerHealthText.setText(`${this.playerHealth}/100`);
      
      // Show damage number
      this.showDamageNumber(player.x, player.y, bullet.damage || 5, 0xff0000);
      
      // Destroy bullet
      bullet.destroy();
      
      // Invulnerability period
      this.time.delayedCall(1000, () => {
          player.clearTint();
          this.playerInvulnerable = false;
      });
      
      // Game over if health is zero
      if (this.playerHealth <= 0) {
          this.gameOver();
      }
  }

  gameOver() {
      // Game over handling
      this.input.keyboard.off('keydown-SPACE', this.attackBoss, this);
      
      // Show game over text
      const gameOverText = this.add.text(800, 600, 'GAME OVER', {
          font: '128px Arial',
          fill: '#ff0000',
          stroke: '#000000',
          strokeThickness: 10
      }).setOrigin(0.5).setAlpha(0);
      
      // Fade in game over text
      this.tweens.add({
          targets: gameOverText,
          alpha: 1,
          duration: 2000,
          ease: 'Power2',
          onComplete: () => {
              // Add retry button
              const retryButton = this.add.text(800, 800, 'RETRY', {
                  font: '64px Arial',
                  fill: '#ffffff',
                  backgroundColor: '#880000',
                  padding: { x: 40, y: 20 }
              }).setOrigin(0.5).setInteractive();
              
              retryButton.on('pointerdown', () => {
                  // Return to menu
                  this.scene.start('MenuScene');
              });
          }
      });
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
}