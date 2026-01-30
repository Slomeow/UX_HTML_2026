let dropZones = [];
let draggableItems = [];
let draggedItem = null;
let draggedTape = null;
let offsetX = 0;
let offsetY = 0;
let pendingZoneForName = null; // Track which zone needs a name
let tapePieces = []; // Track all placed tape pieces

const NUM_ZONES = 10;
const NUM_ITEMS = 5;
const ITEM_IMAGES = ['Images/IMG_5369.png', 'Images/Chosen.png', 'Images/MartinGoesOutsideScan.png', 'Images/CirCat1.png'];

// Metadata for each image
const IMAGE_METADATA = {
    'Images/IMG_5369.png': {
        dimensions: '5 x 5',
        medium: 'pixel art',
        year: '2024',
        frame: 'Images/Square_frame2.png',
        frameWidth: '40vw',
        frameHeight: '40vh'
    },
    'Images/Chosen.png': {
        dimensions: '9 x 12',
        medium: 'linocut print',
        year: '2025',
        frame: 'Images/Portrait_frame1.png',
        frameWidth: '25vw',
        frameHeight: '35vh'
    },
    'Images/MartinGoesOutsideScan.png': {
        dimensions: '5 x 10',
        medium: 'oil pastel',
        year: '2025',
        frame: 'Images/Portrait_frame1.png',
        frameWidth: '16vw',
        frameHeight: '26vh'
    },
    'Images/CirCat1.png': {
        dimensions: '8 x 8',
        medium: 'digital art',
        year: '2025',
        frame: 'Images/Portrait_frame1.png',
        frameWidth: '16vw',
        frameHeight: '26vh'
    }
};

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
        
        // Get metadata for this image
        const metadata = IMAGE_METADATA[imagePath] || {
            dimensions: 'N/A',
            medium: 'N/A',
            year: 'N/A'
        };
        
        // Create name label for this item
        const itemLabel = document.createElement('div');
        itemLabel.className = 'item-label';
        itemLabel.id = `item-label-${i}`;
        
        const itemData = {
            id: i,
            element: item,
            label: itemLabel,
            metadata: metadata,
            frame: null,
            frameOffsetX: 0,
            frameOffsetY: 0,
            inZone: zone,
            startX: 0,
            startY: 0,
            itemName: null
        };

        zone.item = itemData;
        
        // Position item in the center of the zone
        positionItemInZone(zone.item.element, zone);
        
        draggableItems.push(itemData);
        itemsContainer.appendChild(item);
        itemsContainer.appendChild(itemLabel);
        
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
    
    // Position label below the image
    const itemData = draggableItems.find(item => item.element === itemElement);
    if (itemData && itemData.label) {
        const labelX = centerX + itemRect.width / 2 - itemData.label.offsetWidth / 2;
        const labelY = centerY + itemRect.height + 5; // 5px below image
        
        itemData.label.style.left = labelX + 'px';
        itemData.label.style.top = labelY + 'px';
    }
}

function handleMouseDown(e) {
    const itemElement = e.currentTarget;
    draggedItem = draggableItems.find(item => item.element === itemElement);
    
    if (!draggedItem) return;
    
    // Remove frame when picking up
    // if (draggedItem.frame) {
    //     draggedItem.frame.remove();
    //     draggedItem.frame = null;
    // }
    
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
    
    // Move frame with the item, maintaining the offset
    // if (draggedItem.frame) {
    //     draggedItem.frame.style.left = (x + draggedItem.frameOffsetX) + 'px';
    //     draggedItem.frame.style.top = (y + draggedItem.frameOffsetY) + 'px';
    // }
    
    // Move label with the item
    if (draggedItem.label) {
        const itemRect = draggedItem.element.getBoundingClientRect();
        const labelX = x + itemRect.width / 2 - draggedItem.label.offsetWidth / 2;
        const labelY = y + itemRect.height + 30;
        
        draggedItem.label.style.left = labelX + 'px';
        draggedItem.label.style.top = labelY + 'px';
    }
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
        
        // Create and add frame
        // createFrame(draggedItem);
        
        // Show name input modal
        showNameModal(droppedOnZone);
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

function showNameModal(zone) {
    pendingZoneForName = zone;
    const modal = document.getElementById('nameModal');
    const nameInput = document.getElementById('nameInput');
    
    nameInput.value = '';
    modal.classList.remove('hidden');
    nameInput.focus();
}

function hideNameModal() {
    const modal = document.getElementById('nameModal');
    modal.classList.add('hidden');
    pendingZoneForName = null;
}

function submitName() {
    if (!pendingZoneForName) return;
    
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        // Store name on the item
        if (pendingZoneForName.item) {
            const itemData = pendingZoneForName.item;
            itemData.itemName = name;
            
            // Format the label with unchangeable metadata
            const metadata = itemData.metadata;
            const labelText = `"<em>${name}</em>"<br>${metadata.dimensions}<br>${metadata.medium}<br>${metadata.year}`;
            
            itemData.label.innerHTML = labelText;
            itemData.label.style.display = 'block';
        }
    }
    
    hideNameModal();
}

