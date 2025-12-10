// loading main grid product image names
let gridNames = ["wash.png", "tone.png", "serum.png", "cream.png", "mask.png", "goop.png"];
let gridImgs = [];

// loading additional chaotic images that appear after interaction
let chaosNames = ["spawn1.jpg", "spawn2.jpg", "spawn3.jpg", "spawn4.jpg", "spawn5.jpg", "spawn6.jpg", "spawn8.jpg"];
let chaosImgs = [];

// storing grid layout data, glitch objects, and activation flags
let gridCards = [];      // each entry holds position, size, velocity, and scale for a grid image
let glitchGrid = [];     // each entry holds a Glitch() instance for that grid image
let gridShouldGlitch = [];// flags for which grid images are currently glitching

// storing floating chaotic images triggered after clicking
let floating = [];       // each entry is one floating chaos image

// storing all BUY NOW flashing text objects
let buyNow = [];         // each entry is one flashing text object

// storing error popup image and all cascading popup instances
let errorImg;            // the actual error.png image
let errorPopups = [];    // array of all popup rectangles
let errorInterval = 5;   // controls how often a new error popup appears (lower = more frequent)
let errorCounter = 0;    // counts frames until the next popup
let startErrors = false; // flips to true after the first grid click to start the cascade

// frame counter used for glitch timing and repeated motion
let frameCounter = 0;


// loading all images before setup runs
function preload() {
  // loading each main grid product image by name
  for (let name of gridNames) {
    gridImgs.push(loadImage(name));
  }

  // loading each extra chaotic image by name
  for (let name of chaosNames) {
    chaosImgs.push(loadImage(name));
  }

  // loading error popup graphic
  errorImg = loadImage("error.png");
}


// creating the canvas and preparing all structures
function setup() {
  // creating full-window canvas
  createCanvas(windowWidth, windowHeight);

  // centering all imageMode draw calls from the middle
  imageMode(CENTER);

  // creating glitch objects and disabling glitching initially
  for (let i = 0; i < gridImgs.length; i++) {
    glitchGrid[i] = new Glitch();  // one Glitch instance for each grid image
    gridShouldGlitch[i] = false;   // glitching starts off for all images
  }

  // building centered 3×2 grid layout
  buildGrid();
}


// creating the centered 3×2 grid structure
function buildGrid() {
  // clearing any existing grid cards before rebuilding
  gridCards = [];

  // defining grid layout parameters
  let cols = 3;       // number of columns
  let rows = 2;       // number of rows
  let w = 260;        // width of each grid image
  let h = 260;        // height of each grid image
  let spacingX = w + 80; // horizontal spacing between grid cells
  let spacingY = h + 80; // vertical spacing between grid cells

  // calculating total width/height of the entire grid layout
  let totalW = spacingX * (cols - 1);
  let totalH = spacingY * (rows - 1);

  // calculating offsets so the grid sits in the center horizontally
  // and slightly lower vertically to give space under the marquee
  let startX = width / 2 - totalW / 2;
  let startY = height / 2 - totalH / 2 + 30; //shifting the whole grid more towards the middle

  // storing each grid cell’s position, velocity, and scale
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridCards.push({
        x: startX + c * spacingX, // center x of this grid image
        y: startY + r * spacingY, // center y of this grid image
        w: w,                     // base width
        h: h,                     // base height
        vx: 0,                    // x velocity (0 until activated)
        vy: 0,                    // y velocity (0 until activated)
        scale: 1                  // scale for hover effect (1 = normal size)
      });
    }
  }
}


// applying randomly selected glitch operations to an image
function applyRandomGlitch(glitcher, img) {
  // loading the source image into the glitcher
  glitcher.loadImage(img);

  // resetting any previous byte changes
  glitcher.resetBytes();

  // selecting a glitch mode randomly
  let mode = int(random(3));

  // each mode applies a different type of corruption
  if (mode === 0) {
    // mild corruption with fewer random bytes
    glitcher.randomBytes(int(random(5, 25)));
  }
  if (mode === 1) {
    // heavier corruption with more random bytes
    glitcher.randomBytes(int(random(20, 60)));
  }
  if (mode === 2) {
    // replacing a few random bytes to push color shifts
    for (let i = 0; i < 3; i++) {
      glitcher.replaceByte(int(random(255)));
    }
  }

  // rebuilding and storing the glitched output image
  glitcher.buildImage();
}


