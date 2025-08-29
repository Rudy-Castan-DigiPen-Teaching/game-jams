const EMPTY      = ".";
const GROUND     = "#";
const DECOR      = "&";
const SPAWN      = "@";
const TRAP       = "^";
const ITEM       = "*";
const DOOR       = "D";
const BOUNCY     = "~";
const LEFT_RAMP  = "/";
const RIGHT_RAMP = "\\";

function getColorFromTile(tile)
{
    switch (tile)
    {
        case EMPTY: return color(40, 40, 40);
        case TRAP: return color(224, 64, 64);
        case DECOR: return color(64, 224, 64);
        case GROUND: return color(224, 224, 224);
        case SPAWN: return color(255, 255, 0);
        case ITEM: return color("#9932CC");
        case DOOR: return color("#8B4513");
        case BOUNCY:
        case LEFT_RAMP:
        case RIGHT_RAMP: return color(0, 191, 255); // Deep sky blue
        default: return color(random(255), random(255), random(255));
    }
}

function drawTile(tile, x, y, w, h)
{
    fill(getColorFromTile(tile));
    switch (tile)
    {
        case LEFT_RAMP: triangle(x + w, y, x, y + h, x + w, y + h); break;
        case RIGHT_RAMP: triangle(x, y, x, y + h, x + w, y + h); break;
        default: rect(x, y, w, h); break;
    }
}

