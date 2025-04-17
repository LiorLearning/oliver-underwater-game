export class MiniMapManager {
    constructor(scene) {
        this.scene = scene;
        this.mapWidth = 260;
        this.mapHeight = 200;
        this.mapX = 1500;
        this.mapY = 120;
        this.minimapWalls = [];
        this.minimapEnemies = [];
        this.minimapTools = [];
    }

    createMiniMap() {
        this._createMinimapBackground();
        this._createMinimapMarkers();
        this._initializeMinimap();
    }

    _createMinimapBackground() {
        // Create minimap background
        this.minimap = this.scene.add.rectangle(
            this.mapX, 
            this.mapY, 
            this.mapWidth, 
            this.mapHeight, 
            0x000000, 
            0.7
        ).setScrollFactor(0).setOrigin(0.5).setDepth(20);
        
        // Create minimap frame
        this.minimapFrame = this.scene.add.rectangle(
            this.mapX, 
            this.mapY, 
            this.mapWidth, 
            this.mapHeight, 
            0xffffff
        ).setScrollFactor(0)
         .setOrigin(0.5)
         .setStrokeStyle(2, 0xffffff)
         .setDepth(20);
    }

    _createMinimapMarkers() {
        // Create player marker (make it highly visible)
        this.minimapPlayer = this.scene.add.circle(
            this.mapX, 
            this.mapY, 
            5, 
            0xffff00
        ).setScrollFactor(0).setDepth(21);
        
        // Create exit marker
        this.minimapExit = this.scene.add.rectangle(
            0, 
            0, 
            10, 
            10, 
            0xff0000
        ).setScrollFactor(0).setDepth(21);
    }

    _initializeMinimap() {
        // Add maze walls to minimap
        if (this.scene.maze) {
            this.scene.maze.getChildren().forEach(wall => {
                const marker = this.scene.add.rectangle(0, 0, 3, 3, 0x666666)
                    .setScrollFactor(0)
                    .setDepth(21);
                this.minimapWalls.push({ wall, marker });
            });
        }
        
        // Add enemies to minimap
        if (this.scene.assistants) {
            this.scene.assistants.getChildren().forEach(enemy => {
                const marker = this.scene.add.circle(0, 0, 3, 0xff0000)
                    .setScrollFactor(0)
                    .setDepth(21);
                this.minimapEnemies.push({ enemy, marker });
            });
        }
        
        // Add tools to minimap
        if (this.scene.tools) {
            this.scene.tools.getChildren().forEach(tool => {
                const marker = this.scene.add.rectangle(0, 0, 4, 4, 0x00ffff)
                    .setScrollFactor(0)
                    .setDepth(21);
                this.minimapTools.push({ tool, marker });
            });
        }
    }

    updateMiniMap() {
        this._updatePlayerMarker();
        this._updateWallMarkers();
        this._updateEnemyMarkers();
        this._updateToolMarkers();
        this._updateExitMarker();
    }

    _updatePlayerMarker() {
        if (this.scene.player && this.minimapPlayer) {
            const playerX = this.mapX + (this.scene.player.x / this.scene.worldWidth) * this.mapWidth - this.mapWidth/2;
            const playerY = this.mapY + (this.scene.player.y / this.scene.worldHeight) * this.mapHeight - this.mapHeight/2;
            this.minimapPlayer.setPosition(playerX, playerY);
        }
    }

    _updateWallMarkers() {
        this.minimapWalls.forEach(item => {
            if (item.wall.active) {
                const x = this.mapX + (item.wall.x / this.scene.worldWidth) * this.mapWidth - this.mapWidth/2;
                const y = this.mapY + (item.wall.y / this.scene.worldHeight) * this.mapHeight - this.mapHeight/2;
                item.marker.setPosition(x, y);
                item.marker.setVisible(true);
            } else {
                item.marker.setVisible(false);
            }
        });
    }

    _updateEnemyMarkers() {
        this.minimapEnemies.forEach(item => {
            if (item.enemy.active) {
                const x = this.mapX + (item.enemy.x / this.scene.worldWidth) * this.mapWidth - this.mapWidth/2;
                const y = this.mapY + (item.enemy.y / this.scene.worldHeight) * this.mapHeight - this.mapHeight/2;
                item.marker.setPosition(x, y);
                item.marker.setVisible(true);
            } else {
                item.marker.setVisible(false);
            }
        });
    }

    _updateToolMarkers() {
        this.minimapTools.forEach(item => {
            if (item.tool.active) {
                const x = this.mapX + (item.tool.x / this.scene.worldWidth) * this.mapWidth - this.mapWidth/2;
                const y = this.mapY + (item.tool.y / this.scene.worldHeight) * this.mapHeight - this.mapHeight/2;
                item.marker.setPosition(x, y);
                item.marker.setVisible(true);
            } else {
                item.marker.setVisible(false);
            }
        });
    }

    _updateExitMarker() {
        if (this.scene.exit && this.minimapExit) {
            const exitX = this.mapX + (this.scene.exit.x / this.scene.worldWidth) * this.mapWidth - this.mapWidth/2;
            const exitY = this.mapY + (this.scene.exit.y / this.scene.worldHeight) * this.mapHeight - this.mapHeight/2;
            this.minimapExit.setPosition(exitX, exitY);
        }
    }
} 