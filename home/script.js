

let flash = 0;      // number that will go up with time
let flashSpeed = 0.05;  // how fast the button flashes

function setup() {
  // make a tiny hidden canvas (we only need draw loop)
  let cnv = createCanvas(5, 5);
  cnv.position(-1000, -1000);
}

function draw() {
  flashButton();
  pulseStickers();
}

function flashButton() {
  flash += flashSpeed;       // increase flash number
  let wave = sin(flash);     // sine gives smooth up/down -1 to 1

  let btn = document.getElementById("cta");

  if (wave > 0) {
    // white background, black text
    btn.style.backgroundColor = "white";
    btn.style.color = "black";
  } else {
    // orange background, white text
    btn.style.backgroundColor = "#e26f4f";
    btn.style.color = "white";
  }
}


function pulseStickers() {
  let s = 1 + sin(frameCount * 0.05) * 0.03;

  let items = document.querySelectorAll(".pulse");

  items.forEach(function (el) {
    let currentRotate = el.dataset.angle || "0deg";
    el.style.transform = "rotate(" + currentRotate + ") scale(" + s + ")";
  });
}
