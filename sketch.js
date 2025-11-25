// ================= GLOBAL VARIABLES =================

let gameState = 0; // 0 = Start Menu, 1 = Game, 2 = Game Over

let ballX, ballY;
let ballSize = 20;
let ballColor;

let gravity = 1;
let ballSpeedVert = 0;
let airFriction = 0.0001;
let friction = 0.1;

let racketColor;
let racketWidth = 100;
let racketHeight = 10;

let wallSpeed = 5;
let wallInterval = 1000;
let lastAddTime = 0;
let minGapHeight = 200;
let maxGapHeight = 300;
let wallWidth = 80;
let wallRadius = 50;

let walls = [];
let score = 0;
let highScore = 0;

let maxHealth = 100;
let health = 100;
let healthDecrease = 1;
let healthBarWidth = 60;

let ballSpeedHorizon = 10;

let lastFrame;
let blurFrame;

let btnW = 200;
let btnH = 60;
let startBtnX, startBtnY;
let restartBtnX, restartBtnY;



// ================= SETUP =================

function setup() {
  createCanvas(500, 500);

  ballX = width / 4;
  ballY = height / 5;

  ballColor = color(0);
  racketColor = color(0);

  startBtnX = width / 2 - btnW / 2;
  startBtnY = height / 2 + 10;

  restartBtnX = width / 2 - btnW / 2;
  restartBtnY = height / 2 + 40;

  textAlign(CENTER, CENTER);
  rectMode(CORNER);
}



// ================= DRAW =================

function draw() {
  if (gameState === 0) drawStartMenu();
  else if (gameState === 1) runGame();
  else if (gameState === 2) gameOverScreen();
}



// ================= START MENU =================

function drawStartMenu() {
  background(255);

  fill(0);
  textSize(36);
  text("Sky Bounce", width / 2, height / 2 - 120);

  textSize(22);
  text("Welcome!", width / 2, height / 2 - 80);

  drawButton(startBtnX, startBtnY, btnW, btnH, "Start Game", overStartButton());
}



// ================= GAMEPLAY =================

function runGame() {
  background(255);

  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();

  wallAdder();
  wallHandler();

  drawHealthBar();
  drawScoreTop();
}



// ================= INPUT =================

function mousePressed() {
  if (gameState === 0 && overStartButton()) startGame();
  else if (gameState === 2 && overRestartButton()) restart();
}

function startGame() {
  resetGameVars();
  gameState = 1;
}

function restart() {
  resetGameVars();
  gameState = 1;
}

function resetGameVars() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  walls = [];
  lastAddTime = 0;
  ballSpeedHorizon = 10;
  ballSpeedVert = 0;
}



// ================= BALL =================

function drawBall() {
  fill(ballColor);
  noStroke();
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airFriction;
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airFriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function keepInScreen() {
  if (ballY + ballSize / 2 > height) makeBounceBottom(height);
  if (ballY - ballSize / 2 < 0) makeBounceTop(0);
  if (ballX - ballSize / 2 < 0) makeBounceLeft(0);
  if (ballX + ballSize / 2 > width) makeBounceRight(width);
}



// ================= RACKET =================

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  noStroke();
  rect(mouseX, mouseY, racketWidth, racketHeight);
  rectMode(CORNER);
}

function watchRacketBounce() {
  let overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + abs(overhead)) {
      makeBounceBottom(mouseY);

      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }

      ballSpeedHorizon = (ballX - mouseX) / 5;
    }
  }
}



// ================= WALLS =================

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    let randHeight = round(random(minGapHeight, maxGapHeight));
    let randY = round(random(0, height - randHeight));

    walls.push({
      x: width,
      y: randY,
      w: wallWidth,
      h: randHeight,
      scored: false,

      // ⭐ BORDER WARNA RANDOM
      borderColor: color(random(255), random(255), random(255))
    });

    lastAddTime = millis();
  }
}

