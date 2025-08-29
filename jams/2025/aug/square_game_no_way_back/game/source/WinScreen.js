class WinScreen
{
    constructor()
    {
        this.message           = "Congratulations! You won!";
        this.playAgainButton   = new Button(width / 2, height / 2 - 40, "Play Again");
        this.levelSelectButton = new Button(width / 2, height / 2, "Level Select");
        this.mainMenuButton    = new Button(width / 2, height / 2 + 40, "Main Menu");
        PlayWinSound();
    }

    Update()
    {
        if (this.playAgainButton.DidClickButton())
        {
            CurrentScene = new GameScreen();
        }
        if (this.levelSelectButton.DidClickButton())
        {
            CurrentScene = new LevelSelectScreen(Object.keys(gAllLevels));
        }
        if (this.mainMenuButton.DidClickButton())
        {
            CurrentScene = MainMenuScene;
        }
    }

    Draw()
    {
        background(50, 200, 50);
        textAlign(CENTER, CENTER);
        textSize(32);
        fill(255);
        text(this.message, width / 2, height / 3);

        this.playAgainButton.DrawButton();
        this.levelSelectButton.DrawButton();
        this.mainMenuButton.DrawButton();
    }
}