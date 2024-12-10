// misc variables
let lastTime = 0;
let currentTime = 0;
let velocity = 0;

// overall game variables
let gameOver = false;
let score = 0;
let jumpHeight = 0;

// game display variables
let gameDisplay;
let gameDisplayHeight = 700;
let gameDisplayWidth = 400;
let context;

// blob variables
let blob = {
  x : gameDisplayWidth/8,
  y : gameDisplayHeight/2,
  width : 50,
  height : 50
}

// wall variables
let wallArray = [];
let wallHeight = 450;               // make sure to adjust if you replace image
let wallWidth = 50;                 // same ^^
let wallX = gameDisplayWidth;
let wallY = 0;

// image variables
let blobImg;
let topWallImg;
let bottomWallImg;

window.onload = onStart;

function onStart() {
  gameDisplay = document.getElementById("gameDisplay");
  context = gameDisplay.getContext("2d");
  gameDisplay.height = gameDisplayHeight;
  gameDisplay.width = gameDisplayWidth;

  const selectedSkin = localStorage.getItem('blobSkin') || 'blob.png';
  blobImg = new Image();
  blobImg.src = `images/${selectedSkin}`;
  blobImg.onload = function() {
    context.drawImage(blobImg, blob.x, blob.y, blob.width, blob.height);
  }

  // create the wall images
  topWallImg = new Image();
  topWallImg.src = "images/downfire.png";

  bottomWallImg = new Image();
  bottomWallImg.src = "images/fire.png";

  requestAnimationFrame(updateFrame);

  // walls are created every 1.5 seconds
  setInterval(createWalls, 1500);

  document.addEventListener("keydown", onJump);
  document.addEventListener("pointerdown", onJump);
}

function resetCanvas() {
  context.clearRect(0, 0, gameDisplay.width, gameDisplay.height);
}

function updateBlob(deltaTime) {
  console.log(blob, blob);
  const acceleration = -9.8 * 100;
  velocity += acceleration * deltaTime;
  blob.y -= velocity * deltaTime;

  console.log("ACC", acceleration, acceleration * deltaTime);
  console.log("VEL", velocity, velocity * deltaTime);

  context.drawImage(
    blobImg, 
    blob.x, 
    blob.y, 
    blob.width, 
    blob.height);
}

function updateFrame(time) {
  let deltaTime = (time - lastTime) / 1000;
  lastTime = time;
  currentTime = time;

  if (gameOver) {
    window.location.href = `gameOver.html?score=${score}`;
    return;
  }

  resetCanvas();
  updateBlob(deltaTime);

  if (blob.y > gameDisplay.height) {
    gameOver = true;
  }

  // place the walls
  for (let i = 0; i < wallArray.length; i++) {
    let wall = wallArray[i];
    wall.x += -2;   // this is the speed that the walls move to the left
    context.drawImage(wall.img, wall.x, wall.y, wall.width, wall.height);

    // if the blob is past the wall then increase the score
    if (!wall.passed && blob.x > wall.x + wall.width) {
      score += 0.5;
      wall.passed = true;
    }

    // checks if the blob hit one of the walls
    if (blob.x < wall.x + wall.width &&
        blob.x + blob.width > wall.x &&
        blob.y < wall.y + wall.height &&
        blob.y + blob.height > wall.y) {
      gameOver = true;
    }
  }

  // display score
  context.fillStyle = "white";
  context.font = "45px sans-serif";
  context.fillText(score, 5, 45);

  //display game over
  if (gameOver) {
    context.fillStyle = "white";
    context.font = "55px sans-serif";
    context.fillText("GAME OVER", 15, gameDisplayHeight/2);
  }
    
  requestAnimationFrame(updateFrame);
}

function createWalls() {
  if (gameOver) {
    return;
  }

  // this line adjusts how much the walls adjust either up or down
  let adjustY = wallY - wallHeight/4 - Math.random() * (wallHeight/2);
  
  let topWall = {
    img : topWallImg,
    x : wallX,
    y : adjustY,
    width : wallWidth,
    height : wallHeight,
    passed : false
  }

  wallArray.push(topWall);

  let bottomWall = {
    img : bottomWallImg,
    x : wallX,
    y : adjustY + wallHeight + gameDisplay.height/4,
    width : wallWidth,
    height : wallHeight,
    passed : false
  }

  wallArray.push(bottomWall);
}

// blob jumps
function onJump(e) {
  if (e.code == "Space" || e.pointerId == 1) {
    velocity = 98 * 5;
  }
}