// main animation loop running every frame
function draw() {
  // painting the background black every frame
  background(0);

  // advancing frame count to drive timing logic
  frameCounter++;

  // handling movement of grid items (after glitch is active)
  updateGridMovement();

  // drawing grid images (either clean or glitched + hover scale)
  drawGrid();

  // updating positions of floating chaos images
  updateFloating();

  // drawing floating chaos images with glitch updates
  drawFloating();

  // updating BUY NOW text positions and lifetimes
  updateBuyNow();

  // drawing all BUY NOW text instances
  drawBuyNow();

  // once interaction happens, error popups start appearing
  if (startErrors) {
    updateErrors(); // adding new error popups over time
    drawErrors();   // drawing all error popups on top
  }
}


// updating movement for each grid item once glitching is activated
function updateGridMovement() {
  for (let i = 0; i < gridCards.length; i++) {

    // skipping any grid card that has not been turned on yet
    if (!gridShouldGlitch[i]) continue;

    // grabbing reference to this card
    let c = gridCards[i];

    // applying stored velocity values to position
    c.x += c.vx;
    c.y += c.vy;

    // reversing direction when touching left/right boundaries
    if (c.x < 0 || c.x > width) {
      c.vx *= -1;
    }

    // reversing direction when touching top/bottom boundaries
    if (c.y < 0 || c.y > height) {
      c.vy *= -1;
    }
  }
}


// drawing each grid product, applying glitching and hover scaling
function drawGrid() {
  for (let i = 0; i < gridImgs.length; i++) {
    // reading this card’s layout and state
    let c = gridCards[i];

    // checking if mouse hovers over this grid image
    let hovered =
      mouseX > c.x - c.w / 2 &&
      mouseX < c.x + c.w / 2 &&
      mouseY > c.y - c.h / 2 &&
      mouseY < c.y + c.h / 2;

    // setting the target scale based on hover state
    let targetScale = hovered ? 1.15 : 1.0;

    // easing the current scale toward the target scale
    c.scale += (targetScale - c.scale) * 0.15;

    // preparing to draw this card with its own transform
    push();
    translate(c.x, c.y);    // move to card center
    scale(c.scale);         // apply hover scale around center

    // if this image should glitch, draw from the glitched buffer
    if (gridShouldGlitch[i]) {
      // updating the glitch every few frames to keep motion visible
      if (frameCounter % 4 === 0) {
        applyRandomGlitch(glitchGrid[i], gridImgs[i]);
      }
      image(glitchGrid[i].image, 0, 0, c.w, c.h);
    }

    // if glitching is off, drawing the original clean image
    else {
      image(gridImgs[i], 0, 0, c.w, c.h);
    }

    // restoring transform state
    pop();
  }
}


// detecting interaction and triggering all chaotic behaviors
function mousePressed() {
  // checking whether the click intersects any grid item
  let clicked = gridCards.some((c) =>
    mouseX > c.x - c.w / 2 &&
    mouseX < c.x + c.w / 2 &&
    mouseY > c.y - c.h / 2 &&
    mouseY < c.y + c.h / 2
  );

  // ignoring clicks outside the grid area
  if (!clicked) return;

  // enabling movement and glitching for all grid items
  for (let i = 0; i < gridCards.length; i++) {
    // assigning random drifting velocities for each grid card
    gridCards[i].vx = random(-1.5, 1.5);
    gridCards[i].vy = random(-1.5, 1.5);

    // turning glitching on for this grid card
    gridShouldGlitch[i] = true;
  }

  // creating floating chaotic image clones
  spawnFloatingChaos();

  // creating multiple BUY NOW text instances
  spawnBuyNow();

  // turning on the cascading error popup system
  startErrors = true;
errorCounter = 0;   // resetting error timer 
}


