class Button {
  constructor(center_x = 0, center_y = 0, button_label = "Click Me") {
    textSize(24);
    const textWidthValue = textWidth(button_label) + 20;
    const default_height = 35;
    this.width = max(textWidthValue, 50);
    this.height = default_height;
    this.baseLeft = center_x - this.width / 2;
    this.baseTop = center_y - default_height / 2;
    this.left = this.baseLeft;
    this.top = this.baseTop;
    this.label = button_label;
    this.mouseIsOver = false;
    this.mouseWasPressed = false;
  }

  DrawButton(offsetX = 0, offsetY = 0) {
    this.left = this.baseLeft + offsetX;
    this.top = this.baseTop + offsetY;

    push();
    stroke(159);
    let fill_color = 220;
    let label_offset = 0;
    if (this.mouseIsOver) {
      if (mouseIsPressed) {
        fill_color = 200;
        label_offset = 1;
      } else {
        fill_color = 240;
      }
    }
    fill(fill_color);
    rect(this.left, this.top, this.width, this.height);

    textAlign(CENTER, CENTER);
    fill(0);
    noStroke();
    textSize(24);
    text(this.label, this.left + this.width / 2, this.top + this.height / 2 + label_offset);

    pop();
  }

  DidClickButton() {
    const left = this.left;
    const top = this.top;
    const right = left + this.width;
    const bottom = top + this.height;

    const within_x = mouseX > left && mouseX < right;
    const within_y = mouseY > top && mouseY < bottom;

    this.mouseIsOver = within_x && within_y;

    const clicked_it = this.mouseIsOver && this.mouseWasPressed && !mouseIsPressed;

    this.mouseWasPressed = mouseIsPressed;

    return clicked_it;
  }
}