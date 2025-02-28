class LevelSelectScreen {
  constructor(levelNames) {
    this.levelNames = levelNames;
    this.buttons = [];
    this.scrollOffset = 0;
    this.buttonSpacing = 50;
    this.maxVisibleButtons = Math.floor(height / this.buttonSpacing) - 1;

    const center_x = width / 2;
    for (let i = 0; i < levelNames.length; i++) {
      this.buttons.push(
        new Button(center_x, (i + 1) * this.buttonSpacing, levelNames[i])
      );
    }

    this.upButton = new Button(width - 60, 30, "up");
    this.downButton = new Button(width - 60, height - 30, "down");

    this.mainmenu = new Button(60, height - 50, "Main Menu");

    this.playquick = new Button(60, 50, "Play - " + gCurrentLevelName);
    StartBackgroundMusic();
  }

  Update() {
    for (let i = 0; i < this.buttons.length; i++) {
      if (this.buttons[i].DidClickButton()) {
        console.log("Selected Level:", this.levelNames[i]);
        gCurrentLevelName = this.levelNames[i];
        CurrentScene = new GameScreen();
      }
    }

    if (this.upButton.DidClickButton()) {
      this.scrollOffset = max(0, this.scrollOffset - this.buttonSpacing);
    }
    if (this.downButton.DidClickButton()) {
      this.scrollOffset = min(
        (this.buttons.length - this.maxVisibleButtons) * this.buttonSpacing,
        this.scrollOffset + this.buttonSpacing
      );
    }

    if (this.mainmenu.DidClickButton()) {
      console.log("Main Menu!");
      CurrentScene = MainMenuScene;
    }

    if (this.playquick.DidClickButton()) {
      console.log("Playing Level:", gCurrentLevelName);
      CurrentScene = new GameScreen();
    }
  }

  Draw() {
    for (let i = 0; i < this.buttons.length; i++) {
      this.buttons[i].DrawButton(0, -this.scrollOffset);
    }
    this.upButton.DrawButton();
    this.downButton.DrawButton();
    this.mainmenu.DrawButton();
    this.playquick.DrawButton();
  }

  OnKeyPressed() {
    if (keyCode === UP_ARROW) {
      this.scrollOffset = max(0, this.scrollOffset - this.buttonSpacing);
    } else if (keyCode === DOWN_ARROW) {
      this.scrollOffset = min(
        (this.buttons.length - this.maxVisibleButtons) * this.buttonSpacing,
        this.scrollOffset + this.buttonSpacing
      );
    }
  }
}
