import { Collectible } from '../objects/Collectible.js';

export class ToolManager {
    constructor(scene) {
        this.scene = scene;
        this.toolTypes = [
            { type: 'wrench', name: 'Wrench' },
            { type: 'hammer', name: 'Hammer' },
            { type: 'screwdriver', name: 'Screwdriver' }
        ];
    }

    createTools() {
        // Create a group for tool collectibles
        this.scene.tools = this.scene.physics.add.group();
        
        // Get safe positions for tools
        const toolPositions = this.scene.mazeGenerator.getSafePositions(3);
        
        // Create tools at these positions
        this.toolTypes.forEach((toolInfo, index) => {
            if (index < toolPositions.length) {
                this._createTool(toolInfo, toolPositions[index]);
            }
        });
    }

    _createTool(toolInfo, pos) {
        // Create the tool collectible
        const tool = new Collectible(this.scene, pos.x, pos.y, 'collectible', toolInfo.type);
        
        // Set custom properties for the tool
        tool.toolName = toolInfo.name;
        
        // Add visual effects
        this._addToolVisualEffects(tool, pos, toolInfo);
        
        // Add to the tools group
        this.scene.tools.add(tool);
    }

    _addToolVisualEffects(tool, pos, toolInfo) {
        // Add a glowing effect to make tools more visible
        this.scene.tweens.add({
            targets: tool,
            alpha: 0.7,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
        
        // Add particle effect around the tool
        const particles = this.scene.add.particles(pos.x, pos.y, 'particle', {
            speed: { min: 30, max: 60 },
            scale: { start: 0.2, end: 0 },
            lifespan: 2000,
            blendMode: 'ADD',
            frequency: 200,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 30), quantity: 8 }
        });
        
        // Make the particles follow the tool
        this.scene.physics.world.enable(particles);
        particles.x = tool.x;
        particles.y = tool.y;
        
        // Add a visual label indicating that this is a tool
        const toolLabel = this.scene.add.text(pos.x, pos.y - 50, `${toolInfo.name}`, {
            font: '18px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);
        
        // Make the label follow the tool's hover animation
        this.scene.tweens.add({
            targets: toolLabel,
            y: toolLabel.y + 8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
} 