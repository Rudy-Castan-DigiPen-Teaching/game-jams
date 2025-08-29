

function DrawTitle(label)
{
    push();
    textFont(gMenuFont);
    textAlign(CENTER);
    textSize(120);
    fill(0);
    noStroke();
    text(label, width / 2, 100);
    pop();
}
