#!/bin/bash

# Create the main HTML file
touch ./index.html

# Create assets directory structure
mkdir -p ./assets/images

# Create image files
touch ./assets/images/bg.png
touch ./assets/images/hero.png
touch ./assets/images/villain.png
touch ./assets/images/sidekick.png
touch ./assets/images/assistant.png

# Create source code directory structure
mkdir -p ./src/scenes
mkdir -p ./src/objects
mkdir -p ./src/utils

# Create main JavaScript files
touch ./src/main.js
touch ./src/config.js

# Create scene files
touch ./src/scenes/BootScene.js
touch ./src/scenes/PreloadScene.js
touch ./src/scenes/MenuScene.js
touch ./src/scenes/Level1Scene.js
touch ./src/scenes/PuzzleScene.js
touch ./src/scenes/BossScene.js

# Create object class files
touch ./src/objects/Player.js
touch ./src/objects/Sidekick.js
touch ./src/objects/Assistant.js
touch ./src/objects/Collectible.js
touch ./src/objects/Boss.js

# Create utility files
touch ./src/utils/MathPuzzle.js
touch ./src/utils/Animation.js

echo "Project structure for . has been created successfully!"
