let dropZones = [];
let draggableItems = [];
let draggedItem = null;
let draggedTape = null;
let draggedSquareFrame = null;
let offsetX = 0;
let offsetY = 0;
let pendingZoneForName = null; // Track which zone needs a name
let tapePieces = []; // Track all placed tape pieces
let squareFrames = []; // Track all placed square frames
let rotateMode = false; // Track if rotate mode is active
let paintMode = false; // Track if paint mode is active

const PAINT_COLORS = [
    'rgba(255, 182, 193, 0.6)',  // Light pink
    'rgba(173, 216, 230, 0.6)',  // Light blue
    'rgba(144, 238, 144, 0.6)',  // Light green
    'rgba(255, 218, 185, 0.6)',  // Peach
    'rgba(221, 160, 221, 0.6)',  // Plum
    'rgba(255, 255, 224, 0.6)',  // Light yellow
    'rgba(255, 192, 203, 0.6)',  // Pink
    'rgba(176, 224, 230, 0.6)',  // Powder blue
];

const NUM_ZONES = 15;
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
        
        // Add click listener for paint mode
        zone.addEventListener('click', handleZoneClick);
        
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
    
    // Remove pin when picking up
    if (draggedItem.pin) {
        draggedItem.pin.remove();
        draggedItem.pin = null;
    }
    
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
        
        // Create and add pin
        createPin(draggedItem);
        
        // Create and add frame
        // createFrame(draggedItem);
        
        // Show name input modal only if not already named
        if (!draggedItem.hasBeenNamed) {
            showNameModal(droppedOnZone);
        }
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
            itemData.hasBeenNamed = true;
            
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

function createPin(itemData) {
    // Remove old pin if it exists
    if (itemData.pin) {
        itemData.pin.remove();
        itemData.pin = null;
    }
    
    const pin = document.createElement('img');
    pin.className = 'pin-image';
    pin.src = 'Images/Pin1.png';
    pin.alt = 'Pin';
    
    // Set pin dimensions
    pin.style.width = '2vw';
    pin.style.height = '2vw';
    
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.appendChild(pin);
    
    // Position pin at the top center of the item
    const itemRect = itemData.element.getBoundingClientRect();
    const itemX = parseInt(itemData.element.style.left);
    const itemY = parseInt(itemData.element.style.top);
    const itemWidth = itemRect.width;
    
    // Center pin horizontally on item, position at top
    const pinX = itemX + (itemWidth / 2) - (itemWidth * 0.03 / 2); // 3vw pin centered
    const pinY = itemY - (itemWidth * 0.03); // Pin above the item
    
    pin.style.left = pinX + 'px';
    pin.style.top = pinY + 'px';
    
    // Add to item data to track
    itemData.pin = pin;
}

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

function initializeTape2() {
    const tape2Template = document.getElementById('tape2Template');
    if (!tape2Template) return;
    
    tape2Template.addEventListener('mousedown', handleTape2MouseDown);
}

function initializeSquareFrame() {
    const squareFrameTemplate = document.getElementById('squareFrameTemplate');
    if (!squareFrameTemplate) return;
    
    squareFrameTemplate.addEventListener('mousedown', handleSquareFrameMouseDown);
}

function initializeRotateButton() {
    const rotateBtn = document.getElementById('rotateBtn');
    if (!rotateBtn) return;
    
    rotateBtn.addEventListener('click', () => {
        rotateMode = !rotateMode;
        rotateBtn.classList.toggle('active', rotateMode);
        
        // Disable paint mode if rotate is enabled
        if (rotateMode && paintMode) {
            paintMode = false;
            const paintBtn = document.getElementById('paintBucketBtn');
            if (paintBtn) paintBtn.classList.remove('active');
        }
        
        // Update cursor for all placed tape pieces
        tapePieces.forEach(tape => {
            tape.element.style.cursor = rotateMode ? 'pointer' : 'grab';
        });
    });
}

