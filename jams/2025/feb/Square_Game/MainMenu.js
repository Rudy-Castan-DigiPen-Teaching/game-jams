class MainMenu {
  constructor() {
    const center_x = width / 2;
    this.play = new Button(center_x, (height * 2) / 5, "Play");
    this.create = new Button(center_x, (height * 3) / 5, "Create");
    this.credits = new Button(center_x, (height * 4) / 5, "Credits");
  }

  Update() {
    StopBackgroundMusic();
    if (this.play.DidClickButton()) {
      console.log("Play!");
      CurrentScene = new LevelSelectScreen(Object.keys(gAllLevels));
    } else if (this.create.DidClickButton()) {
      console.log("Create!");
      CurrentScene = CreateScene;
      CurrentScene.Setup();
    } else if (this.credits.DidClickButton()) {
      console.log("Credits!");
      CurrentScene = CreditsScene;
    }
  }

  Draw() {
    DrawTitle("Square Game");
    this.play.DrawButton();
    this.create.DrawButton();
    this.credits.DrawButton();
  }

  OnKeyPressed() {
    console.log("MainMenu OnKeyPressed");
  }
}
