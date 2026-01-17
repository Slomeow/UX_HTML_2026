let canvas

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0,0);
    canvas.style('z-index', '-1');
    background(150, 50, 10);
}

function draw() {
    noStroke();
    fill(255, 40, 100);
    circle(mouseX, mouseY, width*0.02);
    
}