function initializePaintBucketButton() {
    const paintBtn = document.getElementById('paintBucketBtn');
    if (!paintBtn) return;
    
    paintBtn.addEventListener('click', () => {
        paintMode = !paintMode;
        paintBtn.classList.toggle('active', paintMode);
        
        // Disable rotate mode if paint is enabled
        if (paintMode && rotateMode) {
            rotateMode = false;
            const rotateBtn = document.getElementById('rotateBtn');
            if (rotateBtn) rotateBtn.classList.remove('active');
        }
        
        // Update cursor for zones
        dropZones.forEach(zone => {
            zone.element.style.cursor = paintMode ? 'crosshair' : 'pointer';
        });
    });
}

function initializeFinishButton() {
    const finishBtn = document.getElementById('finishBtn');
    if (!finishBtn) return;
    
    finishBtn.addEventListener('click', downloadMoodboard);
    
    // Setup modal buttons
    const downloadBtn = document.getElementById('downloadBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    if (downloadBtn) downloadBtn.addEventListener('click', actuallyDownloadMoodboard);
    if (restartBtn) restartBtn.addEventListener('click', restartMoodboard);
}

function downloadMoodboard() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    // Create a temporary wrapper to capture the content
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '-9999px';
    wrapper.style.backgroundColor = 'rgba(225, 153, 80, 0.75)';
    
    // Clone the container and toolbar (minus the toolbar itself)
    const clonedContent = document.querySelector('.container').cloneNode(true);
    wrapper.appendChild(clonedContent);
    document.body.appendChild(wrapper);
    
    html2canvas(wrapper, {
        backgroundColor: 'rgba(255, 255, 255, 0.86)',
        scale: 2,
        allowTaint: true,
        useCORS: true
    }).then(canvas => {
        // Store canvas for later download
        window.moodboardCanvas = canvas;
        
        // Show preview in modal
        const previewContainer = document.getElementById('previewContainer');
        previewContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        previewContainer.appendChild(img);
        
        // Show the modal
        const modal = document.getElementById('finishModal');
        modal.classList.remove('hidden');
        
        // Remove the temporary wrapper
        document.body.removeChild(wrapper);
    }).catch(error => {
        console.error('Error capturing screenshot:', error);
        document.body.removeChild(wrapper);
    });
}

function actuallyDownloadMoodboard() {
    if (!window.moodboardCanvas) return;
    
    const link = document.createElement('a');
    link.href = window.moodboardCanvas.toDataURL('image/png');
    link.download = `moodboard-${new Date().getTime()}.png`;
    link.click();
    
    // Close modal and reset
    const modal = document.getElementById('finishModal');
    modal.classList.add('hidden');
    window.moodboardCanvas = null;
}

function restartMoodboard() {
    // Close modal
    const modal = document.getElementById('finishModal');
    modal.classList.add('hidden');
    window.moodboardCanvas = null;
    
    // Reset everything
    location.reload();
}

function handleZoneClick(e) {
    if (!paintMode) return;
    
    const zone = e.currentTarget;
    const randomColor = PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
    zone.style.backgroundColor = randomColor;
}

function handleTapePieceClick(e) {
    if (!rotateMode) return;
    
    const tapeElement = e.currentTarget;
    const tapePiece = tapePieces.find(t => t.element === tapeElement);
    
    if (tapePiece) {
        // Get current rotation or initialize to 0
        if (!tapePiece.rotation) {
            tapePiece.rotation = 0;
        }
        
        // Rotate by 45 degrees
        tapePiece.rotation = (tapePiece.rotation + 45) % 360;
        tapePiece.element.style.transform = `rotate(${tapePiece.rotation}deg)`;
    }
    
    e.stopPropagation();
}

function handleTapeMouseDown(e) {
    // If in rotate mode, don't create new tape
    if (rotateMode) return;
    
    // Create a new tape piece that will be dragged
    const tapeTemplate = e.currentTarget;
    const newTape = document.createElement('img');
    newTape.className = 'tape-piece';
    newTape.src = 'Images/Tape_Dots.png';
    newTape.alt = 'Tape';
    
    createAndDragTape(newTape, e);
}

function handleTape2MouseDown(e) {
    // If in rotate mode, don't create new tape
    if (rotateMode) return;
    
    // Create a new tape piece that will be dragged
    const tape2Template = e.currentTarget;
    const newTape = document.createElement('img');
    newTape.className = 'tape-piece';
    newTape.src = 'Images/Tape_2.png';
    newTape.alt = 'Tape 2';
    
    createAndDragTape(newTape, e);
}

