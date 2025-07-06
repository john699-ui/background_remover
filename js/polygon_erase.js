// polygon_erase.js

let points = [];
let isDrawing = false;
let ctxManual = null;
let canvasManual = null;
let eraseCallback = null;

export function initPolygonErase(canvas, onEraseDone) {
  canvasManual = canvas;
  ctxManual = canvas.getContext('2d');
  eraseCallback = onEraseDone;

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);
}

function onPointerDown(e) {
  if (!canvasManual) return;

  const rect = canvasManual.getBoundingClientRect();
  const x = (e.clientX - rect.left - window.originX) / window.scale;
  const y = (e.clientY - rect.top - window.originY) / window.scale;

  points.push([x, y]);
  drawPolygon();
}

function drawPolygon() {
  if (points.length === 0) return;

  ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);
  ctxManual.beginPath();
  ctxManual.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctxManual.lineTo(points[i][0], points[i][1]);
  }

  ctxManual.strokeStyle = 'rgba(255, 0, 0, 0.6)';
  ctxManual.lineWidth = 2;
  ctxManual.stroke();
}

function onKeyDown(e) {
  if (e.key === 'Enter' && points.length >= 3) {
    applyErase();
  } else if (e.key === 'Escape') {
    cancelPolygon();
  }
}

function applyErase() {
  ctxManual.save();
  ctxManual.beginPath();
  ctxManual.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) {
    ctxManual.lineTo(points[i][0], points[i][1]);
  }
  ctxManual.closePath();
  ctxManual.clip();

  ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);
  ctxManual.restore();

  if (eraseCallback) eraseCallback();
  cancelPolygon();
}

function cancelPolygon() {
  points = [];
  ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);
}
