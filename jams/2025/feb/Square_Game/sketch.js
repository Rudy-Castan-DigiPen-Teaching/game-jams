let BackgroundColor = 120;
let CurrentScene;

let MainMenuScene;
let CreditsScene;
let CreateScene;

let gFont;

function preload() {
  PreLoadLevels();
  gFont = loadFont('Broken_Robot.ttf');
  PreLoadSounds();
}

function setup() {
  createCanvas(1440, 864);
  LoadLevels();
  textFont(gFont);
  MainMenuScene = new MainMenu();
  CreditsScene = new CreditsScreen();
  CreateScene = new CreateScreen();
  CurrentScene = MainMenuScene;
}

function draw() {
  background(BackgroundColor);
  push();
  CurrentScene.Update();
  pop();
  push();
  CurrentScene.Draw();
  pop();
}

function keyPressed() {
  if (CurrentScene.OnKeyPressed) {
    CurrentScene.OnKeyPressed();
  }
}

function mousePressed() {
   if (CurrentScene.OnMousePressed) {
    CurrentScene.OnMousePressed();
  }
}

function mouseDragged() {
   if (CurrentScene.OnMouseDragged) {
    CurrentScene.OnMouseDragged();
  }
}

function keyReleased(){
  if (CurrentScene.OnKeyReleased) {
    CurrentScene.OnKeyReleased();
  }
}

