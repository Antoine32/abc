let cnv;
let sepChar;

let backColor;
let mousePos;

let img;
let posImg;

let thisUser;
let users = [];

let save = true;
let drawAreaA, drawAreaB;

let colorPicker;
let sliderSize;

let minSize = 1;
let maxSize = 100;

let socket = new WebSocket('ws://localhost:8989');

let del = false;

let pict;

function setup() {
  cnv = createCanvas(windowWidth, (windowHeight * 0.995));
  cnv.mouseWheel(changeSize);
  pixelDensity(1);
  colorMode(HSB);

  sepChar = String.fromCharCode(pow(2, 16) - 1);

  thisUser = new user();
  users.push(thisUser);
  users.push(new user());
  users[1].color = color('rgb(0, 255, 255)');

  backColor = color('rgb(50, 50, 50)');
  mousePos = createVector(mouseX, mouseY);

  drawAreaA = createVector(10, 10);
  drawAreaB = createVector(width - 10, height - 100);

  img = createImage(1120, 640, RGB);
  img.loadPixels();
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      img.set(x, y, backColor);
    }
  }
  img.updatePixels();

  posImg = createVector(0, 0);

  colorPicker = createColorPicker('#fff700');
  colorPicker.size((height - drawAreaB.y) / 2, (height - drawAreaB.y) / 2);
  colorPicker.position((height - drawAreaB.y) * 0.25, height - (height - drawAreaB.y) * 0.75);
  colorPicker.input(setColor);
  thisUser.color = colorPicker.color();

  sliderSize = createSlider(minSize, maxSize, 15);
  sliderSize.size(width / 8, (height - drawAreaB.y) / 8);
  sliderSize.position((height - drawAreaB.y), drawAreaB.y + (height - drawAreaB.y) / 4);
  sliderSize.input(setSize);
  thisUser.size = sliderSize.value();

  //pict = createImg("https://register.conuhacks.io/assets/images/hc_logo2.png");
  //pict.hide();

  let url = window.location.href.replace("http", "ws");
  console.log(url);
}

function draw() {
  background(backColor);
  fill(backColor);
  stroke(255);
  strokeWeight(5);
  rectMode(CORNER);
  rect(drawAreaA.x - 5, drawAreaA.y - 5, (drawAreaB.x - drawAreaA.x) + 10, (drawAreaB.y - drawAreaA.y) + 10);
  image(img.get(posImg.x, posImg.y, (drawAreaB.x - drawAreaA.x), (drawAreaB.y - drawAreaA.y)), drawAreaA.x, drawAreaA.y);
  //image(pict, mouseX, mouseY);

  mousePos.x = lerp(mousePos.x, mouseX, 0.9);
  mousePos.y = lerp(mousePos.y, mouseY, 0.9);

  if (mouseIsPressed && mouseButton == LEFT && thisUser.drawing) {
    if (sq(mousePos.x - thisUser.drawLines[thisUser.drawLines.length - 1].x) + sq(mousePos.y - thisUser.drawLines[thisUser.drawLines.length - 1].y) >= 1) {
      addPoint(1);
    }
  }

  noFill();
  for (let j = 0; j < users.length; j++) {
    stroke(users[j].color);
    strokeWeight(users[j].size);
    beginShape();
    for (let i = 0; i < users[j].drawLines.length; i++) {
      curveVertex(users[j].drawLines[i].x, users[j].drawLines[i].y);
    }
    endShape(OPEN);
  }

  if (save) {
    let buf = get(drawAreaA.x, drawAreaA.y, drawAreaB.x - drawAreaA.x, drawAreaB.y - drawAreaA.y);
    buf.loadPixels();
    for (let j = max(int(thisUser.min.y) - (20 + thisUser.size), 0); j < min(int(thisUser.max.y) + thisUser.size, min(img.height, buf.height)); j++) {
      let a = (j * buf.width * 4);
      let b = (j * img.width * 4);
      for (let i = max(int(thisUser.min.x) - (20 + thisUser.size), 0); i < min(int(thisUser.max.x) + thisUser.size, min(img.width, buf.width)); i++) {
        img.pixels[i * 4 + b] = buf.pixels[i * 4 + a];
        img.pixels[i * 4 + 1 + b] = buf.pixels[i * 4 + 1 + a];
        img.pixels[i * 4 + 2 + b] = buf.pixels[i * 4 + 2 + a];
      }
    }
    img.updatePixels();
    save = false;
    thisUser.drawLines = [];
  }

  if (mouseInRect(drawAreaA.x, drawAreaA.y, drawAreaB.x, drawAreaB.y)) {
    noCursor();
    fill(thisUser.color);
    if (del) {
      stroke(255);
      strokeWeight(1);
    } else {
      noStroke();
    }
    circle(mousePos.x, mousePos.y, thisUser.size);
  } else {
    cursor('auto');
  }
}

function keyPressed() {
  //console.log(key + " | " + keyCode);
  if (key == 'd') {
    if (del) {
      thisUser.color = backColor;
      del = true;
    } else {
      thisUser.color = colorPicker.color();;
      del = false;
    }
  }
}

function mousePressed() {
  if (mouseButton == LEFT && !thisUser.drawing && mouseX >= drawAreaA.x && mouseX <= drawAreaB.x && mouseY >= drawAreaA.y && mouseY <= drawAreaB.y) {
    if (socket.readyState == 1) socket.send("n");

    thisUser.drawLines = [];
    thisUser.drawing = true;
    thisUser.min.set(width, height);
    thisUser.max.set(0, 0);

    addPoint(3);
  }
}

function mouseReleased() {
  if (mouseButton == LEFT && thisUser.drawing) {
    save = true;
    thisUser.drawing = false;
    addPoint(2);

    if (socket.readyState == 1) socket.send("e");
  }
}

function addPoint(i) {
  if (socket.readyState == 1) socket.send("v" + String.fromCharCode(i) + String.fromCharCode(constrain(mousePos.x, drawAreaA.x, drawAreaB.x)) + String.fromCharCode(constrain(mousePos.y, drawAreaA.y, drawAreaB.y)));

  while (i > 0) {
    thisUser.drawLines.push(createVector(constrain(mousePos.x, drawAreaA.x, drawAreaB.x), constrain(mousePos.y, drawAreaA.y, drawAreaB.y)));
    i--;
  }

  if (mousePos.x > thisUser.max.x) {
    thisUser.max.x = mousePos.x;
  }
  if (mousePos.x < thisUser.min.x) {
    thisUser.min.x = mousePos.x;
  }

  if (mousePos.y > thisUser.max.y) {
    thisUser.max.y = mousePos.y;
  }
  if (mousePos.y < thisUser.min.y) {
    thisUser.min.y = mousePos.y;
  }
}

function setColor() {
  thisUser.color = colorPicker.color();
  socket.send('c' + colorPicker.value());
}

function setSize() {
  thisUser.size = int(sliderSize.value());
}

function changeSize(event) {
  thisUser.size = int(constrain(thisUser.size - (event.deltaY / 125), minSize, maxSize));
  sliderSize.value(thisUser.size);
}

function mouseInRect(xA, yA, xB, yB) {
  return (mouseX >= xA && mouseX <= xB) && (mouseY >= yA && mouseY <= yB);
}

window.oncontextmenu = (e) => {
  e.preventDefault();
}
