class Player
{
    constructor(x, y, w, h)
    {
        this.x                = x;
        this.y                = y;
        this.w                = w;
        this.h                = h;
        this.vx               = 0;
        this.vy               = 0;
        this.anticipate       = "FLOOR";
        this.onGround         = false;
        this.colliding        = false;
        this.jump             = false;
        this.jumpPressed      = false;
        this.hasItem          = false;
        this.leftuse          = [ 1.0, 2.0, 3.0, 4.0, 5.0 ];
        this.countdownIndex   = -1;
        this.leftEnabled      = false; // True when a number key was pressed
        this.countdownStarted = false; // True when left arrow was first pressed after number key
        this.spiralRotation   = 0;     // Track rotation for the spiral

        // UI state for left movement indicators
        this.keyBoxStates        = [ 'available', 'available', 'available', 'available', 'available' ]; // 'available', 'wiggling', 'animating', 'used'
        this.wiggleTime          = [ 0, 0, 0, 0, 0 ];                                                   // Time remaining for wiggle animation
        this.animateOffsetY      = [ 0, 0, 0, 0, 0 ];                                                   // Y offset for flying off animation
        this.keyPressedThisFrame = [ false, false, false, false, false ];                               // Track if key was just pressed
    }

    draw()
    {
        if (!this.hasItem)
            fill(255);
        else
            fill("#9932CC");
        push();
        ellipseMode(CORNER);
        ellipse(this.x, this.y, this.w, this.h);

        // Draw spiral on top of player
        push();
        // console.log(this.spiralRotation);
        translate(this.x + this.w / 2, this.y + this.h / 2); // Center of the player
        rotate(this.spiralRotation);                         // Apply rotation to the spiral
        stroke(0);                                           // Black stroke for the spiral
        strokeWeight(2);
        noFill();

        // Create spiral using parametric equations
        beginShape();
        for (let angle = 0; angle < 6 * PI; angle += 0.1)
        {
            let radius = angle * 1.0; // Spiral grows as angle increases
            let x      = radius * cos(angle);
            let y      = radius * sin(angle);

            // Keep spiral within player bounds
            if (radius < this.w / 2)
            {
                vertex(x, y);
            }
        }
        endShape();
        pop();

        // Draw countdown timer under the player
        if (this.countdownIndex >= 0 && this.countdownStarted)
        {
            push();
            textFont(gGameFont);
            fill(255, 0, 0);
            stroke(0);
            strokeWeight(1);
            textAlign(CENTER, CENTER);
            textSize(20);
            text(this.leftuse[this.countdownIndex].toFixed(1) + "s", this.x + this.w / 2, this.y + this.h + 20);
            pop();
        }

        pop();

        // Draw UI elements
        this.drawLeftMovementUI();
    }

    drawLeftMovementUI()
    {
        push();
        // Reset transformations to draw in screen space
        resetMatrix();
        textFont(gGameFont);

        const boxSize    = 40;
        const boxSpacing = 50;
        const startX     = (width - (5 * boxSpacing - 10)) / 2; // Center the boxes
        const startY     = 30;

        for (let i = 0; i < 5; i++)
        {
            const keyNumber = i + 1;
            let   boxX      = startX + i * boxSpacing;
            let   boxY      = startY;

            // Apply wiggle effect
            if (this.keyBoxStates[i] === 'wiggling')
            {
                // Use millis() for continuous wiggle animation
                const wiggleTime = millis() / 1000.0; // Convert to seconds
                boxX += sin(wiggleTime * 20) * 3;     // Horizontal wiggle
                boxY += cos(wiggleTime * 25) * 2;     // Vertical wiggle
            }

            // Apply flying off animation
            if (this.keyBoxStates[i] === 'animating')
            {
                boxY -= this.animateOffsetY[i];
            }

            // Don't draw if it's used up
            if (this.keyBoxStates[i] === 'used')
            {
                continue;
            }

            // Draw box
            if (this.leftuse[i] <= 0)
            {
                fill(100); // Gray for used up time
            }
            else if (this.countdownIndex === i && this.countdownStarted)
            {
                fill(255, 100, 100); // Red when actively counting down
            }
            else if (this.countdownIndex === i)
            {
                fill(255, 255, 100); // Yellow when selected but not started
            }
            else
            {
                fill(255); // White for available
            }

            stroke(0);
            strokeWeight(2);
            rect(boxX, boxY, boxSize, boxSize);

            // Draw number
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(20);
            text(keyNumber, boxX + boxSize / 2, boxY + boxSize / 2);
        }
        pop();
    }