// creating 50 chaotic floating images after the first click
function spawnFloatingChaos() {
  // clearing any previous floating objects
  floating = [];

  // merging all grid images and chaos images into one source pool
  let pool = gridImgs.concat(chaosImgs);

  // building 50 floating image objects
  for (let i = 0; i < 50; i++) {
    floating.push({
      img: random(pool),       // randomly picked source image
      glitcher: new Glitch(),  // glitch engine for this floating image

      // random starting position
      x: random(width),
      y: random(height),

      // random size range for variation
      w: random(200, 260),
      h: random(200, 260),

      // slight random drift motion in x and y
      vx: random(-1.4, 1.4),
      vy: random(-1.4, 1.4)
    });
  }
}


// updating movement for floating chaos images
function updateFloating() {
  for (let f of floating) {
    // applying velocity to position
    f.x += f.vx;
    f.y += f.vy;

    // bouncing horizontally on screen edges
    if (f.x < 0 || f.x > width) {
      f.vx *= -1;
    }

    // bouncing vertically on screen edges
    if (f.y < 0 || f.y > height) {
      f.vy *= -1;
    }
  }
}


// drawing floating chaos images and applying timed glitching
function drawFloating() {
  for (let f of floating) {
    // applying glitch update every few frames for motion
    if (frameCounter % 6 === 0) {
      applyRandomGlitch(f.glitcher, f.img);
    }

    // drawing the glitched image at its current position and size
    image(f.glitcher.image, f.x, f.y, f.w, f.h);
  }
}


// creating multiple BUY NOW text objects
function spawnBuyNow() {
  // clearing any previous text objects
  buyNow = [];

  // creating several BUY NOW entries
  for (let i = 0; i < 6; i++) {
    buyNow.push({
      text: "BUY NOW!",            // text content
      x: random(width),            // starting x position
      y: random(height),           // starting y position
      size: random(110, 140),      // font size
      life: int(random(10, 20)),   // frames before repositioning
      maxLife: 25                  // not directly used but kept for possible fades
    });
  }
}


// updating each BUY NOW object's lifetime and repositioning when expired
function updateBuyNow() {
  for (let b of buyNow) {
    // decreasing lifetime every frame
    b.life--;

    // when lifetime expires, giving it a new random position and size
    if (b.life <= 0) {
      b.x = random(width);
      b.y = random(height);
      b.size = random(110, 150);
      b.life = int(random(10, 15));
    }
  }
}


// drawing flashing BUY NOW text with outlined Impact font
function drawBuyNow() {
  for (let b of buyNow) {
    // starting a new drawing state for each text instance
    push();

    // moving origin to this text’s position
    translate(b.x, b.y);

    // setting Impact typeface and size
    textFont("Impact");
    textSize(b.size);

    // centering the text around the origin
    textAlign(CENTER, CENTER);

    // drawing black outline around the text
    stroke(0);
    strokeWeight(4);

    // filling text with bright red for urgency
    fill(255, 0, 0);

    // rendering the text at (0,0) after translate
    text(b.text, 0, 0);

    // restoring the previous state
    pop();
  }
}


// updating the interval timing for generating new error popups
function updateErrors() {
  // stepping the local counter
  errorCounter++;

  // once the counter hits the interval, new popup is created
  if (errorCounter >= errorInterval) {

    // limiting total popups for stability
    if (errorPopups.length < 120) {
      errorPopups.push({
        x: random(width - 260),  // random x so popup stays fully on screen
        y: random(height - 160), // random y so popup stays fully on screen
        w: 260,                  // popup width
        h: 160                   // popup height
      });
    }

    // resetting counter after creating a new error popup
    errorCounter = 0;
  }
}



// drawing all existing error popup windows
function drawErrors() {
  for (let e of errorPopups) {
    // drawing the error image at its stored position and size
    image(errorImg, e.x, e.y, e.w, e.h);
  }
}


// rebuilding layout on window resize so the grid stays centered
function windowResized() {
  // resizing canvas to match new window size
  resizeCanvas(windowWidth, windowHeight);

  // rebuilding grid positions based on new dimensions
  buildGrid();
}