// Event listeners for modal
document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = document.getElementById('submitBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const nameInput = document.getElementById('nameInput');
    
    submitBtn.addEventListener('click', submitName);
    cancelBtn.addEventListener('click', hideNameModal);
    
    // Allow Enter key to submit
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitName();
        }
    });
});

// FRAME FUNCTIONALITY COMMENTED OUT
// function createFrame(itemData) {
//     // Remove old frame if it exists
//     if (itemData.frame) {
//         itemData.frame.remove();
//         itemData.frame = null;
//     }
//     
//     const framePath = itemData.metadata.frame;
//     if (!framePath) return;
//     
//     const frame = document.createElement('img');
//     frame.className = 'frame-image';
//     frame.src = framePath;
//     frame.alt = 'Frame';
//     
//     // Set custom frame dimensions
//     const frameWidth = itemData.metadata.frameWidth || '16vw';
//     const frameHeight = itemData.metadata.frameHeight || '26vh';
//     frame.style.width = frameWidth;
//     frame.style.height = frameHeight;
//     
//     const itemsContainer = document.getElementById('itemsContainer');
//     itemsContainer.appendChild(frame);
//     
//     // Position frame centered with the item
//     // We need to calculate positions so both are centered at the same point
//     const itemRect = itemData.element.getBoundingClientRect();
//     const itemX = parseInt(itemData.element.style.left);
//     const itemY = parseInt(itemData.element.style.top);
//     const itemWidth = itemRect.width;
//     const itemHeight = itemRect.height;
//     
//     // Parse frame dimensions from strings like "22vw" or "32vh"
//     const frameWidthStr = frameWidth;
//     const frameHeightStr = frameHeight;
//     
//     // Convert viewport units to pixels
//     const vw = window.innerWidth / 100;
//     const vh = window.innerHeight / 100;
//     
//     let frameWidthPx = itemWidth;
//     let frameHeightPx = itemHeight;
//     
//     if (frameWidthStr.includes('vw')) {
//         frameWidthPx = parseFloat(frameWidthStr) * vw;
//     } else if (frameWidthStr.includes('px')) {
//         frameWidthPx = parseFloat(frameWidthStr);
//     }
//     
//     if (frameHeightStr.includes('vh')) {
//         frameHeightPx = parseFloat(frameHeightStr) * vh;
//     } else if (frameHeightStr.includes('px')) {
//         frameHeightPx = parseFloat(frameHeightStr);
//     }
//     
//     // Calculate offset to center frame around item
//     const offsetX = (itemWidth - frameWidthPx) / 2;
//     const offsetY = (itemHeight - frameHeightPx) / 2;
//     
//     // Store offset for later use during dragging
//     itemData.frameOffsetX = offsetX;
//     itemData.frameOffsetY = offsetY;
//     
//     frame.style.left = (itemX + offsetX) + 'px';
//     frame.style.top = (itemY + offsetY) + 'px';
//     
//     // Add to items array to track
//     itemData.frame = frame;
//     
//     // Trigger fade-in animation
//     frame.classList.add('fade-in');
// }
// 
// function positionFrame(itemData) {
//     if (!itemData.frame) return;
//     
//     // Keep frame positioned behind item
//     itemData.frame.style.left = itemData.element.style.left;
//     itemData.frame.style.top = itemData.element.style.top;
// }

// Tape functionality
function initializeTape() {
    const tapeTemplate = document.getElementById('tapeTemplate');
    if (!tapeTemplate) return;
    
    tapeTemplate.addEventListener('mousedown', handleTapeMouseDown);
}

function handleTapeMouseDown(e) {
    // Create a new tape piece that will be dragged
    const tapeTemplate = e.currentTarget;
    const newTape = document.createElement('img');
    newTape.className = 'tape-piece';
    newTape.src = 'Images/Tape_Dots.png';
    newTape.alt = 'Tape';
    
    // Position at the toolbar
    const rect = tapeTemplate.getBoundingClientRect();
    newTape.style.left = rect.left + 'px';
    newTape.style.top = rect.top + 'px';
    newTape.style.position = 'fixed';
    newTape.style.zIndex = '1000';
    newTape.style.pointerEvents = 'auto';
    
    document.getElementById('itemsContainer').appendChild(newTape);
    
    draggedTape = {
        element: newTape,
        startX: rect.left,
        startY: rect.top
    };
    
    // Calculate offset for smooth dragging
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', handleTapeMouseMove);
    document.addEventListener('mouseup', handleTapeMouseUp);
    
    e.preventDefault();
}

function handleTapeMouseMove(e) {
    if (!draggedTape) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    draggedTape.element.style.left = x + 'px';
    draggedTape.element.style.top = y + 'px';
}

function handleTapeMouseUp(e) {
    if (!draggedTape) return;
    
    document.removeEventListener('mousemove', handleTapeMouseMove);
    document.removeEventListener('mouseup', handleTapeMouseUp);
    
    // Keep the tape piece on the canvas
    draggedTape.element.style.zIndex = '100';
    
    // Store it in the array so it persists
    tapePieces.push(draggedTape);
    
    draggedTape = null;
}

// Initialize the game when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeGame();
        initializeTape();
    });
} else {
    initializeGame();
    initializeTape();
}