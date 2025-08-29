class Platformer
{
    constructor(the_level)
    {
        this.gameWon     = false;
        this.player      = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
        this.level       = the_level;
        this.rects       = [];
        this.decorations = [];

        // Bounce configuration
        this.bounceMultiplier = 0.5; // How much to amplify reflected velocity
        this.bounceExtraForce = 0.2; // Extra force added to bounce

        let tileSize           = PLAYER_SIZE * 1.1;
        this.tileSize          = tileSize;
        const buffer_scale     = 20;
        this.levelBounds       = new Rectangle(-tileSize * buffer_scale, -tileSize * buffer_scale, (this.level.width + 2 * buffer_scale) * tileSize, (this.level.height + 2 * buffer_scale) * tileSize);
        this.spawnPoints       = [];
        this.rects             = mergeTiles(this.level, tileSize, GROUND);
        this.traps             = mergeTiles(this.level, tileSize, TRAP);
        this.doors             = mergeTiles(this.level, tileSize, DOOR);
        this.decorations       = mergeTiles(this.level, tileSize, DECOR);
        this.bouncers          = mergeTiles(this.level, tileSize, BOUNCY);
        this.ramps             = collectTiles(this.level, tileSize, [ LEFT_RAMP, RIGHT_RAMP ]);
        this.item              = null;
        this.possibleItemSpots = [];
        this.frame             = 0;
        for (let y = 0; y < this.level.height; y++)
        {
            for (let x = 0; x < this.level.width; x++)
            {
                let tile = this.level.tiles[y * this.level.width + x];
                if (tile == SPAWN)
                {
                    this.spawnPoints.push({x : x * tileSize, y : y * tileSize});
                }
                else if (tile == ITEM)
                {
                    this.possibleItemSpots.push({x : x * tileSize, y : y * tileSize});
                }
            }
        }

        this.origin = {
            x : width / 2,
            y : height / 2,
        };

        if (this.spawnPoints.length)
        {
            const spawn_point = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
            this.player.x     = spawn_point.x;
            this.player.y     = spawn_point.y;
        }

        if (this.possibleItemSpots.length)
        {
            const item_location = this.possibleItemSpots[Math.floor(Math.random() * this.possibleItemSpots.length)];
            this.item           = new RectangleTile(item_location.x, item_location.y, tileSize, tileSize, ITEM);
        }

        this.center = {
            x : this.player.x,
            y : this.player.y,
        };

        PlayStartSound();
    }

    draw()
    {
        // Animated background cycling through 5 colors
        let cycleSpeed = 0.0015;                                 // Speed of color transition
        let colorPhase = (sin(this.frame * cycleSpeed) + 1) / 2; // Oscillates between 0 and 1
        this.frame     = this.frame + 1;
        // Define the 5 colors to cycle through
        let colors     = [
            color("#B7C9D9"), // Light blue-gray
            color("#A0C4E1"), // Soft blue
            color("#F6F9D7"), // Pale yellow-green
            color("#F9F7F7"), // Off-white
            color("#EAE2E2")  // Light gray-pink
        ];

        // Calculate which colors to interpolate between and how much
        let scaledPhase = colorPhase * colors.length; // Scale to full color array range
        let colorIndex  = Math.floor(scaledPhase) % colors.length;
        let lerpAmount  = scaledPhase - Math.floor(scaledPhase);
        lerpAmount      = 3 * lerpAmount * lerpAmount - 2 * lerpAmount * lerpAmount * lerpAmount;

        // Use modulo to cycle back to beginning
        let currentColor = colors[colorIndex];
        let nextColor    = colors[(colorIndex + 1) % colors.length];

        let animatedBg = lerpColor(currentColor, nextColor, lerpAmount);
        background(animatedBg);

        push();

        if (!rectCollision(this.levelBounds, this.player))
        {
            if (this.spawnPoints.length)
            {
                const spawn_point = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
                this.player       = new Player(spawn_point.x, spawn_point.y, PLAYER_SIZE, PLAYER_SIZE);
            }
            else
            {
                this.player = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
            }
            PlayHurtSound();
            if (this.possibleItemSpots.length)
            {
                const item_location = this.possibleItemSpots[Math.floor(Math.random() * this.possibleItemSpots.length)];
                this.item           = new RectangleTile(item_location.x, item_location.y, this.tileSize, this.tileSize, ITEM);
            }
        }
        else
        {
            for (let i = 0; i < this.traps.length; i++)
            {
                if (rectCollision(this.traps[i], this.player))
                {
                    if (this.spawnPoints.length)
                    {
                        const spawn_point = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
                        PlayHurtSound();
                        this.player = new Player(spawn_point.x, spawn_point.y, PLAYER_SIZE, PLAYER_SIZE);
                    }
                    else
                    {
                        this.player = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
                    }
                    if (this.possibleItemSpots.length)
                    {
                        const item_location = this.possibleItemSpots[Math.floor(Math.random() * this.possibleItemSpots.length)];
                        this.item           = new RectangleTile(item_location.x, item_location.y, this.tileSize, this.tileSize, ITEM);
                    }
                }
            }
        }

        if (this.item && !this.player.hasItem)
        {
            if (rectCollision(this.item, this.player))
            {
                this.item           = null;
                this.player.hasItem = true;
                PlayEatSound();
            }
        }

        if (this.player.hasItem && !this.gameWon)
        {
            for (let i = 0; i < this.doors.length; i++)
            {
                if (rectCollision(this.doors[i], this.player))
                {
                    this.gameWon = true;
                }
            }
        }

        let to_player        = createVector(this.player.x - this.center.x, this.player.y - this.center.y);
        let length_to_player = to_player.mag();
        if (length_to_player > 100)
        {
            const dt = deltaTime / 1000;
            this.center.x += dt * to_player.x;
            this.center.y += dt * to_player.y;
        }

        translate(this.origin.x - this.center.x, this.origin.y - this.center.y);

        this.player.colliding = false;

        for (let i = 0; i < this.decorations.length; i++)
        {
            this.decorations[i].draw();
        }
        for (let i = 0; i < this.rects.length; i++)
        {
            let r   = this.rects[i];
            let top = new Rectangle(r.x, r.y - 10, r.w, 10);
            let btm = new Rectangle(r.x, r.y + r.h, r.w, 10);
            let lt  = new Rectangle(r.x - 10, r.y, 10, r.h);
            let rt  = new Rectangle(r.x + r.w, r.y, 10, r.h);

            // Additional Criteria or Smoother Gameplay
            if (rectCollision(lt, this.player) && this.player.vx > 0 && this.player.y + this.player.h - 10 > top.y + top.h)
            {
                this.player.anticipate = "LEFT";
            }
            if (rectCollision(rt, this.player) && this.player.vx < 0 && this.player.y + this.player.h - 10 > top.y + top.h)
            {
                this.player.anticipate = "RIGHT";
            }
            if (rectCollision(btm, this.player))
            {
                this.player.anticipate = "CEILING";
            }
            if (rectCollision(top, this.player) && this.player.y + this.player.h - 5 < top.y + top.h && this.player.vy > 0)
            {
                this.player.anticipate = "FLOOR";
            }

            if (rectCollision(this.player, r))
            {
                if (this.player.anticipate == "FLOOR")
                {
                    this.player.vy        = 0;
                    this.player.y         = r.y - this.player.h;
                    this.player.onGround  = true;
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "CEILING")
                {
                    if (this.player.vy < 0)
                    {
                        this.player.vy = 0;
                        this.player.y  = r.y + r.h;
                    }
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "RIGHT")
                {
                    this.player.vx        = 0;
                    this.player.x         = r.x + r.w;
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "LEFT")
                {
                    this.player.vx        = 0;
                    this.player.x         = r.x - this.player.w;
                    this.player.colliding = true;
                }
                this.player.onBouncer = false;
            }
        }

        for (let i = 0; i < this.bouncers.length; i++)
        {
            let r   = this.bouncers[i];
            let top = new Rectangle(r.x, r.y - 10, r.w, 20);
            let btm = new Rectangle(r.x, r.y + r.h, r.w, 10);
            let lt  = new Rectangle(r.x - 10, r.y, 10, r.h);
            let rt  = new Rectangle(r.x + r.w, r.y, 10, r.h);

            // Additional Criteria or Smoother Gameplay
            if (rectCollision(lt, this.player) && this.player.vx > 0 && this.player.y + this.player.h - 10 > top.y + top.h)
            {
                this.player.anticipate = "LEFT";
            }
            if (rectCollision(rt, this.player) && this.player.vx < 0 && this.player.y + this.player.h - 10 > top.y + top.h)
            {
                this.player.anticipate = "RIGHT";
            }
            if (rectCollision(btm, this.player))
            {
                this.player.anticipate = "CEILING";
            }
            if (rectCollision(top, this.player) && this.player.y + this.player.h - 5 < top.y + top.h && this.player.vy > 0)
            {
                this.player.anticipate = "FLOOR";
            }

            if (rectCollision(this.player, r))
            {
                this.player.onBouncer = false;
                if (this.player.anticipate == "FLOOR")
                {
                    // Bounce upward with extra force
                    this.player.vy = -abs(this.player.vy) * this.bounceMultiplier - JUMP_BOOST * this.bounceExtraForce;
                    if (keyIsDown(UP_ARROW))
                        this.player.vy -= JUMP_BOOST * PLAYER_SIZE / 30;
                    this.player.y         = r.y - this.player.h;
                    this.player.onGround  = false; // Player is now airborne
                    this.player.onBouncer = true;
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "CEILING")
                {
                    // Bounce downward
                    this.player.vy        = abs(this.player.vy) * this.bounceMultiplier + AIR_SPEED * (this.bounceExtraForce * 0.75);
                    this.player.y         = r.y + r.h;
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "RIGHT")
                {
                    // Bounce to the right
                    this.player.vx        = abs(this.player.vx) * this.bounceMultiplier + GROUND_SPEED * this.bounceExtraForce;
                    this.player.x         = r.x + r.w;
                    this.player.colliding = true;
                }
                if (this.player.anticipate == "LEFT")
                {
                    // Bounce to the left
                    this.player.vx        = -abs(this.player.vx) * this.bounceMultiplier - GROUND_SPEED * this.bounceExtraForce;
                    this.player.x         = r.x - this.player.w;
                    this.player.colliding = true;
                }
            }
        }

        for (let i = 0; i < this.ramps.length; i++)
        {
            let ramp = this.ramps[i];
            if (rectTriangleCollision(this.player, ramp.x, ramp.y, ramp.w, ramp.h, ramp.tile))
            {
                if (ramp.tile === LEFT_RAMP)
                {
                    // Bounce left and up (-1, -1 direction)
                    this.player.vx = -abs(this.player.vx) * this.bounceMultiplier - 0.75 * ONE_ONE_COMP * GROUND_SPEED * this.bounceExtraForce;
                    this.player.vy = -abs(this.player.vy) * this.bounceMultiplier - 0.75 * ONE_ONE_COMP * GROUND_SPEED * this.bounceExtraForce;
                }
                else if (ramp.tile === RIGHT_RAMP)
                {
                    // Bounce right and up (1, -1 direction)
                    this.player.vx = abs(this.player.vx) * this.bounceMultiplier + 0.75 * ONE_ONE_COMP * GROUND_SPEED * this.bounceExtraForce;
                    this.player.vy = -abs(this.player.vy) * this.bounceMultiplier - 0.75 * ONE_ONE_COMP * GROUND_SPEED * this.bounceExtraForce;
                }

                this.player.onGround  = false; // Player is now airborne
                this.player.colliding = true;
            }
        }

        if (!this.player.colliding)
            this.player.onGround = false;

        this.player.update();

        for (let i = 0; i < this.rects.length; i++)
        {
            this.rects[i].draw();
        }
        for (let i = 0; i < this.traps.length; i++)
        {
            this.traps[i].draw();
        }
        for (let i = 0; i < this.doors.length; i++)
        {
            this.doors[i].draw();
        }
        for (let i = 0; i < this.bouncers.length; i++)
        {
            this.bouncers[i].draw();
        }
        for (let i = 0; i < this.ramps.length; i++)
        {
            this.ramps[i].draw();
        }
        if (this.item)
            this.item.draw();

        this.player.draw();

        this.player.jumpPressed = false;
        pop();
    }

    keyPressed()
    {
        if (keyCode == 38)
        {
            this.player.jumpPressed = true;
            if (this.player.onGround)
                this.player.jump = true;
        }
    }
}
