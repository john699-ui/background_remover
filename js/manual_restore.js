// manual_restore.js

let isRestoring = false;
let brushSize = 15;
let ctxManual = null;
let canvasManual = null;
let baseImage = null;

export function initRestoreBrush(canvas, image, sizeSelector) {
  canvasManual = canvas;
  ctxManual = canvas.getContext('2d');
  baseImage = image;

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', () => (isRestoring = false));
  canvas.addEventListener('pointerleave', () => (isRestoring = false));

  sizeSelector.addEventListener('change', e => {
    brushSize = parseInt(e.target.value);
  });
}

function onPointerDown(e) {
  isRestoring = true;
  drawBrushStroke(e);
}

function onPointerMove(e) {
  if (!isRestoring) return;
  drawBrushStroke(e);
}

function drawBrushStroke(e) {
  const rect = canvasManual.getBoundingClientRect();
  const x = (e.clientX - rect.left - window.originX) / window.scale;
  const y = (e.clientY - rect.top - window.originY) / window.scale;

  ctxManual.save();
  ctxManual.beginPath();
  ctxManual.arc(x, y, brushSize, 0, 2 * Math.PI);
  ctxManual.clip();
  ctxManual.drawImage(baseImage, 0, 0);
  ctxManual.restore();

  // Optional: Show brush circle for feedback
  ctxManual.beginPath();
  ctxManual.arc(x, y, brushSize, 0, 2 * Math.PI);
  ctxManual.strokeStyle = 'rgba(0,0,255,0.3)';
  ctxManual.stroke();
}
