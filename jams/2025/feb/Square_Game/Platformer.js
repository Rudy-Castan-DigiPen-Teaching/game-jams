class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  draw() {
    rect(this.x, this.y, this.w, this.h);
  }
}

class RectangleTile {
  constructor(x, y, w, h, tile = EMPTY) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.tile = tile;
  }

  draw() {
    fill(getColorFromTile(this.tile));
    rect(this.x, this.y, this.w, this.h);
  }
}

function rectCollision(r1, r2) {
  if (
    r1.x < r2.x + r2.w &&
    r1.x + r1.w > r2.x &&
    r1.y < r2.y + r2.h &&
    r1.h + r1.y > r2.y
  ) {
    return true;
  } else {
    // No collision
    return false;
  }
}

const PLAYER_SIZE = 32;
const AIR_SPEED = 18; // pixels / second
const GROUND_SPEED = 75; // pixels / second
const JUMP_BOOST = 9;

class Player {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.anticipate = "FLOOR";
    this.onGround = false;
    this.colliding = false;
    this.jump = false;
    this.jumpPressed = false;
    this.hasItem = false;
  }

  draw() {
    if (!this.hasItem) fill(255);
    else fill("#9932CC");
    rect(this.x, this.y, this.w, this.h);
  }

  update() {
    const dt = deltaTime / 1000;
    const scale_by = PLAYER_SIZE / 30;
    if (!this.onGround) {
      this.vy += AIR_SPEED * dt * scale_by;
      if (keyIsDown(LEFT_ARROW)) {
        this.vx -= AIR_SPEED * dt * scale_by;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.vx += AIR_SPEED * dt * scale_by;
      }
      this.vx *= 0.95;
    } else {
      this.vy = 0;

      if (keyIsDown(LEFT_ARROW)) {
        this.vx -= GROUND_SPEED * dt * scale_by;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.vx += GROUND_SPEED * dt * scale_by;
      }

      if (keyIsDown(UP_ARROW) && this.jumpPressed) this.jump = true;
      if (this.jump) {
        this.vy = -JUMP_BOOST * scale_by;
        this.jump = false;
        this.onGround = false;
      }
      this.vx *= 0.8;
    }
    this.y += this.vy;
    this.x += this.vx;
  }
}

function mergeTiles(level, tileSize, tileType) {
  let w = level.width;
  let h = level.height;
  let tiles = level.tiles;
  let mergedRects = [];
  let visited = new Array(w * h).fill(false);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let index = y * w + x;
      if (visited[index] || tiles[index] !== tileType) {
        continue;
      }

      let rectX = x,
        rectY = y;
      let rectWidth = 1,
        rectHeight = 1;

      // Expand width
      while (
        x + rectWidth < w &&
        tiles[y * w + (x + rectWidth)] === tileType &&
        !visited[y * w + (x + rectWidth)]
      ) {
        rectWidth++;
      }

      // Expand height
      let expandHeight = true;
      while (expandHeight && y + rectHeight < h) {
        for (let i = 0; i < rectWidth; i++) {
          if (
            tiles[(y + rectHeight) * w + (x + i)] !== tileType ||
            visited[(y + rectHeight) * w + (x + i)]
          ) {
            expandHeight = false;
            break;
          }
        }
        if (expandHeight) rectHeight++;
      }

      // Mark tiles as visited
      for (let dy = 0; dy < rectHeight; dy++) {
        for (let dx = 0; dx < rectWidth; dx++) {
          visited[(y + dy) * w + (x + dx)] = true;
        }
      }

      // Store merged rectangle
      mergedRects.push(
        new RectangleTile(
          rectX * tileSize,
          rectY * tileSize,
          rectWidth * tileSize,
          rectHeight * tileSize,
          tileType
        )
      );
    }
  }

  return mergedRects;
}

