let BackgroundColor = 120;
let CurrentScene;

let MainMenuScene;
let CreditsScene;
let CreateScene;

let gMenuFont;
let gGameFont;

function preload()
{
    PreLoadLevels();
    gMenuFont = loadFont('Broken_Robot.ttf');
    gGameFont = loadFont('04B_03__.ttf');
    PreLoadSounds();
}

function setup()
{
    createCanvas(1440, 864);
    LoadLevels();
    textFont(gMenuFont);
    MainMenuScene = new MainMenu();
    CreditsScene  = new CreditsScreen();
    CreateScene   = new CreateScreen();
    CurrentScene  = MainMenuScene;
}

function draw()
{
    // Animated background cycling through 5 colors
    let cycleSpeed = 0.015 / 4;                              // Speed of color transition
    let colorPhase = (sin(frameCount * cycleSpeed) + 1) / 2; // Oscillates between 0 and 1

    // Define the 5 colors to cycle through
    let colors = [
        color("#ff6f61"), // Coral red
        color("#d9b68c"), // Warm beige
        color("#f7c6a0"), // Peach
        color("#f9e4b7"), // Light cream
        color("#f1f1f1")  // Light gray
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
    CurrentScene.Update();
    pop();
    push();
    CurrentScene.Draw();
    pop();
}

function keyPressed()
{
    if (CurrentScene.OnKeyPressed)
    {
        CurrentScene.OnKeyPressed();
    }
    // Prevent default behavior for arrow keys to stop focus switching
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)
    {
        return false; // Prevents default behavior
    }
}

function mousePressed()
{
    if (CurrentScene.OnMousePressed)
    {
        CurrentScene.OnMousePressed();
    }
}

function mouseDragged()
{
    if (CurrentScene.OnMouseDragged)
    {
        CurrentScene.OnMouseDragged();
    }
}

function mouseMoved()
{
    if (CurrentScene.OnMouseMoved)
    {
        CurrentScene.OnMouseMoved();
    }
}

function keyReleased()
{
    if (CurrentScene.OnKeyReleased)
    {
        CurrentScene.OnKeyReleased();
    }
}
