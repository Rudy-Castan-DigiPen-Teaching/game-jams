const EMPTY = ".";
const GROUND = "#";
const DECOR = "&";
const SPAWN = "@";
const TRAP = "^";
const ITEM = "*";
const DOOR = "D";

function getColorFromTile(tile) {
  switch (tile) {
    case EMPTY:
      return color(40, 40, 40);
    case TRAP:
      return color(224, 64, 64);
    case DECOR:
      return color(64, 224, 64);
    case GROUND:
      return color(224, 224, 224);
    case SPAWN:
      return color(255, 255, 0);
    case ITEM:
      return color("#9932CC");
    case DOOR:
      return color("#8B4513");
    default:
      return color(random(255), random(255), random(255));
  }
}

class LevelEditor {
  constructor() {
    this.tileSizes = {
      tiny: { w: 20, h: 12 },
      small: { w: 40, h: 24 },
      medium: { w: 80, h: 48 },
      large: { w: 160, h: 96 },
    };

    this.levels = {};
    this.currentLevelName = "default";
    this.tileMode = EMPTY;
    this.tileSize = undefined;

    this.gSaveButton = undefined;
    this.gDownloadButton = undefined;
    this.gLevelSelect = undefined;
    this.gSizeSelect = undefined;
    this.gDimension = this.tileSizes.medium;
    this.gNewLevelButton = undefined;

    this.level = {
      width: this.tileSizes.medium.w,
      height: this.tileSizes.medium.h,
      tiles: [],
    };
  }

  setup(all_levels, current_level_name) {
    this.loadLevel(all_levels, current_level_name);
    this.tileSize = width / this.level.width;
    this.createUI();
  }

  draw() {
    background(40);
    this.tileSize = width / this.level.width;
    this.drawLevel();
    this.drawCursor();
  }

