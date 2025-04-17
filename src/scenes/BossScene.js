import { Player } from '../objects/Player.js';
import { Boss } from '../objects/Boss.js';

export class BossScene extends Phaser.Scene {
  constructor() {
      super('BossScene');
      this.player = null;
      this.boss = null;
      this.playerCanAttack = true;
      this.bossAttackTimer = null;
      this.bullets = null;
      this.toolsEquipped = [];
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
      
      // Boss-related updates
      if (this.boss && this.boss.active) {
          this.boss.update();
      }
  }

  createBackground() {
      // Create a special background for the boss area
      this.add.image(0, 0, 'bg')
          .setOrigin(0, 0)
          .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
          .setTint(0xaa0000); // Red tint for danger
      
      // Add some atmosphere with particles
      this.createParticleEffects();
  }

  createParticleEffects() {
      // Create floating particles
      const particles = this.add.particles('particle');
      
      particles.createEmitter({
          x: { min: 0, max: this.cameras.main.width },
          y: { min: 0, max: this.cameras.main.height },
          scale: { start: 0.1, end: 0.02 },
          alpha: { start: 0.5, end: 0 },
          speed: 40,
          lifespan: 4000,
          blendMode: 'ADD',
          frequency: 200
      });
  }

  createBoss() {
      // Create the boss using Boss class
      this.boss = new Boss(this, this.cameras.main.width * 0.7, this.cameras.main.height * 0.5, 'boss');
      
      // Add health bar for boss
      this.bossHealthBar = this.add.rectangle(
          this.cameras.main.width * 0.7, 
          this.cameras.main.height * 0.2,
          400, 
          40, 
          0xff0000
      );
      
      // Add health text
      this.bossHealthText = this.add.text(
          this.cameras.main.width * 0.7, 
          this.cameras.main.height * 0.2, 
          '100/100', 
          {
              font: '24px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
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
      this.player = new Player(this, this.cameras.main.width * 0.3, this.cameras.main.height * 0.5, 'hero');
      
      // Create tool sprites around player based on collected tools
      this.createToolSprites();
      
      // Set up collision with boss
      this.physics.add.overlap(
          this.player,
          this.boss,
          this.playerHitBoss,
          null,
          this
      );
      
      // Set up player tool to hit boss when space key pressed
      this.input.keyboard.on('keydown-SPACE', this.attackBoss, this);
      
      // Set up collision with bullets (added by boss)
      this.bullets = this.physics.add.group();
      this.physics.add.collider(
          this.player,
          this.bullets,
          this.playerHitBullet,
          null,
          this
      );
  }
  
  createToolSprites() {
      // Check for selected weapon
      if (!window.gameState.selectedTool) {
          // If no weapon was selected, set a default
          window.gameState.selectedTool = {
              name: 'Laser Beam',
              image: 'laser',
              strength: 10
          };
      }
      
      // Create a list to track weapon sprites
      this.toolSprites = [];
      
      // Create the selected weapon as a sprite that orbits the player
      const angle = 0;
      const distanceFromPlayer = 60;
      
      // Calculate position around player
      const x = this.player.x + Math.cos(angle) * distanceFromPlayer;
      const y = this.player.y + Math.sin(angle) * distanceFromPlayer;
      
      // Create the weapon sprite
      const weaponSprite = this.add.image(x, y, window.gameState.selectedTool.image)
          .setScale(0.3)
          .setDepth(11);
      
      // Store reference to the weapon
      this.toolSprites.push({
          sprite: weaponSprite,
          angle: angle,
          distance: distanceFromPlayer,
          type: window.gameState.selectedTool.image
      });
      
      // Update weapon position in game loop
      this.events.on('update', () => {
          if (this.player && this.player.active) {
              this.updateToolPositions();
          }
      });
  }
  
  updateToolPositions() {
      // Update each tool's position to orbit around the player
      this.toolSprites.forEach(tool => {
          // Increment the angle to create orbit effect
          tool.angle += 0.01;
          
          // Calculate new position
          const x = this.player.x + Math.cos(tool.angle) * tool.distance;
          const y = this.player.y + Math.sin(tool.angle) * tool.distance;
          
          // Update sprite position
          tool.sprite.x = x;
          tool.sprite.y = y;
      });
  }

  createUI() {
      // Add boss name
      this.add.text(
          this.cameras.main.width * 0.7, 
          this.cameras.main.height * 0.15, 
          'MAZE MASTER', 
          {
              font: '48px Arial',
              fill: '#ffffff',
              stroke: '#000000',
              strokeThickness: 6
          }
      ).setOrigin(0.5);
      
      // Add player health text
      this.add.text(
          this.cameras.main.width * 0.3, 
          this.cameras.main.height * 0.15, 
          'PLAYER', 
          {
              font: '36px Arial',
              fill: '#ffffff',
              stroke: '#000000',
              strokeThickness: 4
          }
      ).setOrigin(0.5);
      
      // Add instructions
      this.instructionText = this.add.text(
          this.cameras.main.width / 2, 
          this.cameras.main.height - 100, 
          'Press SPACE to attack with your weapon!', 
          {
              font: '28px Arial',
              fill: '#ffffff',
              backgroundColor: '#000000',
              padding: { x: 16, y: 8 }
          }
      ).setOrigin(0.5);
      
      // Add special attack button
      this.specialAttackButton = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height - 50,
          300,
          60,
          0x880088
      ).setInteractive();
      
      this.specialAttackText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height - 50,
          'SPECIAL ATTACK',
          {
              font: '24px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
      this.specialAttackButton.on('pointerdown', () => {
          this.useSpecialAttack();
      });
      
      // Add weapon info
      this.add.text(
          50, 
          this.cameras.main.height - 80, 
          'Selected Weapon:', 
          {
              font: '20px Arial',
              fill: '#ffffff'
          }
      );
      
      // Show selected weapon name and damage
      if (window.gameState.selectedTool) {
          this.add.text(
              60, 
              this.cameras.main.height - 50, 
              window.gameState.selectedTool.name, 
              {
                  font: '18px Arial',
                  fill: '#ffff00'
              }
          );
          
          this.add.text(
              60, 
              this.cameras.main.height - 25, 
              `Damage: ${window.gameState.selectedTool.strength}`, 
              {
                  font: '18px Arial',
                  fill: '#00ff00'
              }
          );
      }
  }

  startIntroSequence() {
      // Show boss introduction dialogue
      const dialogue = [
          "So you've made it through my maze...",
          "But this is where your journey ends!",
          "No one has ever defeated me!",
          "Your puny tools are no match for my power!"
      ];
      
      let lineIndex = 0;
      let dialogueBox = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          this.cameras.main.width * 0.7,
          150,
          0x000000,
          0.8
      );
      
      let dialogueText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          dialogue[lineIndex],
          {
              font: '28px Arial',
              fill: '#ffffff',
              align: 'center'
          }
      ).setOrigin(0.5);
      
      // Function to show next dialogue line
      const showNextLine = () => {
          lineIndex++;
          if (lineIndex < dialogue.length) {
              dialogueText.setText(dialogue[lineIndex]);
              this.time.delayedCall(2000, showNextLine);
          } else {
              // End of dialogue, start battle
              dialogueBox.destroy();
              dialogueText.destroy();
              this.startBattle();
          }
      };
      
      // Start dialogue sequence
      this.time.delayedCall(2000, showNextLine);
  }

