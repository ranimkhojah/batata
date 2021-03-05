// Create the canvas for the game to display in
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1220;
canvas.height = 590;
document.body.appendChild(canvas);
// Load the background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
  // show the background image
  bgReady = true;
};
bgImage.src = "imgs/background.gif";
// Load the potato image
var potatoReady = false;
var potatoImage = new Image();
potatoImage.onload = function () {
  // show the here image
  potatoReady = true;
};
potatoImage.src = "imgs/potato.png";
// Load the monster image
var monsterReady = false;
var monsterImage = new Image();
monsterImage.onload = function () {
  // show the monster image
  monsterReady = true;
};
monsterImage.src = "images/potato.png";
// Create the game objects
var potato = {
  speed: 256 // movement speed of potato in pixels per second
};
var monster = {};
var monstersCaught = 0;
// Handle keyboard controls
var keysDown = {};
// Check for keys pressed where key represents the keycode captured
addEventListener("keydown", function (key) {
  keysDown[key.keyCode] = true;
}, false);
addEventListener("keyup", function (key) {
  delete keysDown[key.keyCode];
}, false);
// Reset the player and monster positions when player catches a monster
var reset = function () {
  // Reset player's position to centre of canvas
  potato.x = 90;
  potato.y = 450;
  // Place the monster somewhere on the canvas randomly
  monster.x = 32 + (Math.random() * (canvas.width - 64));
  monster.y = 32 + (Math.random() * (canvas.height - 64));
};
// Update game objects - change player position based on key pressed
var update = function (modifier) {
  if (38 in keysDown) { // Player is holding up key
    potato.y -= potato.speed * modifier;
  }
  if (40 in keysDown) { // Player is holding down key
    potato.y += potato.speed * modifier;
  }
  if (37 in keysDown) { // Player is holding left key
    potato.x -= potato.speed * modifier;
  }
  if (39 in keysDown) { // Player is holding right key
    potato.x += potato.speed * modifier;
  }
  // Check if player and monster collider
  if (
    potato.x <= (monster.x + 32)
    && monster.x <= (potato.x + 32)
    && potato.y <= (monster.y + 32)
    && monster.y <= (potato.y + 32)
  ) {
    ++monstersCaught;
    reset();
  }
};
// Draw everything on the canvas
var render = function () {
  if (bgReady) {
    ctx.drawImage(bgImage, 0, 0, 1220, 590);
  }
  if (potatoReady) {
    ctx.drawImage(potatoImage, potato.x, potato.y, 48,52);
  }
  if (monsterReady) {
    ctx.drawImage(monsterImage, monster.x, monster.y,32,32);
  }
  // Display score and time 
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.font = "24px Helvetica";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Monsters caught: " + monstersCaught, 20, 20);
  ctx.fillText("Time: " + count, 20, 50);
  // Display game over message when timer finished
  if(finished==true){
    ctx.fillText("Game over!", 200, 220);
  }
  
};
var count = 30; // how many seconds the game lasts for - default 30
var finished = false;
var counter =function(){
  count=count-1; // countown by 1 every second
  // when count reaches 0 clear the timer, hide monster and
  // potato and finish the game
    if (count <= 0)
    {
      // stop the timer
       clearInterval(counter);
       // set game to finished
       finished = true;
       count=0;
       // hider monster and potato
       monsterReady=false;
       potatoReady=false;
    }
}
// timer interval is every second (1000ms)
setInterval(counter, 1000);
// The main game loop
var main = function () {
  // run the update function
  update(0.02); // do not change
  // run the render function
  render();
  // Request to do this again ASAP
  requestAnimationFrame(main);
};
// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;
// Let's play this game!
reset();
main();