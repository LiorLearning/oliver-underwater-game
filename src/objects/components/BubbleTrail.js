export class BubbleTrail {
    constructor(player, scene) {
        this.player = player;
        this.scene = scene;
        
        // Create particle system for bubble trail effect
        this.bubbles = scene.add.particles(0, 0, 'particle', {
            speed: { min: 5, max: 20 },
            scale: { start: 0.2, end: 0 },
            lifespan: 2000,
            alpha: { start: 0.5, end: 0 },
            tint: 0x3385ff, // Light blue tint
            blendMode: 'ADD',
            frequency: -1 // Manual control
        });
    }
    
    update() {
        // Only emit bubbles when moving
        const speed = Math.sqrt(
            Math.pow(this.player.body.velocity.x, 2) + 
            Math.pow(this.player.body.velocity.y, 2)
        );
        
        if (speed > 20) {
            // Emit bubbles from player position
            this.bubbles.emitParticle(1, this.player.x, this.player.y);
        }
    }
    
    destroy() {
        if (this.bubbles) {
            this.bubbles.destroy();
        }
    }
} 