  startBattle() {
      // Start boss attack pattern
      this.bossAttackTimer = this.time.addEvent({
          delay: 2000,
          callback: () => {
              if (this.boss && this.boss.active) {
                  this.boss.attack(this.player);
              }
          },
          callbackScope: this,
          loop: true
      });
      
      // Make sure player can attack
      this.playerCanAttack = true;
      
      // Show battle message
      this.showMessage('BATTLE START!');
  }

  attackBoss() {
      // Check if player can attack
      if (!this.playerCanAttack || !this.boss || !this.boss.active) return;
      
      // Check if player is close enough to the boss
      const distance = Phaser.Math.Distance.Between(
          this.player.x, this.player.y,
          this.boss.x, this.boss.y
      );
      
      if (distance > 200) {
          this.showMessage('Get closer to attack!');
          return;
      }
      
      // Calculate damage based on selected weapon
      let damage = window.gameState.selectedTool ? window.gameState.selectedTool.strength : 5;
      
      // Apply damage to boss
      this.boss.takeDamage(damage);
      
      // Show damage number
      this.showDamageNumber(this.boss.x, this.boss.y, damage);
      
      // Flash weapon used for attack
      this.toolSprites.forEach(tool => {
          this.tweens.add({
              targets: tool.sprite,
              alpha: 0.2,
              scale: 0.5,
              duration: 100,
              yoyo: true,
              repeat: 2
          });
      });
      
      // Set cooldown on player attack
      this.playerCanAttack = false;
      this.time.delayedCall(1000, () => {
          this.playerCanAttack = true;
      });
      
      // Check if boss is defeated
      if (this.boss.health <= 0) {
          this.gameWin();
      }
  }

