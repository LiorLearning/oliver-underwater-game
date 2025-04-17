export class HealthManager {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        
        // Player health properties
        this.maxHealth = 100;
        this.health = window.gameState.health;
        this.invulnerable = false;
        this.invulnerableTime = 1000; // ms
    }
    
    takeDamage(amount = 10) {
        // Check if player is currently invulnerable
        if (this.invulnerable) return;
        
        // Apply damage to global health
        window.gameState.health = Math.max(0, window.gameState.health - amount);
        this.health = window.gameState.health;
        
        // Flash red when taking damage
        this.player.setTint(0xff0000);
        
        // Set invulnerable briefly
        this.invulnerable = true;
        
        // Clear tint and reset invulnerability after a delay
        this.scene.time.delayedCall(this.invulnerableTime, () => {
            this.player.clearTint();
            this.invulnerable = false;
        });
        
        // Check if health is depleted
        if (window.gameState.health <= 0) {
            this.die();
        }
    }
    
    heal(amount = 10) {
        // Increase health but don't exceed max
        window.gameState.health = Math.min(this.maxHealth, window.gameState.health + amount);
        this.health = window.gameState.health;
        
        // Flash green to indicate healing
        this.player.setTint(0x00ff00);
        
        // Clear tint after a delay
        this.scene.time.delayedCall(500, () => {
            this.player.clearTint();
        });
    }
    
    die() {
        // Player death logic
        this.scene.time.delayedCall(500, () => {
            // Restart the level
            this.scene.scene.restart();
        });
    }
} 