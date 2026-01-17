function setup() {
    createCanvas(window.innerWidth, 400);
    background(150, 50, 10);
}

function draw() {
    noStroke();
    fill(255, 40, 100);
    circle(mouseX, mouseY, width*0.02);
    
}