function drawTileInDetail(tile, x, y, w, h)
{
    push();
    fill(getColorFromTile(tile));
    switch (tile)
    {
        case GROUND:
            // Stone brick pattern with repeating tiles
            fill(getColorFromTile(tile));
            rect(x, y, w, h);
            stroke(180);
            strokeWeight(1);

            // Create a repeating brick pattern
            let brickW = 20; // Fixed brick width
            let brickH = 10; // Fixed brick height

            for (let by = y; by < y + h; by += brickH)
            {
                for (let bx = x; bx < x + w; bx += brickW)
                {
                    // Alternate brick offset every other row
                    let offsetRow = Math.floor((by - y) / brickH) % 2;
                    let brickX    = bx + (offsetRow * brickW / 2);

                    // Draw brick outline if it's within bounds
                    if (brickX < x + w && by < y + h)
                    {
                        let brickRight  = Math.min(brickX + brickW, x + w);
                        let brickBottom = Math.min(by + brickH, y + h);

                        // Horizontal mortar lines
                        if (by > y)
                            line(Math.max(brickX, x), by, brickRight, by);
                        // Vertical mortar lines
                        if (brickX > x)
                            line(brickX, by, brickX, brickBottom);
                    }
                }
            }
            break;

        case TRAP:
            // Animated lava trap
            fill(getColorFromTile(tile));
            rect(x, y, w, h);

            // Create animated lava bubbles with more variation
            let baseBubbleSize = 8;
            let bubbleSpacing  = 12;
            let frame          = frameCount / 5.0;

            for (let by = y; by < y + h; by += bubbleSpacing)
            {
                for (let bx = x; bx < x + w; bx += bubbleSpacing)
                {
                    // Add random-like offset based on position (pseudo-random but consistent)
                    let seed          = (bx * 73 + by * 37) % 1000;
                    let offsetX       = (seed % 7) - 3; // Random offset -3 to 3
                    let offsetY       = ((seed * 13) % 7) - 3;
                    let sizeVariation = ((seed * 17) % 5) + 1; // Size variation 1-5

                    let bubbleX = bx + offsetX;
                    let bubbleY = by + offsetY;

                    if (bubbleX > x && bubbleX < x + w - baseBubbleSize && bubbleY > y && bubbleY < y + h - baseBubbleSize)
                    {
                        // Unique time offset and speed for each bubble
                        let timeOffset = seed * 0.01;
                        let animSpeed  = 0.1 + (seed % 3) * 0.05; // Different speeds

                        let bubbleSize = baseBubbleSize + sizeVariation + sin(frame * animSpeed + timeOffset) * 3;

                        // Main lava bubble with varied colors
                        let redIntensity = 220 + ((seed * 23) % 35); // 220-255
                        let greenVar     = 60 + sin(frame * animSpeed + timeOffset) * 30;
                        fill(redIntensity, greenVar, 0);
                        ellipse(bubbleX, bubbleY, bubbleSize, bubbleSize);

                        // Inner core - only draw on larger bubbles
                        if (bubbleSize > baseBubbleSize + 2)
                        {
                            fill(255, 160 + sin(frame * (animSpeed * 1.5) + timeOffset) * 60, 20);
                            ellipse(bubbleX, bubbleY, bubbleSize * 0.6, bubbleSize * 0.6);

                            // Glowing center - only on biggest bubbles
                            if (bubbleSize > baseBubbleSize + 4)
                            {
                                fill(255, 255, 80 + sin(frame * (animSpeed * 2) + timeOffset) * 120);
                                ellipse(bubbleX, bubbleY, bubbleSize * 0.25, bubbleSize * 0.25);
                            }
                        }
                    }
                }
            }

            // Animated flowing lava streams
            stroke(200 + sin(frame * 0.1) * 30, 40, 0);
            strokeWeight(2 + sin(frame * 0.05) * 1);
            for (let i = 0; i < 3; i++)
            {
                let streamY    = y + (i + 0.5) * h / 3;
                let waveOffset = sin(frame * 0.08 + i) * 3;
                line(x, streamY + waveOffset, x + w, streamY - waveOffset);
            }
            break;

        case DECOR:
            // Fractal-like branching pattern
            fill(getColorFromTile(tile));
            // rect(x, y, w, h);

            // Function to draw a recursive branch
            function drawBranch(startX, startY, endX, endY, depth, maxDepth)
            {
                if (depth > maxDepth)
                    return;

                // Draw the main branch
                stroke(40 + depth * 20, 120 + depth * 15, 40 + depth * 10);
                strokeWeight(maxDepth - depth + 1);
                line(startX, startY, endX, endY);

                if (depth < maxDepth)
                {
                    // Calculate branch length and direction
                    let branchLength = dist(startX, startY, endX, endY) * 0.7;
                    let mainAngle    = atan2(endY - startY, endX - startX);

                    // Create two sub-branches with different angles
                    let leftAngle  = mainAngle - PI / 6;
                    let rightAngle = mainAngle + PI / 6;

                    let leftEndX  = endX + cos(leftAngle) * branchLength;
                    let leftEndY  = endY + sin(leftAngle) * branchLength;
                    let rightEndX = endX + cos(rightAngle) * branchLength;
                    let rightEndY = endY + sin(rightAngle) * branchLength;

                    // Recursively draw sub-branches
                    drawBranch(endX, endY, leftEndX, leftEndY, depth + 1, maxDepth);
                    drawBranch(endX, endY, rightEndX, rightEndY, depth + 1, maxDepth);
                }
            }

            // Draw multiple fractal trees across the tile
            let treeSpacing = 24;
            for (let ty = y; ty < y + h; ty += treeSpacing)
            {
                for (let tx = x; tx < x + w; tx += treeSpacing)
                {
                    // Pseudo-random variation for each tree space
                    let seed        = (tx * 67 + ty * 41) % 983;
                    let numBranches = 1 + (seed % 3);

                    for (let b = 0; b < numBranches; b++)
                    {
                        // Different seed for each branch in the space
                        let branchSeed = (seed + b * 137) % 997;
                        let offsetX    = (branchSeed % 16) - 8; // Larger spread for multiple branches

                        let treeX = tx + treeSpacing / 2 + offsetX;
                        let treeY = ty + treeSpacing; // Start from bottom of tile space

                        if (treeX > x + 5 && treeX < x + w - 5 && treeY > y + 5 )
                        {
                            // Main trunk direction (mostly upward with some variation)
                            let trunkAngle  = -PI / 2 + ((branchSeed * 11) % 60 - 30) * PI / 180; // ±30 degrees
                            let minLength   = 8 + (branchSeed % 4);                               // Current min length
                            let trunkLength = minLength + (branchSeed % 4) * 10;                  // Min to min+3 length

                            let trunkEndX = treeX + cos(trunkAngle) * trunkLength;
                            let trunkEndY = treeY + sin(trunkAngle) * trunkLength;

                            // Draw the fractal tree
                            drawBranch(treeX, treeY, trunkEndX, trunkEndY, 0, 2);
                        }
                    }
                }
            }
            break;

        case DOOR:
            // Wooden door with handle and panels
            fill(getColorFromTile(tile));
            rect(x, y, w, h);
            // Door panels
            stroke(101, 67, 33);
            strokeWeight(2);
            rect(x + w / 8, y + h / 8, 3 * w / 4, h / 3);
            rect(x + w / 8, y + 5 * h / 8, 3 * w / 4, h / 4);
            // Door handle
            fill(200, 180, 0);
            ellipse(x + 3 * w / 4, y + h / 2, w / 8, h / 8);
            break;

        case ITEM:
            // Sparkling collectible item
            fill(getColorFromTile(tile));
            ellipse(x + w / 2, y + h / 2, w * 0.7, h * 0.7);
            // Add sparkles
            fill(255, 255, 200);
            for (let i = 0; i < 4; i++)
            {
                let angle    = (i * TWO_PI) / 4 + frameCount * 0.1;
                let sparkleX = x + w / 2 + cos(angle) * w / 3;
                let sparkleY = y + h / 2 + sin(angle) * h / 3;
                ellipse(sparkleX, sparkleY, 3, 3);
            }
            stroke(255);
            strokeWeight(1);
            line(x + w / 4, y + h / 4, x + 3 * w / 4, y + 3 * h / 4);
            line(x + 3 * w / 4, y + h / 4, x + w / 4, y + 3 * h / 4);
            break;

        case BOUNCY:
            // Bouncy tile with arrow patterns indicating upward bounce
            fill(getColorFromTile(tile));
            rect(x, y, w, h);

            // Draw bouncy arrows across the surface
            stroke(0, 220, 255);
            strokeWeight(2);

            let arrowSpacing = 16;
            let arrowHeight  = 8;
            let arrowWidth   = 6;

            for (let ay = y + arrowSpacing / 2; ay < y + h; ay += arrowSpacing)
            {
                for (let ax = x + arrowSpacing / 2; ax < x + w; ax += arrowSpacing)
                {
                    // Offset every other row for better distribution
                    let offsetRow = Math.floor((ay - y) / arrowSpacing) % 2;
                    let arrowX    = ax + (offsetRow * arrowSpacing / 2);

                    if (arrowX + arrowWidth / 2 < x + w && ay + arrowHeight / 2 < y + h)
                    {
                        // Draw upward pointing arrow
                        let tipX   = arrowX;
                        let tipY   = ay - arrowHeight / 2;
                        let leftX  = arrowX - arrowWidth / 2;
                        let leftY  = ay + arrowHeight / 2;
                        let rightX = arrowX + arrowWidth / 2;
                        let rightY = ay + arrowHeight / 2;


                        // Arrow head (triangle pointing up)
                        line(tipX, tipY, leftX, leftY);
                        line(tipX, tipY, rightX, rightY);
                        line(leftX, leftY, rightX, rightY);
                    }
                }
            }


            break;

        case LEFT_RAMP:
            // Diagonal ramp with texture lines
            fill(getColorFromTile(tile));
            triangle(x + w, y, x, y + h, x + w, y + h);
            stroke(0, 160, 220);
            strokeWeight(2);
            // Add diagonal texture lines
            for (let i = 1; i < 4; i++)
            {
                let t = i / 4;
                line(x + t * w, y + h, x + w, y + t * h);
            }
            break;

        case RIGHT_RAMP:
            // Diagonal ramp with texture lines
            fill(getColorFromTile(tile));
            triangle(x, y, x, y + h, x + w, y + h);
            stroke(0, 160, 220);
            strokeWeight(2);
            // Add diagonal texture lines
            for (let i = 1; i < 4; i++)
            {
                let t = i / 4;
                line(x + (1 - t) * w, y + h, x, y + t * h);
            }
            break;
        default: rect(x, y, w, h); break;
    }
    pop();
}