  useSpecialAttack() {
      // Check if player has enough tools
      if (window.gameState.collectedTools.length < 3) {
          this.showMessage('You need all 3 tools for special attack!');
          return;
      }
      
      // Check if in cooldown
      if (!this.playerCanAttack) {
          this.showMessage('Special attack is recharging!');
          return;
      }
      
      // Apply massive damage to boss
      const damage = 30;
      this.boss.takeDamage(damage);
      
      // Visual effect for special attack
      this.cameras.main.shake(500, 0.01);
      this.cameras.main.flash(500, 255, 255, 255);
      
      // Show large damage number
      this.showDamageNumber(this.boss.x, this.boss.y, damage, 0x00ffff);
      
      // Special attack animation with all tools
      this.toolSprites.forEach(tool => {
          // Launch tool at boss
          this.tweens.add({
              targets: tool.sprite,
              x: this.boss.x,
              y: this.boss.y,
              scale: 0.8,
              duration: 500,
              ease: 'Power2',
              onComplete: () => {
                  // Return to player
                  this.tweens.add({
                      targets: tool.sprite,
                      x: this.player.x,
                      y: this.player.y,
                      scale: 0.3,
                      duration: 300,
                      ease: 'Back'
                  });
              }
          });
      });
      
      // Set longer cooldown for special attack
      this.playerCanAttack = false;
      this.time.delayedCall(5000, () => {
          this.playerCanAttack = true;
      });
      
      // Check if boss is defeated
      if (this.boss.health <= 0) {
          this.gameWin();
      }
  }

  showDamageNumber(x, y, amount, color = 0xffff00) {
      // Show floating damage number
      const damageText = this.add.text(x, y, amount.toString(), {
          font: '32px Arial',
          fill: '#ffffff',
          stroke: color,
          strokeThickness: 6
      }).setOrigin(0.5);
      
      // Animate the damage number floating up and fading
      this.tweens.add({
          targets: damageText,
          y: y - 100,
          alpha: 0,
          scale: 1.5,
          duration: 1000,
          ease: 'Power2',
          onComplete: () => {
              damageText.destroy();
          }
      });
  }

  playerHitBoss(player, boss) {
      // Only trigger damage if not recently hit
      if (player.invulnerable) return;
      
      // Player takes damage when touching boss
      player.takeDamage(15);
      
      // Show hit message
      this.showMessage('Ouch! Too close to the boss!');
      
      // Knock player back
      const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
      const knockbackForce = 400;
      player.body.velocity.x = Math.cos(angle) * knockbackForce;
      player.body.velocity.y = Math.sin(angle) * knockbackForce;
      
      // Check if player is defeated
      if (player.health <= 0) {
          this.gameOver();
      }
  }

  playerHitBullet(player, bullet) {
      // Only trigger damage if not recently hit
      if (player.invulnerable) return;
      
      // Player takes damage
      player.takeDamage(10);
      
      // Remove the bullet
      bullet.destroy();
      
      // Show hit message
      this.showMessage('Hit by projectile! -10 health');
      
      // Small knockback
      const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, player.x, player.y);
      const knockbackForce = 200;
      player.body.velocity.x = Math.cos(angle) * knockbackForce;
      player.body.velocity.y = Math.sin(angle) * knockbackForce;
      
      // Check if player is defeated
      if (player.health <= 0) {
          this.gameOver();
      }
  }

  gameOver() {
      // Stop all timers
      if (this.bossAttackTimer) {
          this.bossAttackTimer.remove();
      }
      
      // Can't attack anymore
      this.playerCanAttack = false;
      
      // Show game over message
      this.cameras.main.shake(1000, 0.02);
      
      const gameOverText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          'GAME OVER',
          {
              font: '64px Arial',
              fill: '#ff0000',
              stroke: '#000000',
              strokeThickness: 8
          }
      ).setOrigin(0.5);
      
      // Add retry button
      const retryButton = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 100,
          200,
          60,
          0x006699
      ).setInteractive();
      
      const retryText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 100,
          'Try Again',
          {
              font: '24px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
      retryButton.on('pointerdown', () => {
          this.scene.start('Level1Scene');
      });
  }
  
  gameWin() {
      // Stop all timers
      if (this.bossAttackTimer) {
          this.bossAttackTimer.remove();
      }
      
      // Can't attack anymore
      this.playerCanAttack = false;
      
      // Show victory flash
      this.cameras.main.flash(1000, 255, 255, 255);
      
      // Victory text
      const victoryText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2,
          'VICTORY!',
          {
              font: '64px Arial',
              fill: '#00ff00',
              stroke: '#000000',
              strokeThickness: 8
          }
      ).setOrigin(0.5);
      
      // Show final score
      this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 80,
          `Final Score: ${window.gameState.score}`,
          {
              font: '32px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
      // Add play again button
      const playAgainButton = this.add.rectangle(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 160,
          240,
          60,
          0x006699
      ).setInteractive();
      
      const playAgainText = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 + 160,
          'Play Again',
          {
              font: '24px Arial',
              fill: '#ffffff'
          }
      ).setOrigin(0.5);
      
      playAgainButton.on('pointerdown', () => {
          this.scene.start('MenuScene');
      });
  }

  showMessage(text) {
      // Create a message that appears briefly
      const message = this.add.text(
          this.cameras.main.width / 2,
          this.cameras.main.height / 2 - 200,
          text,
          {
              font: '24px Arial',
              fill: '#ffffff',
              backgroundColor: '#000000',
              padding: { x: 16, y: 8 }
          }
      ).setOrigin(0.5).setDepth(100);
      
      // Remove after a delay
      this.time.delayedCall(2000, () => {
          message.destroy();
      });
  }
}