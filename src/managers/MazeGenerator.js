export class MazeGenerator {
    constructor(scene) {
        this.scene = scene;
        this.cellSize = 200; // Size of each maze cell
    }

    createMaze() {
        // Create the maze walls group
        this.scene.maze = this.scene.physics.add.staticGroup();
        
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
        
        // Create wall objects based on the layout
        this._createWalls(mazeLayout);
        
        // Create boundary walls
        this._createBoundaryWalls();
    }

    _createWalls(mazeLayout) {
        for (let y = 0; y < mazeLayout.length; y++) {
            for (let x = 0; x < mazeLayout[y].length; x++) {
                if (mazeLayout[y][x] === 1) {
                    // Create a wall at this position
                    const wall = this.scene.maze.create(
                        x * this.cellSize + this.cellSize/2, 
                        y * this.cellSize + this.cellSize/2, 
                        'wall'
                    );
                    
                    // Make the wall hitbox slightly smaller than visual size
                    wall.setDisplaySize(this.cellSize, this.cellSize);
                    
                    // Reduce the collision body size to widen the corridors
                    const hitboxScale = 0.85; // 85% of the original size
                    const hitboxSize = this.cellSize * hitboxScale;
                    const offset = (this.cellSize - hitboxSize) / 2;
                    
                    wall.body.setSize(hitboxSize, hitboxSize);
                    wall.body.setOffset(offset, offset);
                    wall.refreshBody();
                    
                    // Tag this wall for identification
                    wall.name = 'wall';
                }
            }
        }
    }

    _createBoundaryWalls() {
        const worldWidth = this.scene.worldWidth;
        const worldHeight = this.scene.worldHeight;
        const boundarySize = 50; // Thickness of boundary walls
        
        // Top boundary
        const topBoundary = this.scene.maze.create(worldWidth/2, -boundarySize/2, 'wall');
        topBoundary.setDisplaySize(worldWidth, boundarySize);
        topBoundary.visible = false;
        topBoundary.refreshBody();
        topBoundary.name = 'boundary';
        
        // Bottom boundary
        const bottomBoundary = this.scene.maze.create(worldWidth/2, worldHeight + boundarySize/2, 'wall');
        bottomBoundary.setDisplaySize(worldWidth, boundarySize);
        bottomBoundary.visible = false;
        bottomBoundary.refreshBody();
        bottomBoundary.name = 'boundary';
        
        // Left boundary
        const leftBoundary = this.scene.maze.create(-boundarySize/2, worldHeight/2, 'wall');
        leftBoundary.setDisplaySize(boundarySize, worldHeight);
        leftBoundary.visible = false;
        leftBoundary.refreshBody();
        leftBoundary.name = 'boundary';
        
        // Right boundary
        const rightBoundary = this.scene.maze.create(worldWidth + boundarySize/2, worldHeight/2, 'wall');
        rightBoundary.setDisplaySize(boundarySize, worldHeight);
        rightBoundary.visible = false;
        rightBoundary.refreshBody();
        rightBoundary.name = 'boundary';
    }

    // Get safe positions for placing entities (away from walls)
    getSafePositions(count) {
        // Define areas where we know there are free spaces in the maze
        const potentialSpaces = [
            { x: 300, y: 300 },    // Top-left area
            { x: 1100, y: 300 },   // Top-right area
            { x: 500, y: 1100 },   // Middle-left area
            { x: 1700, y: 700 },   // Middle-right area
            { x: 900, y: 1900 },   // Bottom-left area
            { x: 2300, y: 1500 },  // Bottom-right area
            { x: 1900, y: 1100 },  // Center-right area
            { x: 1300, y: 1500 },  // Center-bottom area
            { x: 2700, y: 700 }    // Far right area
        ];
        
        // Shuffle the potential spaces to get random positions
        const shuffledSpaces = Phaser.Utils.Array.Shuffle([...potentialSpaces]);
        
        // Return the requested number of positions
        return shuffledSpaces.slice(0, count);
    }
} 