class LevelEditor
{
    constructor()
    {
        this.tileSizes = {
            tiny : { w : 20, h : 12},
            small : { w : 40, h : 24},
            medium : { w : 80, h : 48},
            large : {w : 160, h : 96},
        };

        this.levels           = {};
        this.currentLevelName = "default";
        this.tileMode         = EMPTY;
        this.tileSize         = undefined;

        // Cursor position (in tile coordinates)
        this.cursorX = 0;
        this.cursorY = 0;

        this.gSaveButton        = undefined;
        this.gDownloadButton    = undefined;
        this.gLevelSelect       = undefined;
        this.gSizeSelect        = undefined;
        this.gDimension         = this.tileSizes.tiny;
        this.gNewLevelButton    = undefined;
        this.gRenameLevelButton = undefined;

        this.level = {
            width : this.tileSizes.medium.w,
            height : this.tileSizes.medium.h,
            tiles : [],
        };
    }

    setup(all_levels, current_level_name)
    {
        this.loadLevel(all_levels, current_level_name);
        this.tileSize = width / this.level.width;
        this.createUI();
    }

    draw()
    {
        background(40);
        this.tileSize = width / this.level.width;
        this.drawLevel();
        this.drawCursor();
    }

    drawLevel()
    {
        push();
        for (let y = 0; y < this.level.height; y++)
        {
            for (let x = 0; x < this.level.width; x++)
            {
                let tile = this.level.tiles[y * this.level.width + x];
                if (tile !== EMPTY)
                {
                    drawTile(tile, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
        pop();
    }

    drawCursor()
    {
        // Clamp cursor to level bounds
        this.cursorX = constrain(this.cursorX, 0, this.level.width - 1);
        this.cursorY = constrain(this.cursorY, 0, this.level.height - 1);

        push();
        stroke(255, 127);
        strokeWeight(3);
        drawTile(this.tileMode, this.cursorX * this.tileSize, this.cursorY * this.tileSize, this.tileSize, this.tileSize);
        pop();
    }

    mousePressed()
    {
        mouseMoved();
        this.markLevel(this.cursorX, this.cursorY);
    }

    mouseDragged()
    {
        mouseMoved();
        this.markLevel(this.cursorX, this.cursorY);
    }

    mouseMoved()
    {
        // Update cursor position based on mouse
        this.cursorX = floor(mouseX / this.tileSize);
        this.cursorY = floor(mouseY / this.tileSize);
    }

    keyPressed()
    {
        if (keyIsDown(32)) // Space key is pressed while moving
        {
            this.markLevel(this.cursorX, this.cursorY);
        }
    }

    keyReleased()
    {
        // Arrow key navigation
        if (key === "w" || keyCode === UP_ARROW)
        {
            this.cursorY = max(0, this.cursorY - 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (key === "s" || keyCode === DOWN_ARROW)
        {
            this.cursorY = min(this.level.height - 1, this.cursorY + 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (key === "a" || keyCode === LEFT_ARROW)
        {
            this.cursorX = max(0, this.cursorX - 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (key === "d" || keyCode === RIGHT_ARROW)
        {
            this.cursorX = min(this.level.width - 1, this.cursorX + 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        // Arrow key navigation (same as WASD)
        else if (keyCode === UP_ARROW)
        {
            this.cursorY = max(0, this.cursorY - 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (keyCode === DOWN_ARROW)
        {
            this.cursorY = min(this.level.height - 1, this.cursorY + 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (keyCode === LEFT_ARROW)
        {
            this.cursorX = max(0, this.cursorX - 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        else if (keyCode === RIGHT_ARROW)
        {
            this.cursorX = min(this.level.width - 1, this.cursorX + 1);
            if (keyIsDown(32)) // Space key is pressed while moving
            {
                this.markLevel(this.cursorX, this.cursorY);
            }
        }
        // Space or Enter to place tile
        else if (key === " " || keyCode === ENTER)
        {
            this.markLevel(this.cursorX, this.cursorY);
        }
        // Tile selection keys
        else if (key === "0")
        {
            this.tileMode = EMPTY;
        }
        else if (key === "1")
        {
            this.tileMode = GROUND;
        }
        else if (key === "2")
        {
            this.tileMode = DECOR;
        }
        else if (key === "3")
        {
            this.tileMode = SPAWN;
        }
        else if (key === "4")
        {
            this.tileMode = TRAP;
        }
        else if (key === "5")
        {
            this.tileMode = ITEM;
        }
        else if (key === "6")
        {
            this.tileMode = DOOR;
        }
        else if (key === "7")
        {
            this.tileMode = BOUNCY;
        }
        else if (key === "8")
        {
            if (this.tileMode == LEFT_RAMP)
                this.tileMode = RIGHT_RAMP;
            else
                this.tileMode = LEFT_RAMP;
        }
    }

    markLevel(tileX, tileY)
    {
        if (tileX >= 0 && tileX < this.level.width && tileY >= 0 && tileY < this.level.height)
        {
            this.level.tiles[tileY * this.level.width + tileX] = this.tileMode;
        }
    }

    loadLevel(all_levels, current_level_name)
    {
        this.levels           = all_levels || {};
        this.currentLevelName = current_level_name || "default";
        if (!(this.currentLevelName in this.levels))
        {
            this.levels[this.currentLevelName] = {
                width : this.tileSizes.medium.w,
                height : this.tileSizes.medium.h,
                tiles : new Array(this.tileSizes.medium.w * this.tileSizes.medium.h).fill(EMPTY),
            };
        }
        this.level = this.levels[this.currentLevelName];
    }

    updateLevelSelect(gLevelSelect)
    {
        gLevelSelect.html("");
        for (let name in this.levels)
        {
            gLevelSelect.option(name);
        }
        gLevelSelect.value(this.currentLevelName);
    }

    createUI()
    {
        this.gSaveButton = createButton("Save Level");
        this.gSaveButton.position(10, height + 10);
        this.gSaveButton.mousePressed(() => {
            gCurrentLevelName = this.currentLevelName;
            SaveLevels();
        });

        this.gDownloadButton = createButton("Download Levels");
        this.gDownloadButton.position(this.gSaveButton.width + 20, height + 10);
        this.gDownloadButton.mousePressed(() => this.downloadLevels());

        this.gLevelSelect = createSelect();
        this.gLevelSelect.position(10, height + 40);
        this.gLevelSelect.changed(() => {
            this.currentLevelName = this.gLevelSelect.value();
            if (!this.levels[this.currentLevelName])
            {
                this.levels[this.currentLevelName] = {
                    width : this.tileSizes.medium.w,
                    height : this.tileSizes.medium.h,
                    tiles : new Array(this.tileSizes.medium.w * this.tileSizes.medium.h).fill(EMPTY),
                };
            }
            this.level    = this.levels[this.currentLevelName];
            this.tileSize = width / this.level.width;
        });
        this.updateLevelSelect(this.gLevelSelect);

        this.gDeleteCurrentLevel = createButton("Delete Current Level");
        this.gDeleteCurrentLevel.position(120, height + 40);
        this.gDeleteCurrentLevel.mousePressed(() => {
            if (this.currentLevelName != "default")
            {
                // Remove from in-memory object
                gAllLevels       = Object.fromEntries(Object.entries(gAllLevels).filter(([ k ]) => k !== this.currentLevelName));
                // Remove from localStorage
                let cachedLevels = JSON.parse(localStorage.getItem("levels") || "{}");
                delete cachedLevels[this.currentLevelName];
                localStorage.setItem("levels", JSON.stringify(cachedLevels));
            }
            this.levels           = gAllLevels;
            this.level            = gAllLevels["default"];
            this.currentLevelName = "default";
            gCurrentLevelName     = "default";
            this.updateLevelSelect(this.gLevelSelect);
        });

        this.gRenameLevelButton = createButton("Rename Level");
        this.gRenameLevelButton.position(270, height + 40);
        this.gRenameLevelButton.mousePressed(() => {
            if (this.currentLevelName != "default")
            {
                let new_name = prompt("Enter new name for level:", this.currentLevelName);
                if (new_name && new_name !== this.currentLevelName && !this.levels[new_name])
                {
                    // Copy level data to new name
                    this.levels[new_name] = {...this.levels[this.currentLevelName]};
                    gAllLevels[new_name]  = {...gAllLevels[this.currentLevelName]};

                    // Remove old level
                    delete this.levels[this.currentLevelName];
                    delete gAllLevels[this.currentLevelName];

                    // Update localStorage
                    let cachedLevels = JSON.parse(localStorage.getItem("levels") || "{}");
                    if (cachedLevels[this.currentLevelName])
                    {
                        cachedLevels[new_name] = {...cachedLevels[this.currentLevelName]};
                        delete cachedLevels[this.currentLevelName];
                        localStorage.setItem("levels", JSON.stringify(cachedLevels));
                    }

                    // Update current level
                    this.currentLevelName = new_name;
                    this.level            = this.levels[new_name];
                    gCurrentLevelName     = new_name;

                    this.updateLevelSelect(this.gLevelSelect);
                    SaveLevels();
                }
                else if (new_name === this.currentLevelName)
                {
                    alert("Level name is the same!");
                }
                else if (this.levels[new_name])
                {
                    alert("Level name already exists!");
                }
            }
            else
            {
                alert("Cannot rename the default level!");
            }
        });

        this.gSizeSelect = createSelect();
        this.gSizeSelect.position(width - 80, height + 10);
        this.gSizeSelect.changed(() => { this.gDimension = this.tileSizes[this.gSizeSelect.value()]; });
        this.gSizeSelect.html("");
        let size_names = Object.keys(this.tileSizes);
        for (let k in size_names)
        {
            this.gSizeSelect.option(size_names[k]);
        }
        this.gSizeSelect.value(size_names[0]);

        this.gNewLevelButton = createButton("New Level");
        this.gNewLevelButton.position(width - 80, height + 40);
        this.gNewLevelButton.mousePressed(() => {
            let new_name = prompt("Enter new level name:") || "default";
            if (!this.levels[new_name])
            {
                this.levels[new_name] = {
                    width : this.gDimension.w,
                    height : this.gDimension.h,
                    tiles : new Array(this.gDimension.w * this.gDimension.h).fill(EMPTY),
                };
                this.currentLevelName = new_name;
                this.level            = this.levels[new_name];
                gCurrentLevelName     = this.currentLevelName;
                SaveLevels();
                this.updateLevelSelect(this.gLevelSelect);
            }
        });

        this.gMainMenuButton = createButton("Main Menu");
        this.gMainMenuButton.position(width / 2, height + 40);
        this.gMainMenuButton.mousePressed(() => {
            this.teardown();
            CurrentScene = MainMenuScene;
        });
    }

    downloadLevels()
    {
        let content = JSON.stringify(this.levels);
        let blob    = new Blob([ content ], {type : "application/json"});
        let a       = document.createElement("a");
        a.href      = URL.createObjectURL(blob);
        a.download  = "start_levels.json"; // This should now work correctly
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    teardown()
    {
        gCurrentLevelName = this.currentLevelName;
        SaveLevels();
        if (this.gSaveButton)
            this.gSaveButton.remove();
        if (this.gDownloadButton)
            this.gDownloadButton.remove();
        if (this.gLevelSelect)
            this.gLevelSelect.remove();
        if (this.gSizeSelect)
            this.gSizeSelect.remove();
        if (this.gNewLevelButton)
            this.gNewLevelButton.remove();
        if (this.gMainMenuButton)
            this.gMainMenuButton.remove();
        if (this.gDeleteCurrentLevel)
            this.gDeleteCurrentLevel.remove();
        if (this.gRenameLevelButton)
            this.gRenameLevelButton.remove();
        this.gSaveButton         = null;
        this.gDownloadButton     = null;
        this.gLevelSelect        = null;
        this.gSizeSelect         = null;
        this.gNewLevelButton     = null;
        this.gMainMenuButton     = null;
        this.gDeleteCurrentLevel = null;
        this.gRenameLevelButton  = null;
    }
}
