class GameScreen
{
    constructor()
    {
        this.platformer   = new Platformer(gAllLevels[gCurrentLevelName]);
        this.gobackButton = new Button(25, 35 / 2, "<-");
        PlayControlsSound();
    }
    Update()
    {
        if (this.gobackButton.DidClickButton())
        {
            console.log("Playing Level:", gCurrentLevelName);
            CurrentScene = new LevelSelectScreen(Object.keys(gAllLevels));
        }
    }

    Draw()
    {
        this.platformer.draw();
        if (this.platformer.gameWon)
        {
            CurrentScene = new WinScreen();
        }
        this.gobackButton.DrawButton();
    }

    OnKeyPressed() { this.platformer.keyPressed(); }
}