function createAndDragTape(newTape, e) {
    const template = e.currentTarget;
    
    // Position at the toolbar
    const rect = template.getBoundingClientRect();
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
    
    // Add click listener for rotation
    draggedTape.element.addEventListener('click', handleTapePieceClick);
    draggedTape.rotation = 0; // Initialize rotation
    
    // Store it in the array so it persists
    tapePieces.push(draggedTape);
    
    draggedTape = null;
}

function handleSquareFrameMouseDown(e) {
    // If in rotate mode, don't create new frame
    if (rotateMode) return;
    
    // Create a new square frame that will be dragged
    const frameTemplate = e.currentTarget;
    const newFrame = document.createElement('img');
    newFrame.className = 'square-frame-piece';
    newFrame.src = 'Images/square_frame2.png';
    newFrame.alt = 'Square Frame';
    
    // Position at the toolbar
    const rect = frameTemplate.getBoundingClientRect();
    newFrame.style.left = rect.left + 'px';
    newFrame.style.top = rect.top + 'px';
    newFrame.style.position = 'fixed';
    newFrame.style.zIndex = '1000';
    newFrame.style.pointerEvents = 'auto';
    
    document.getElementById('itemsContainer').appendChild(newFrame);
    
    draggedSquareFrame = {
        element: newFrame,
        startX: rect.left,
        startY: rect.top
    };
    
    // Calculate offset for smooth dragging
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', handleSquareFrameMouseMove);
    document.addEventListener('mouseup', handleSquareFrameMouseUp);
    
    e.preventDefault();
}

function handleSquareFrameMouseMove(e) {
    if (!draggedSquareFrame) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    draggedSquareFrame.element.style.left = x + 'px';
    draggedSquareFrame.element.style.top = y + 'px';
}

function handleSquareFrameMouseUp(e) {
    if (!draggedSquareFrame) return;
    
    document.removeEventListener('mousemove', handleSquareFrameMouseMove);
    document.removeEventListener('mouseup', handleSquareFrameMouseUp);
    
    // Keep the square frame on the canvas
    draggedSquareFrame.element.style.zIndex = '100';
    
    // Add click listener for rotation
    draggedSquareFrame.element.addEventListener('click', handleSquareFramePieceClick);
    draggedSquareFrame.rotation = 0; // Initialize rotation
    
    // Store it in the array so it persists
    squareFrames.push(draggedSquareFrame);
    
    draggedSquareFrame = null;
}

function handleSquareFramePieceClick(e) {
    if (!rotateMode) return;
    
    const frameElement = e.currentTarget;
    const framePiece = squareFrames.find(f => f.element === frameElement);
    
    if (framePiece) {
        // Get current rotation or initialize to 0
        if (!framePiece.rotation) {
            framePiece.rotation = 0;
        }
        
        // Rotate by 45 degrees
        framePiece.rotation = (framePiece.rotation + 45) % 360;
        framePiece.element.style.transform = `rotate(${framePiece.rotation}deg)`;
    }
    
    e.stopPropagation();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeStartButton();
        initializeGame();
        initializeTape();
        initializeTape2();
        initializeSquareFrame();
        initializeRotateButton();
        initializePaintBucketButton();
        initializeFinishButton();
    });
} else {
    initializeStartButton();
    initializeGame();
    initializeTape();
    initializeTape2();
    initializeSquareFrame();
    initializeRotateButton();
    initializePaintBucketButton();
    initializeFinishButton();
}

function initializeStartButton() {
    const startBtn = document.getElementById('startBtn');
    if (!startBtn) return;
    
    startBtn.addEventListener('click', () => {
        // Hide landing screen
        const landingScreen = document.getElementById('landingScreen');
        if (landingScreen) landingScreen.style.display = 'none';
        
        // Show main content
        const mainContainer = document.getElementById('mainContainer');
        const mainToolbar = document.getElementById('mainToolbar');
        if (mainContainer) mainContainer.style.display = 'flex';
        if (mainToolbar) mainToolbar.style.display = 'flex';
    });
}