  drawLevel() {
    push();
    for (let y = 0; y < this.level.height; y++) {
      for (let x = 0; x < this.level.width; x++) {
        let tile = this.level.tiles[y * this.level.width + x];
        if (tile !== EMPTY) {
          fill(getColorFromTile(tile));
          rect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
    }
    pop();
  }

  drawCursor() {
    let mouseTileX = floor(mouseX / this.tileSize);
    let mouseTileY = floor(mouseY / this.tileSize);

    if (
      mouseTileX < 0 ||
      mouseTileX >= this.level.width ||
      mouseTileY < 0 ||
      mouseTileY >= this.level.height
    ) {
      return;
    }
    push();
    fill(getColorFromTile(this.tileMode));
    stroke(255, 127);
    strokeWeight(3);
    rect(
      mouseTileX * this.tileSize,
      mouseTileY * this.tileSize,
      this.tileSize,
      this.tileSize
    );
    pop();
  }

  mousePressed() {
    this.markLevel(mouseX, mouseY);
  }

  mouseDragged() {
    this.markLevel(mouseX, mouseY);
  }

  keyReleased() {
    if (key === " " || key === "0") {
      this.tileMode = EMPTY;
    } else if (key === "1") {
      this.tileMode = GROUND;
    } else if (key === "2") {
      this.tileMode = DECOR;
    } else if (key === "3") {
      this.tileMode = SPAWN;
    } else if (key === "4") {
      this.tileMode = TRAP;
    } else if (key === "5") {
      this.tileMode = ITEM;
    } else if (key === "6") {
      this.tileMode = DOOR;
    }
  }

  markLevel(x, y) {
    let tileX = floor(x / this.tileSize);
    let tileY = floor(y / this.tileSize);

    if (
      tileX >= 0 &&
      tileX < this.level.width &&
      tileY >= 0 &&
      tileY < this.level.height
    ) {
      this.level.tiles[tileY * this.level.width + tileX] = this.tileMode;
    }
  }

  loadLevel(all_levels, current_level_name) {
    this.levels = all_levels || {};
    this.currentLevelName = current_level_name || "default";
    if (!(this.currentLevelName in this.levels)) {
      this.levels[this.currentLevelName] = {
        width: this.tileSizes.medium.w,
        height: this.tileSizes.medium.h,
        tiles: new Array(
          this.tileSizes.medium.w * this.tileSizes.medium.h
        ).fill(EMPTY),
      };
    }
    this.level = this.levels[this.currentLevelName];
  }

  updateLevelSelect(gLevelSelect) {
    gLevelSelect.html("");
    for (let name in this.levels) {
      gLevelSelect.option(name);
    }
    gLevelSelect.value(this.currentLevelName);
  }

  createUI() {
    this.gSaveButton = createButton("Save Level");
    this.gSaveButton.position(10, height + 10);
    this.gSaveButton.mousePressed(() => {
      gCurrentLevelName = this.currentLevelName;
      SaveLevels();
    });

    this.gDownloadButton = createButton("Download Level");
    this.gDownloadButton.position(this.gSaveButton.width + 20, height + 10);
    this.gDownloadButton.mousePressed(() => this.downloadLevels());

    this.gLevelSelect = createSelect();
    this.gLevelSelect.position(10, height + 40);
    this.gLevelSelect.changed(() => {
      this.currentLevelName = this.gLevelSelect.value();
      if (!this.levels[this.currentLevelName]) {
        this.levels[this.currentLevelName] = {
          width: this.tileSizes.medium.w,
          height: this.tileSizes.medium.h,
          tiles: new Array(
            this.tileSizes.medium.w * this.tileSizes.medium.h
          ).fill(EMPTY),
        };
      }
      this.level = this.levels[this.currentLevelName];
      this.tileSize = width / this.level.width;
    });
    this.updateLevelSelect(this.gLevelSelect);

    this.gDeleteCurrentLevel = createButton("Delete Current Level");
    this.gDeleteCurrentLevel.position(120, height + 40);
    this.gDeleteCurrentLevel.mousePressed(() => {
      if (this.currentLevelName != "default")
        gAllLevels = Object.fromEntries(
          Object.entries(gAllLevels).filter(
            ([k]) => k !== this.currentLevelName
          )
        );
      this.levels = gAllLevels;
      this.level = gAllLevels["default"];
      this.currentLevelName = "default";
      gCurrentLevelName = "default";
      this.updateLevelSelect(this.gLevelSelect);
    });

    this.gSizeSelect = createSelect();
    this.gSizeSelect.position(width - 80, height + 10);
    this.gSizeSelect.changed(() => {
      this.gDimension = this.tileSizes[this.gSizeSelect.value()];
    });
    this.gSizeSelect.html("");
    let size_names = Object.keys(this.tileSizes);
    for (let k in size_names) {
      this.gSizeSelect.option(size_names[k]);
    }
    this.gSizeSelect.value(size_names[0]);

    this.gNewLevelButton = createButton("New Level");
    this.gNewLevelButton.position(width - 80, height + 40);
    this.gNewLevelButton.mousePressed(() => {
      let new_name = prompt("Enter new level name:") || "default";
      if (!this.levels[new_name]) {
        this.levels[new_name] = {
          width: this.gDimension.w,
          height: this.gDimension.h,
          tiles: new Array(this.gDimension.w * this.gDimension.h).fill(EMPTY),
        };
        this.currentLevelName = new_name;
        this.level = this.levels[new_name];
        gCurrentLevelName = this.currentLevelName;
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

  downloadLevels() {
    let content = JSON.stringify(this.levels);
    let blob = new Blob([content], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "start_levels.json"; // This should now work correctly
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  teardown() {
    gCurrentLevelName = this.currentLevelName;
    SaveLevels();
    if (this.gSaveButton) this.gSaveButton.remove();
    if (this.gDownloadButton) this.gDownloadButton.remove();
    if (this.gLevelSelect) this.gLevelSelect.remove();
    if (this.gSizeSelect) this.gSizeSelect.remove();
    if (this.gNewLevelButton) this.gNewLevelButton.remove();
    if (this.gMainMenuButton) this.gMainMenuButton.remove();
    if (this.gDeleteCurrentLevel) this.gDeleteCurrentLevel.remove();
    this.gSaveButton = null;
    this.gDownloadButton = null;
    this.gLevelSelect = null;
    this.gSizeSelect = null;
    this.gNewLevelButton = null;
    this.gMainMenuButton = null;
    this.gDeleteCurrentLevel = null;
  }
}
