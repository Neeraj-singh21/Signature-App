const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let penSize = document.getElementById('penSize').value;
let penColor = document.getElementById('penColor').value;
let bgColor = document.getElementById('bgColor').value;
let undoStack = [];
let redoStack = [];

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault();
    draw(event.touches[0]);
});

document.getElementById('clearBtn').addEventListener('click', () => {
    clearCanvas();
    saveState();
});

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

document.getElementById('penSize').addEventListener('input', (event) => {
    penSize = event.target.value;
});

document.getElementById('penColor').addEventListener('input', (event) => {
    penColor = event.target.value;
});

document.getElementById('bgColor').addEventListener('input', (event) => {
    bgColor = event.target.value;
    clearCanvas();
    saveState();
});

document.getElementById('savePngBtn').addEventListener('click', () => saveImage('png'));
document.getElementById('saveJpgBtn').addEventListener('click', () => saveImage('jpeg'));
document.getElementById('savePdfBtn').addEventListener('click', savePDF);

function startDrawing(event) {
    drawing = true;
    redoStack = [];
    saveState();
    ctx.beginPath();
    ctx.moveTo(getX(event), getY(event));
}

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = penColor;

    ctx.lineTo(getX(event), getY(event));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(getX(event), getY(event));
}

function stopDrawing() {
    if (drawing) {
        saveState();
        drawing = false;
    }
    ctx.beginPath();
}

function getX(event) {
    return event.clientX - canvas.offsetLeft;
}

function getY(event) {
    return event.clientY - canvas.offsetTop;
}

function saveState() {
    undoStack.push(canvas.toDataURL());
    if (undoStack.length > 10) {
        undoStack.shift(); // Limit the stack to 10 states
    }
}

function undo() {
    if (undoStack.length > 1) {
        redoStack.push(undoStack.pop());
        restoreState(undoStack[undoStack.length - 1]);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const dataURL = redoStack.pop();
        undoStack.push(dataURL);
        restoreState(dataURL);
    }
}

function restoreState(dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

function clearCanvas() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function saveImage(format) {
    const dataURL = canvas.toDataURL(`image/${format}`);
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `signature.${format}`;
    link.click();
}

function savePDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 4, canvas.height / 4); // Adjust size if necessary
    pdf.save('signature.pdf');
}

// Initialize canvas with background color
clearCanvas();
saveState();
