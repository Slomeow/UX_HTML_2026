let canvas;
let dropZones = [];
let draggableItems = [];
let draggedItem = null;
let offsetX = 0;
let offsetY = 0;

// Responsive sizing based on screen dimensions
let ZONE_WIDTH;
let ZONE_HEIGHT;
let ITEM_SIZE;
let ZONE_SPACING;

const BG_COLOR = [40, 40, 60]; // Solid dark blue background
const ZONE_COLOR = [100, 150, 200]; // Light blue for zones
const ZONE_HOVER_COLOR = [150, 200, 255]; // Lighter blue on hover
const ITEM_COLOR = [255, 100, 50]; // Orange for items
const ITEM_HOVER_COLOR = [255, 150, 100]; // Lighter orange on hover

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.position(0, 0);
    canvas.style('z-index', '-1');
    
    // Convert viewport units to pixels (1vw = width/100, 1vh = height/100)
    const vw = width / 100;
    const vh = height / 100;
    
    // Calculate responsive sizes using viewport units
    ZONE_WIDTH = vw * 12;  // 12vw
    ZONE_HEIGHT = vh * 20; // 20vh
    ITEM_SIZE = ZONE_WIDTH * 0.6;
    ZONE_SPACING = ZONE_WIDTH * 0.3;
    
    // Create 10 drop zones in a grid (2 rows x 5 columns)
    const startX = vw * 5;  // 5vw from left
    const startY = vh * 5;  // 5vh from top

    let zoneId = 0;
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 5; col++) {
            const x = startX + col * (ZONE_WIDTH + ZONE_SPACING);
            const y = startY + row * (ZONE_HEIGHT + ZONE_SPACING);
            dropZones.push({
                id: zoneId++,
                x: x,
                y: y,
                width: ZONE_WIDTH,
                height: ZONE_HEIGHT,
                occupied: false,
                item: null
            });
        }
    }
    
    // Create some draggable items
    for (let i = 0; i < 5; i++) {
        draggableItems.push({
            id: i,
            x: width - ITEM_SIZE * 2.5 + (i % 3) * ITEM_SIZE * 1.2,
            y: startY + (Math.floor(i / 3) * ITEM_SIZE * 1.5),
            width: ITEM_SIZE,
            height: ITEM_SIZE,
            inZone: null // which zone it's in, null if free
        });
    }
}

function draw() {
    // Solid background
    background(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
    
    // Draw drop zones
    dropZones.forEach(zone => {
        let isHovered = mouseX > zone.x && mouseX < zone.x + zone.width &&
                        mouseY > zone.y && mouseY < zone.y + zone.height;
        
        // Change color on hover
        if (isHovered) {
            fill(ZONE_HOVER_COLOR[0], ZONE_HOVER_COLOR[1], ZONE_HOVER_COLOR[2]);
        } else {
            fill(ZONE_COLOR[0], ZONE_COLOR[1], ZONE_COLOR[2]);
        }


        
        stroke(200);
        strokeWeight(2);
        rect(zone.x, zone.y, zone.width, zone.height, 5);
        
        // Draw zone number
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);
        text(zone.id + 1, zone.x + zone.width / 2, zone.y + zone.height / 2);
    });
    
    // Draw draggable items
    draggableItems.forEach(item => {
        let isHovered = mouseX > item.x && mouseX < item.x + item.width &&
                        mouseY > item.y && mouseY < item.y + item.height;
        
        // Change color on hover
        if (isHovered) {
            fill(ITEM_HOVER_COLOR[0], ITEM_HOVER_COLOR[1], ITEM_HOVER_COLOR[2]);
        } else {
            fill(ITEM_COLOR[0], ITEM_COLOR[1], ITEM_COLOR[2]);
        }
        
        stroke(255);
        strokeWeight(2);
        rect(item.x, item.y, item.width, item.height, 5);
        
        // Draw item number
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text("Item " + (item.id + 1), item.x + item.width / 2, item.y + item.height / 2);
    });
    
    // Draw dragged item on top
    if (draggedItem !== null) {
        fill(ITEM_COLOR[0], ITEM_COLOR[1], ITEM_COLOR[2]);
        stroke(255, 255, 0);
        strokeWeight(3);
        rect(draggedItem.x, draggedItem.y, draggedItem.width, draggedItem.height, 5);
        
        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(12);
        text("Item " + (draggedItem.id + 1), draggedItem.x + draggedItem.width / 2, draggedItem.y + draggedItem.height / 2);
    }
}

function mousePressed() {
    // Check if clicking on an item
    for (let item of draggableItems) {
        if (mouseX > item.x && mouseX < item.x + item.width &&
            mouseY > item.y && mouseY < item.y + item.height) {
            draggedItem = item;
            offsetX = mouseX - item.x;
            offsetY = mouseY - item.y;
            return false;
        }
    }
}

function mouseDragged() {
    if (draggedItem !== null) {
        draggedItem.x = mouseX - offsetX;
        draggedItem.y = mouseY - offsetY;
        return false;
    }
}

function mouseReleased() {
    if (draggedItem !== null) {
        // Check if dropped on a zone
        let droppedOnZone = null;
        
        for (let zone of dropZones) {
            // Check if item center is over zone
            const itemCenterX = draggedItem.x + draggedItem.width / 2;
            const itemCenterY = draggedItem.y + draggedItem.height / 2;
            
            if (itemCenterX > zone.x && itemCenterX < zone.x + zone.width &&
                itemCenterY > zone.y && itemCenterY < zone.y + zone.height) {
                droppedOnZone = zone;
                break;
            }
        }
        
        if (droppedOnZone !== null) {
            // Remove item from previous zone if it was in one
            if (draggedItem.inZone !== null) {
                draggedItem.inZone.occupied = false;
                draggedItem.inZone.item = null;
            }
            
            // Add item to new zone (only one item per zone)
            if (droppedOnZone.item !== null) {
                // Swap or move existing item back to original position
                droppedOnZone.item.inZone = null;
                droppedOnZone.item.x = width - 200;
                droppedOnZone.item.y = 150;
            }
            
            droppedOnZone.occupied = true;
            droppedOnZone.item = draggedItem;
            draggedItem.inZone = droppedOnZone;
            
            // Snap item to center of zone
            draggedItem.x = droppedOnZone.x + (droppedOnZone.width - draggedItem.width) / 2;
            draggedItem.y = droppedOnZone.y + (droppedOnZone.height - draggedItem.height) / 2;
        }
        
        draggedItem = null;
    }
}