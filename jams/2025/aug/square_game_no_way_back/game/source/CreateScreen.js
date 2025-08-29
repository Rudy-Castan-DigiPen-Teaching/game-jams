class CreateScreen
{
    constructor()
    {
        this.editor     = null;
        this.platformer = null;
        this.isEditor   = true;
    }

    Setup()
    {
        if (this.editor)
            this.editor.teardown();
        this.editor = new LevelEditor();
        this.editor.setup(gAllLevels, gCurrentLevelName);
    }

    Update() { }

    Draw()
    {
        if (this.isEditor)
            this.editor.draw();
        else
        {
            this.platformer.draw();
            if (this.platformer.gameWon)
            {
                this.platformer = new Platformer(gAllLevels[gCurrentLevelName]);
            }
        }
    }

    OnKeyPressed()
    {
        if (!this.isEditor)
            this.platformer.keyPressed();
        if (this.isEditor)
            this.editor.keyPressed();
    }

    OnKeyReleased()
    {
        if (this.isEditor)
            this.editor.keyReleased();
        if (key === "p")
        {
            if (this.isEditor)
            {
                this.platformer = new Platformer(this.editor.level);
                this.editor.teardown();
                this.editor   = null;
                this.isEditor = false;
            }
            else
            {
                this.editor = new LevelEditor();
                this.editor.setup(gAllLevels, gCurrentLevelName);
                this.platformer = null;
                this.isEditor   = true;
            }
        }
    }

    OnMousePressed()
    {
        if (this.isEditor)
            this.editor.mousePressed();
    }

    OnMouseDragged()
    {
        if (this.isEditor)
            this.editor.mouseDragged();
    }

    OnMouseMoved()
    {
        if (this.isEditor)
            this.editor.mouseMoved();
    }
}
