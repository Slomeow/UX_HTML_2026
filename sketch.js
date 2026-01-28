let dropZones = [];
let draggableItems = [];
let draggedItem = null;
let offsetX = 0;
let offsetY = 0;

const NUM_ZONES = 10;
const NUM_ITEMS = 5;
const ITEM_IMAGES = ['Images/IMG_5369.png', 'Images/Chosen.png', 'Images/MartinGoesOutsideScan.png', 'Images/CirCat1.png'];

function initializeGame() {
    const zonesGrid = document.getElementById('zonesGrid');
    const itemsContainer = document.getElementById('itemsContainer');
    
    // Clear existing content
    zonesGrid.innerHTML = '';
    itemsContainer.innerHTML = '';
    dropZones = [];
    draggableItems = [];
    
    // Create drop zones
    for (let i = 0; i < NUM_ZONES; i++) {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.textContent = i + 1;
        zone.id = `zone-${i}`;
        
        const zoneData = {
            id: i,
            element: zone,
            occupied: false,
            item: null
        };
        
        dropZones.push(zoneData);
        zonesGrid.appendChild(zone);
    }
    
    // Create draggable items in random zones
    const usedZoneIndices = [];
    for (let i = 0; i < NUM_ITEMS; i++) {
        // Pick a random zone that hasn't been used
        let randomZoneIndex;
        do {
            randomZoneIndex = Math.floor(Math.random() * dropZones.length);
        } while (usedZoneIndices.includes(randomZoneIndex));
        
        usedZoneIndices.push(randomZoneIndex);
        const zone = dropZones[randomZoneIndex];
        
        // Cycle through images for each item
        const imageIndex = i % ITEM_IMAGES.length;
        const imagePath = ITEM_IMAGES[imageIndex];
        
        const item = document.createElement('img');
        item.className = 'draggable-item';
        item.src = imagePath;
        item.alt = `Item ${i + 1}`;
        item.id = `item-${i}`;
        item.draggable = false; // We'll use mouse events instead
        
        const itemData = {
            id: i,
            element: item,
            inZone: zone,
            startX: 0,
            startY: 0
        };

        zone.item = itemData;
        
        // Position item in the center of the zone
        positionItemInZone(zone.item.element, zone);
        
        draggableItems.push(itemData);
        itemsContainer.appendChild(item);
        
        // Mark zone as occupied
        zone.occupied = true;
        zone.item = itemData;
        zone.element.classList.add('occupied');
        
        // Add event listeners
        item.addEventListener('mousedown', handleMouseDown);
    }
}

function positionItemInZone(itemElement, zone) {
    const zoneRect = zone.element.getBoundingClientRect();
    const itemRect = itemElement.getBoundingClientRect();
    
    const centerX = zoneRect.width / 2 + zoneRect.left - itemRect.width / 2;
    const centerY = zoneRect.top + (zoneRect.height - itemRect.height) / 2;
    
    itemElement.style.left = centerX + 'px';
    itemElement.style.top = centerY + 'px';
}

function handleMouseDown(e) {
    const itemElement = e.currentTarget;
    draggedItem = draggableItems.find(item => item.element === itemElement);
    
    if (!draggedItem) return;
    
    // Store starting position
    draggedItem.startX = parseInt(itemElement.style.left) || 0;
    draggedItem.startY = parseInt(itemElement.style.top) || 0;
    
    // Calculate offset between mouse and element position
    offsetX = e.clientX - draggedItem.startX;
    offsetY = e.clientY - draggedItem.startY;
    
    itemElement.classList.add('dragging');
    itemElement.style.zIndex = '1000';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
}

function handleMouseMove(e) {
    if (!draggedItem) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    draggedItem.element.style.left = x + 'px';
    draggedItem.element.style.top = y + 'px';
}

function handleMouseUp(e) {
    if (!draggedItem) return;
    
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    draggedItem.element.classList.remove('dragging');
    
    // Check if dropped on a zone
    const itemRect = draggedItem.element.getBoundingClientRect();
    const itemCenterX = itemRect.left + itemRect.width / 2;
    const itemCenterY = itemRect.top + itemRect.height / 2;
    
    let droppedOnZone = null;
    for (let zone of dropZones) {
        const zoneRect = zone.element.getBoundingClientRect();
        if (itemCenterX > zoneRect.left && itemCenterX < zoneRect.right &&
            itemCenterY > zoneRect.top && itemCenterY < zoneRect.bottom) {
            droppedOnZone = zone;
            break;
        }
    }
    
    if (droppedOnZone) {
        // Remove item from previous zone if it was in one
        if (draggedItem.inZone) {
            draggedItem.inZone.occupied = false;
            draggedItem.inZone.item = null;
            draggedItem.inZone.element.classList.remove('occupied');
        }
        
        // If zone is occupied, move existing item back to free space
        if (droppedOnZone.item) {
            const oldItem = droppedOnZone.item;
            oldItem.inZone = null;
            // Position it near the items area on the right
            oldItem.element.style.left = (window.innerWidth - 200) + 'px';
            oldItem.element.style.top = '100px';
        }
        
        // Place current item in zone
        droppedOnZone.occupied = true;
        droppedOnZone.item = draggedItem;
        draggedItem.inZone = droppedOnZone;
        droppedOnZone.element.classList.add('occupied');
        
        // Snap to center of zone
        positionItemInZone(draggedItem.element, droppedOnZone);
    } else {
        // Remove from zone if it was in one
        if (draggedItem.inZone) {
            draggedItem.inZone.occupied = false;
            draggedItem.inZone.item = null;
            draggedItem.inZone.element.classList.remove('occupied');
            draggedItem.inZone = null;
        }
    }
    
    draggedItem.element.style.zIndex = 'auto';
    draggedItem = null;
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', initializeGame);