class Platformer {
  constructor(the_level) {
    this.gameWon = false;
    this.player = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
    this.level = the_level;
    this.rects = [];
    this.decorations = [];
    let tileSize = PLAYER_SIZE * 1.1;
    this.tileSize = tileSize;
    const buffer_scale = 20;
    this.levelBounds = new Rectangle(
      -tileSize * buffer_scale,
      -tileSize * buffer_scale,
      (this.level.width + 2 * buffer_scale) * tileSize,
      (this.level.height + 2 * buffer_scale) * tileSize
    );
    this.spawnPoints = [];
    this.rects = mergeTiles(this.level, tileSize, GROUND);
    this.traps = mergeTiles(this.level, tileSize, TRAP);
    this.doors = mergeTiles(this.level, tileSize, DOOR);
    this.decorations = mergeTiles(this.level, tileSize, DECOR);
    this.item = null;
    this.possibleItemSpots = [];
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        let tile = this.level.tiles[y * this.level.width + x];
        if (tile == SPAWN) {
          this.spawnPoints.push({ x: x * tileSize, y: y * tileSize });
        } else if (tile == ITEM) {
          this.possibleItemSpots.push({ x: x * tileSize, y: y * tileSize });
        }
      }
    }

    this.origin = {
      x: width / 2,
      y: height / 2,
    };

    if (this.spawnPoints.length) {
      const spawn_point = this.spawnPoints[
        Math.floor(Math.random() * this.spawnPoints.length)
      ];
      this.player.x = spawn_point.x;
      this.player.y = spawn_point.y;
    }

    if (this.possibleItemSpots.length) {
      const item_location = this.possibleItemSpots[
        Math.floor(Math.random() * this.possibleItemSpots.length)
      ];
      this.item = new RectangleTile(
        item_location.x,
        item_location.y,
        tileSize,
        tileSize,
        ITEM
      );
    }

    this.center = {
      x: this.player.x,
      y: this.player.y,
    };
    
    PlayStartSound();
  }

  draw() {
    background(40);
    push();

    if (!rectCollision(this.levelBounds, this.player)) {
      if (this.spawnPoints.length) {
        const spawn_point = this.spawnPoints[
          Math.floor(Math.random() * this.spawnPoints.length)
        ];
        this.player = new Player(
          spawn_point.x,
          spawn_point.y,
          PLAYER_SIZE,
          PLAYER_SIZE
        );
      } else {
        this.player = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
      }
      PlayHurtSound();
      if (this.possibleItemSpots.length) {
        const item_location = this.possibleItemSpots[
          Math.floor(Math.random() * this.possibleItemSpots.length)
        ];
        this.item = new RectangleTile(
          item_location.x,
          item_location.y,
          this.tileSize,
          this.tileSize,
          ITEM
        );
      }
    } else {
      for (let i = 0; i < this.traps.length; i++) {
        if (rectCollision(this.traps[i], this.player)) {
          if (this.spawnPoints.length) {
            const spawn_point = this.spawnPoints[
              Math.floor(Math.random() * this.spawnPoints.length)
            ];
            PlayHurtSound();
            this.player = new Player(
              spawn_point.x,
              spawn_point.y,
              PLAYER_SIZE,
              PLAYER_SIZE
            );
          } else {
            this.player = new Player(100, 100, PLAYER_SIZE, PLAYER_SIZE);
          }
          if (this.possibleItemSpots.length) {
            const item_location = this.possibleItemSpots[
              Math.floor(Math.random() * this.possibleItemSpots.length)
            ];
            this.item = new RectangleTile(
              item_location.x,
              item_location.y,
              this.tileSize,
              this.tileSize,
              ITEM
            );
          }
        }
      }
    }

    if (this.item && !this.player.hasItem) {
      if (rectCollision(this.item, this.player)) {
        this.item = null;
        this.player.hasItem = true;
        PlayEatSound();
      }
    }

    if (this.player.hasItem && !this.gameWon) {
      for (let i = 0; i < this.doors.length; i++) {
        if (rectCollision(this.doors[i], this.player)) {
          this.gameWon = true;
        }
      }
    }

    let to_player = createVector(
      this.player.x - this.center.x,
      this.player.y - this.center.y
    );
    let length_to_player = to_player.mag();
    if (length_to_player > 100) {
      const dt = deltaTime / 1000;
      this.center.x += dt * to_player.x;
      this.center.y += dt * to_player.y;
    }
    //     this.dx = this.center.x - this.player.x;
    //     this.dy = this.center.y - this.player.y;

    //     if (abs(this.dx) > 100) {
    //       this.center.x -= this.dx - (100 * this.dx) / abs(this.dx);
    //     }

    //     if (abs(this.dy) > 100) {
    //       this.center.y -= this.dy - (100 * this.dy) / abs(this.dy);
    //     }

    translate(this.origin.x - this.center.x, this.origin.y - this.center.y);

    this.player.colliding = false;

    for (let i = 0; i < this.decorations.length; i++) {
      this.decorations[i].draw();
    }
    for (let i = 0; i < this.rects.length; i++) {
      let r = this.rects[i];
      let top = new Rectangle(r.x, r.y - 10, r.w, 10);
      let btm = new Rectangle(r.x, r.y + r.h, r.w, 10);
      let lt = new Rectangle(r.x - 10, r.y, 10, r.h);
      let rt = new Rectangle(r.x + r.w, r.y, 10, r.h);

      // Additional Criteria or Smoother Gameplay
      if (
        rectCollision(lt, this.player) &&
        this.player.vx > 0 &&
        this.player.y + this.player.h - 10 > top.y + top.h
      ) {
        this.player.anticipate = "LEFT";
      }
      if (
        rectCollision(rt, this.player) &&
        this.player.vx < 0 &&
        this.player.y + this.player.h - 10 > top.y + top.h
      ) {
        this.player.anticipate = "RIGHT";
      }
      if (rectCollision(btm, this.player)) {
        this.player.anticipate = "CEILING";
      }
      if (
        rectCollision(top, this.player) &&
        this.player.y + this.player.h - 5 < top.y + top.h &&
        this.player.vy > 0
      ) {
        this.player.anticipate = "FLOOR";
      }

      if (rectCollision(this.player, r)) {
        if (this.player.anticipate == "FLOOR") {
          this.player.vy = 0;
          this.player.y = r.y - this.player.h;
          this.player.onGround = true;
          this.player.colliding = true;
        }
        if (this.player.anticipate == "CEILING") {
          if (this.player.vy < 0) {
            this.player.vy = 0;
            this.player.y = r.y + r.h;
          }
          this.player.colliding = true;
        }
        if (this.player.anticipate == "RIGHT") {
          this.player.vx = 0;
          this.player.x = r.x + r.w;
          this.player.colliding = true;
        }
        if (this.player.anticipate == "LEFT") {
          this.player.vx = 0;
          this.player.x = r.x - this.player.w;
          this.player.colliding = true;
        }
      }
    }

    if (!this.player.colliding) this.player.onGround = false;

    this.player.update();
    this.player.draw();
    for (let i = 0; i < this.rects.length; i++) {
      this.rects[i].draw();
    }
    for (let i = 0; i < this.traps.length; i++) {
      this.traps[i].draw();
    }
    for (let i = 0; i < this.doors.length; i++) {
      this.doors[i].draw();
    }
    if (this.item) this.item.draw();
    this.player.jumpPressed = false;
    pop();
  }

  keyPressed() {
    if (keyCode == 38) {
      this.player.jumpPressed = true;
      if (this.player.onGround) this.player.jump = true;
    }
  }
}
