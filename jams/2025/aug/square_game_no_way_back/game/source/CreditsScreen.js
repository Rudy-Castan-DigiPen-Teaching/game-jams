class CreditsScreen
{
    constructor() { this.mainmenu = new Button(width / 2, height - 50, "Main Menu"); }

    Update()
    {
        if (this.mainmenu.DidClickButton())
        {
            console.log("Main Menu!");
            CurrentScene = MainMenuScene;
        }
    }

    Draw()
    {
        DrawTitle("Credits");

        textSize(40);
        text("Made by Rudy Castan\n\tShinyu Castan\n\tHayu Castan", width / 2, height / 2);

        this.mainmenu.DrawButton();
    }

    OnKeyPressed()
    {
        if (keyCode == LEFT_ARROW)
        {
            CurrentScene = MainMenuScene;
        }
    }
}
