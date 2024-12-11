class GameData {
  money = 0;
  score = 0;
  highScore = 0;
  speed = 1;
  started = false;
  ended = false;
}

class Time {
  previous = 0;
  current = 0;
  delta = 0;
}

class Canvas {
  moneyText;
  pointsText;
  highPointsText;
  speedText;
  viewport;
  context;
  
  height = 700;
  width = 400;
}

class Blob {
  x = 0;
  y = 0;
  width = 50;
  height = 50;
  sprite;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Wall {
  x = 0;
  y = 0;
  width = 50;
  height = 450;
  sprite = undefined;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  collidesWith(x, y, w, h) {
    return (
      x < this.x + this.width 
      && x + w > this.x 
      && y < this.y + this.height 
      && y + h > this.y);
  }
}

class WallPair {
  top;
  bottom;
  passed = false;

  collidesWith(x, y, w, h) {
    return (
      this.top.collidesWith(x, y, w, h) 
      || this.bottom.collidesWith(x, y, w, h));
  }
}

const acceleration = -9.8 * 100;
const canvas = new Canvas();
let pageHome;
let pageGame;
let pageEnd;
let pageInstructions;

let wallPairs = [];
let velocity = 0;
let wallX = canvas.width;
let wallY = 0;
let wallWidth = 50;
let wallHeight = 450;
let topWallSprite;
let bottomWallSprite;

const data = new GameData();
const time = new Time();
const blob = new Blob(canvas.width / 8, canvas.height / 2);

window.onload = onStart;

// Nav
function goHome() {
  hideAll();
  pageHome.hidden = false;
}

function goInstructions() {
  hideAll();
  pageInstructions.hidden = false;
}

function goPlay() {
  console.log("goplay");
  hideAll();
  pageGame.hidden = false;
  data.ended = false;
  data.started = false;
  data.score = 0;
  data.speed = 1;
  blob.x = canvas.width / 8;
  blob.y = canvas.height / 2;
  wallPairs = [];
  velocity = 0;
  requestAnimationFrame(onUpdate);
}

function goEnd() {
  hideAll();
  pageEnd.hidden = false;
}

function hideAll() {
  pageHome.hidden = true;
  pageGame.hidden = true;
  pageEnd.hidden = true;
  pageInstructions.hidden = true;
}

// Events
function onStart() {
  pageHome = document.getElementById("game-home");
  pageGame = document.getElementById("game-viewport");
  pageEnd = document.getElementById("game-end");
  pageInstructions = document.getElementById("game-instructions");
  
  goHome();
  createCanvas();
  updateCanvas();
  createBlob();
  createWallInstances();

  setInterval(createWallPair, 1500);
  document.addEventListener("keydown", onJump);
}

function onUpdate(currentTime) {
  resetCanvas();
  updateCanvas();
  updateTime(currentTime);

  if (!data.started) {
    canvas.context.fillStyle = "black";
    canvas.context.font = "24px sans-serif";
    canvas.context.fillText("Press Space to Begin!", canvas.width / 2 - 112, canvas.height / 2);
    requestAnimationFrame(onUpdate);
    return;
  }

  if (data.ended) {
    canvas.context.fillStyle = "white";
    canvas.context.font = "55px sans-serif";
    canvas.context.fillText("GAME OVER", 15, canvas.height / 2);
    goEnd();
    return;
  }

  data.speed += time.delta / 100;

  updateBlob();

  if (blob.y > canvas.height || blob.y <= 0) {
    data.ended = true;
  } else {
    updateWalls();
  }

  requestAnimationFrame(onUpdate);
}

function onJump(event) {
  if (event.code !== "Space") return;
  velocity = 98 * 4; // difficulty = point mult
  if (!data.started) {
    data.started = true;
    data.ended = false;
  }
}

function onSkinSelect() {
  createBlob();
}

function createCanvas() {
  canvas.moneyText = document.getElementById("game-money");
  canvas.pointsText = document.getElementById("game-points");
  canvas.highPointsText = document.getElementById("game-highpoints");
  canvas.speedText = document.getElementById("game-speed");
  canvas.viewport = document.getElementById("game-viewport");
  canvas.viewport.height = canvas.height;
  canvas.viewport.width = canvas.width;
  canvas.context = canvas.viewport.getContext("2d");
}

function createBlob() {
  const selectedSkin = document.getElementById("skinDropdown").value;
  blob.sprite = new Image();
  blob.sprite.src = `images/${selectedSkin}`;
  blob.sprite.onload = canvas.context.drawImage(
    blob.sprite, 
    blob.x, 
    blob.y, 
    blob.width, 
    blob.height);
}

function createWallInstances() {
  topWallSprite = new Image();
  topWallSprite.src = "images/downfire.png";
  bottomWallSprite = new Image();
  bottomWallSprite.src = "images/fire.png";
}

function createWallPair() {
  if (data.ended || !data.started) return;

  // this line adjusts how much the walls adjust either up or down
  const newY = wallY - wallHeight / 4 - Math.random() * (wallHeight / 2);
  const wallPair = new WallPair();

  wallPair.top = new Wall();
  wallPair.top.sprite = topWallSprite;
  wallPair.top.x = wallX;
  wallPair.top.y = newY;
  wallPair.top.width = wallWidth;
  wallPair.top.height = wallHeight;
  
  wallPair.bottom = new Wall();
  wallPair.bottom.sprite = bottomWallSprite;
  wallPair.bottom.x = wallX;
  wallPair.bottom.y = newY + wallHeight + canvas.height / 4;
  wallPair.bottom.width = wallWidth;
  wallPair.bottom.height = wallHeight;

  wallPairs.push(wallPair);
}

function resetCanvas() {
  canvas.context.clearRect(0, 0, canvas.width, canvas.height);
}

function updateTime(currentTime) {
  time.delta = (currentTime - time.previous) / 1000;
  time.previous = time.current = currentTime;
}

function updateCanvas() {
  canvas.moneyText.innerHTML = `\$${data.money.toFixed(2)}`;
  canvas.pointsText.innerHTML = `${data.score.toFixed(0)} Points`;
  canvas.highPointsText.innerHTML = `${data.highScore.toFixed(0)} Highest`;
  canvas.speedText.innerHTML = `${data.speed.toFixed(2)}x Speed`;
}

function updateBlob() {
  velocity += acceleration * time.delta;
  blob.y -= velocity * time.delta;

  canvas.context.drawImage(
    blob.sprite, 
    blob.x, 
    blob.y, 
    blob.width, 
    blob.height);
}

function updateWalls() {
  wallPairs = wallPairs.filter(pair => {
    pair.top.x -= data.speed * time.delta * 100;
    pair.bottom.x -= data.speed * time.delta * 100;
    
    canvas.context.drawImage(
      pair.top.sprite, 
      pair.top.x, 
      pair.top.y, 
      pair.top.width, 
      pair.top.height);

    canvas.context.drawImage(
      pair.bottom.sprite, 
      pair.bottom.x, 
      pair.bottom.y, 
      pair.bottom.width, 
      pair.bottom.height);

    if (pair.collidesWith(blob.x, blob.y, blob.width * 0.75, blob.height * 0.75)) {
      data.ended = true;
      return false;
    }

    if (!pair.passed && blob.x > pair.top.x + pair.top.width) {
      data.score++;
      if (data.score > data.highScore)
        data.highScore = data.score;
      data.money += data.speed * 1;
      pair.passed = true;
    }

    return pair.top.x + pair.top.width > 0;
  });
}