    updateLeftMovementUI(dt)
    {
        const keys = [ 1, 2, 3, 4, 5 ];

        // Check for key presses and handle selection switching
        for (let i = 0; i < keys.length; ++i)
        {
            const keyPressed = keyIsDown(48 + keys[i]);

            // Detect new key press (not held from previous frame)
            if (keyPressed && !this.keyPressedThisFrame[i] && this.leftuse[i] > 0 && this.keyBoxStates[i] === 'available')
            {
                // If another key is already selected, reset it
                if (this.countdownIndex >= 0 && this.countdownIndex !== i && !this.countdownStarted)
                {
                    this.keyBoxStates[this.countdownIndex] = 'available';
                    this.wiggleTime[this.countdownIndex]   = 0;
                }

                // Select this key
                this.countdownIndex   = i;
                this.leftEnabled      = true;
                this.countdownStarted = false;
                this.keyBoxStates[i]  = 'wiggling';
                this.wiggleTime[i]    = 0.5; // Wiggle until they move left or cancel
            }

            this.keyPressedThisFrame[i] = keyPressed;
        }

        // Check for ESC to cancel selection
        if (keyIsDown(ESCAPE) && this.countdownIndex >= 0 && !this.countdownStarted)
        {
            this.keyBoxStates[this.countdownIndex] = 'available';
            this.wiggleTime[this.countdownIndex]   = 0;
            this.countdownIndex                    = -1;
            this.leftEnabled                       = false;
        }

        // Update wiggle timers (but don't auto-stop for selected keys)
        for (let i = 0; i < 5; i++)
        {
            if (this.keyBoxStates[i] === 'wiggling')
            {
                // Only decrease wiggle time for non-selected keys
                if (this.countdownIndex == i)
                {
                    this.wiggleTime[i] -= dt;
                    if (this.wiggleTime[i] <= 0)
                    {
                        this.keyBoxStates[i] = 'available';
                        console.log("HELLO")
                    }
                }
            }

            // Update flying off animation (now goes down instead of up)
            if (this.keyBoxStates[i] === 'animating')
            {
                this.animateOffsetY[i] += 150 * dt; // Move down at 300 pixels/second
                if (this.animateOffsetY[i] > 100)   // Once it's off screen below
                {
                    this.keyBoxStates[i] = 'used';
                }
            }
        }
    }

    update()
    {
        const dt       = deltaTime / 1000;
        const scale_by = PLAYER_SIZE / 30;

        // Update UI animations
        this.updateLeftMovementUI(dt);

        let can_go_left = false;

        // Handle left movement and countdown (key selection is now handled in updateLeftMovementUI)
        if (this.leftEnabled && this.countdownIndex >= 0)
        {
            // Check if player is trying to go left for the first time
            if (!this.countdownStarted && keyIsDown(LEFT_ARROW))
            {
                this.countdownStarted = true;
                console.log("Left countdown started!");
                // Start the flying off animation for this key
                this.keyBoxStates[this.countdownIndex]   = 'animating';
                this.animateOffsetY[this.countdownIndex] = 0; // Start at normal position
            }

            // Only decrease timer if countdown has started
            if (this.countdownStarted)
            {
                this.leftuse[this.countdownIndex] -= dt;
            }

            can_go_left = this.leftuse[this.countdownIndex] >= 0;
            if (!can_go_left)
            {
                // Time ran out, switch to used state immediately
                this.keyBoxStates[this.countdownIndex] = 'used';
                this.countdownIndex                    = -1;
                this.leftEnabled                       = false;
                this.countdownStarted                  = false;
            }
        }

        if (!this.onGround)
        {
            this.vy += AIR_SPEED * dt * scale_by;
            if (can_go_left && keyIsDown(LEFT_ARROW))
            {
                this.vx -= AIR_SPEED * dt * scale_by;
            }
            if (keyIsDown(RIGHT_ARROW))
            {
                this.vx += AIR_SPEED * dt * scale_by;
            }
            this.vx *= 0.95;
        }
        else
        {
            this.vy = 0;

            if (can_go_left && keyIsDown(LEFT_ARROW))
            {
                this.vx -= GROUND_SPEED * dt * scale_by;
            }
            if (keyIsDown(RIGHT_ARROW))
            {
                this.vx += GROUND_SPEED * dt * scale_by;
            }

            if (keyIsDown(UP_ARROW) && this.jumpPressed)
                this.jump = true;
            if (this.jump)
            {
                this.vy       = -JUMP_BOOST * scale_by;
                this.jump     = false;
                this.onGround = false;
            }
            this.vx *= 0.8;
        }

        // Update spiral rotation based on velocity
        // For proper rolling motion: angular_velocity = linear_velocity / radius
        const playerRadius            = this.w / 2;                // Player circle radius
        const rotationSpeedMultiplier = this.onGround ? 1.0 : 2.0; // 2x speed in air

        if (this.vx > 0)
        {
            // Moving right - rotate clockwise
            this.spiralRotation += (abs(this.vx) / playerRadius) * rotationSpeedMultiplier;
        }
        else if (this.vx < 0)
        {
            // Moving left - rotate counter-clockwise
            this.spiralRotation -= (abs(this.vx) / playerRadius) * rotationSpeedMultiplier;
        }

        this.y += this.vy;
        this.x += this.vx;
    }
}
