let logo;

let rows = 4;
let cols = 14;

let outputW = 896;
let outputH = 192;

let minLogoSize = 5;
let maxLogoSize = 60;

let pushRadius = 120;
let pushStrength = 1.8;

let springStrength = 0.005;
let damping = 0.8;

let floatStrength = 0.01;

let logos = [];

let handData = {
  hands: []
};

let socket;

function setupWebSocket() {
  socket = new WebSocket("ws://localhost:8000");

  socket.onopen = function () {
    console.log("Connected to TouchDesigner WebSocket");
    socket.send("hello from p5");
  };
  socket.onmessage = function (event) {
    try {
      handData = JSON.parse(event.data);
    } catch (e) {
      console.log("Bad WebSocket data", event.data);
    }
  };

  socket.onclose = function () {
    console.log("WebSocket closed. Reconnecting...");
    setTimeout(setupWebSocket, 1000);
  };

  socket.onerror = function (err) {
    console.log("WebSocket error", err);
  };
}
function preload() {
  logo = loadImage("logo.png");
}

function setup() {
  createCanvas(outputW, outputH);
  imageMode(CENTER);
  angleMode(DEGREES);
  pixelDensity(1);
  frameRate(60);

  setupWebSocket();

  createLogoGrid();

}

function draw() {
  background(255);



  let hands = [];

  for (let h of handData.hands) {
    hands.push(createVector(
      h.x * width,
      (1.0 - h.y) * height
    ));
  }

  if (hands.length === 0) {
    hands.push(createVector(mouseX, mouseY));
  }

  for (let l of logos) {
    for (let hand of hands) {
      let dx = l.x - hand.x;
      let dy = l.y - hand.y;
      let d = sqrt(dx * dx + dy * dy);

      if (d < pushRadius && d > 0.001) {
        let force = 1 - d / pushRadius;
        force = smoothstep(force);

        let angle = atan2(dy, dx);

        l.vx += cos(angle) * force * pushStrength;
        l.vy += sin(angle) * force * pushStrength;
      }
    }

    let homeDx = l.homeX - l.x;
    let homeDy = l.homeY - l.y;

    l.vx += homeDx * springStrength;
    l.vy += homeDy * springStrength;

    l.vx += sin(frameCount * 0.02 + l.floatOffset) * floatStrength * 0.02;
    l.vy += cos(frameCount * 0.018 + l.floatOffset) * floatStrength * 0.02;

    l.vx *= damping;
    l.vy *= damping;

    l.x += l.vx;
    l.y += l.vy;

    let moveSpeed = sqrt(l.vx * l.vx + l.vy * l.vy);

    let targetSize = map(
      moveSpeed,
      0,
      8,
      maxLogoSize,
      minLogoSize,
      true
    );

    l.size = lerp(l.size, targetSize, 0.12);

    if (moveSpeed > 0.1) {
      let targetRotation = atan2(l.vy, l.vx);
      l.rotation = lerpAngle(l.rotation, targetRotation, 0.08);
    }

    push();
    translate(l.x, l.y);
    rotate(l.rotation);
    image(logo, 0, 0, l.size, l.size);
    pop();
  }

  noStroke();
  fill(222, 108, 55);

  for (let hand of hands) {
    ellipse(hand.x, hand.y, 20, 20);
  }
}

function createLogoGrid() {
  logos = [];

  let spacingX = outputW / cols;
  let spacingY = outputH / rows;

  for (let r = 0; r < rows; r++) {
    let offsetX = r % 2 === 1 ? spacingX * 0.5 : 0;

    for (let c = 0; c < cols; c++) {
      let x = c * spacingX + offsetX + spacingX * 0.5;
      let y = r * spacingY + spacingY * 0.5;

      logos.push({
        homeX: x,
        homeY: y,

        x: x,
        y: y,

        vx: 0,
        vy: 0,

        size: random(minLogoSize, maxLogoSize),
        rotation: random(360),
        floatOffset: random(1000)
      });
    }
  }
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + 540) % 360) - 180;
  return a + diff * t;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}