function wallHandler() {
  for (let i = walls.length - 1; i >= 0; i--) {
    wallMover(walls[i]);
    wallDrawer(walls[i]);
    watchWallCollision(walls[i]);
    wallRemover(i);
  }
}

function wallMover(wall) {
  wall.x -= wallSpeed;
}

function wallRemover(index) {
  if (walls[index].x + walls[index].w <= 0) {
    walls.splice(index, 1);
  }
}

function wallDrawer(wall) {
  stroke(wall.borderColor); // ← WARNA RANDOM
  strokeWeight(3);
  fill(255);

  rect(wall.x, 0, wall.w, wall.y, 0, 0, wallRadius, wallRadius);

  rect(
    wall.x,
    wall.y + wall.h,
    wall.w,
    height - (wall.y + wall.h),
    wallRadius,
    wallRadius,
    0,
    0
  );

  noStroke();
}

function watchWallCollision(wall) {
  let x = wall.x;
  let y = wall.y;
  let w = wall.w;
  let h = wall.h;

  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + w &&
    ballY - ballSize / 2 < y
  ) {
    decreaseHealth();
  }

  if (
    ballX + ballSize / 2 > x &&
    ballX - ballSize / 2 < x + w &&
    ballY + ballSize / 2 > y + h
  ) {
    decreaseHealth();
  }

  if (ballX > x + w / 2 && !wall.scored) {
    wall.scored = true;
    score++;
  }
}



// ================= HEALTH BAR =================

function drawHealthBar() {
  let padding = 2;
  let barHeight = 10;

  stroke(0);
  strokeWeight(2);
  fill(255);
  rect(ballX - healthBarWidth / 2, ballY - 35, healthBarWidth, barHeight, 4);

  noStroke();
  fill(0);

  let innerWidth =
    (healthBarWidth - padding * 2) * (health / maxHealth);

  if (innerWidth < 0) innerWidth = 0;

  rect(
    ballX - healthBarWidth / 2 + padding,
    ballY - 35 + padding,
    innerWidth,
    barHeight - padding * 2,
    3
  );
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    captureAndBlurFrame();
    if (score > highScore) highScore = score;
    gameState = 2;
  }
}



// ================= GAME OVER =================

function captureAndBlurFrame() {
  lastFrame = get();
  blurFrame = lastFrame;
  blurFrame.filter(BLUR, 6);
}

function gameOverScreen() {
  if (blurFrame) image(blurFrame, 0, 0);
  else background(0);

  fill(0, 120);
  rect(0, 0, width, height);

  drawGameOverUI();
}

function drawGameOverUI() {
  fill(255);
  textSize(40);
  text("GAME OVER", width / 2, height / 2 - 80);

  textSize(20);
  text("Score: " + score, width / 2, height / 2 - 30);
  text("High Score: " + highScore, width / 2, height / 2);

  drawButton(
    width / 2 - btnW / 2,
    height / 2 + 40,
    btnW,
    btnH,
    "Restart",
    overRestartButton()
  );
}



// ================= UI BUTTONS =================

function drawButton(x, y, w, h, label, hover) {
  rectMode(CORNER);
  fill(hover ? 230 : 255);
  stroke(0);
  strokeWeight(3);
  rect(x, y, w, h, 10);

  fill(0);
  noStroke();
  textSize(18);
  text(label, x + w / 2, y + h / 2 + 2);
}

function overStartButton() {
  return (
    mouseX > startBtnX &&
    mouseX < startBtnX + btnW &&
    mouseY > startBtnY &&
    mouseY < startBtnY + btnH
  );
}

function overRestartButton() {
  let rx = width / 2 - btnW / 2;
  let ry = height / 2 + 40;
  return (
    mouseX > rx &&
    mouseX < rx + btnW &&
    mouseY > ry &&
    mouseY < ry + btnH
  );
}



// ================= SCORE TOP =================

function drawScoreTop() {
  fill(0);
  textSize(30);
  text(score, width / 2, 50);
}
