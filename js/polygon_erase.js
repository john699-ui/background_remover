// polygon_erase.js
import { getTransform } from './canvas_sync.js';
export {applyErase, cancelPolygon, undoLastPoint };
let points = [];
let isDrawing = false;
let ctxManual = null;
let canvasManual = null;
let eraseCallback = null;

function onKeyDown(e) {
  if (e.key === 'Enter' && points.length >= 3) {
    applyErase();
  } else if (e.key === 'Escape') {
    cancelPolygon();
  }
}
export function initPolygonErase(canvas, onEraseDone) {
  canvasManual = canvas;
  ctxManual = canvas.getContext('2d');
  eraseCallback = onEraseDone;

  canvas.addEventListener('pointerdown', onPointerDown);
  window.removeEventListener('keydown', onKeyDown); // added
  window.addEventListener('keydown', onKeyDown);
}
/*
function onPointerDown(e) {
  if (!canvasManual) return;

  const rect = canvasManual.getBoundingClientRect();
  const x = (e.clientX - rect.left - window.originX) / window.scale;
  const y = (e.clientY - rect.top - window.originY) / window.scale;
  console.log("Point added:", x, y);
  points.push([x, y]);
  drawPolygon();
  console.log("Point added:", x, y);
}
*//*
function onPointerDown(e) {
  if (!canvasManual) return;

  const rect = canvasManual.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  points.push([x, y]);
  drawPolygon();
} */
/*
function onPointerDown(e) {
  if (!canvasManual) return;

  const rect = canvasManual.getBoundingClientRect();
  const { originX, originY, scale } = getTransform();

  const x = (e.clientX - rect.left - originX) / scale;
  const y = (e.clientY - rect.top - originY) / scale;

  points.push([x, y]);
  console.log("Point added:", x, y);
  drawPolygon();
}
*/
function onPointerDown(e) {
  if (!canvasPolygon) return;

  const rect = canvasPolygon.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  points.push([x, y]);
  console.log("Point added:", x, y);
  drawPolygon();
}
function drawPolygon() {
  if (points.length === 0) return;

  // Create overlay just for previewing the polygon
  const overlayCanvas = document.getElementById('canvasPolygon');
  const overlayCtx = overlayCanvas.getContext('2d');
  overlayCanvas.width = canvasManual.width;
  overlayCanvas.height = canvasManual.height;

  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

  overlayCtx.beginPath();
  overlayCtx.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    overlayCtx.lineTo(points[i][0], points[i][1]);
  }

  overlayCtx.strokeStyle = 'red';
  overlayCtx.lineWidth = 2;
  overlayCtx.stroke();
  console.log("Drawing polygon with points:", points);
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

  ctxManual.globalCompositeOperation = 'destination-out';
  ctxManual.fill();
  ctxManual.globalCompositeOperation = 'source-over';
  ctxManual.restore();

  if (eraseCallback) eraseCallback();
  cancelPolygon();
}

function cancelPolygon() {
  points = [];

  const overlayCanvas = document.getElementById('canvasPolygon');
  if (overlayCanvas) {
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}

function undoLastPoint() {
  if (points.length > 0) {
    points.pop();
    drawPolygon();
  }
}
//hhhhhhhhhhhhhhhhhhhhh
let polygonListeners = [];

export function initPolygonErase(canvas, onEraseDone) {
  ctxManual = canvas.getContext('2d');

  const onPointerDown = e => {
    const rect = canvas.getBoundingClientRect();
    const { originX, originY, scale } = getTransform();
    const x = (e.clientX - rect.left - originX) / scale;
    const y = (e.clientY - rect.top - originY) / scale;

    points.push([x, y]);
    drawPolygon();
  };

  const onKeyDown = e => {
    if (e.key === 'Enter' && points.length >= 3) {
      applyErase(canvas);
      onEraseDone();
    } else if (e.key === 'Escape') {
      cancelPolygon();
    }
  };

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  polygonListeners = [
    ['pointerdown', onPointerDown],
    ['keydown', onKeyDown],
  ];
}

export function disablePolygonErase(canvas) {
  polygonListeners.forEach(([type, fn]) => {
    if (type === 'keydown') {
      window.removeEventListener(type, fn);
    } else {
      canvas.removeEventListener(type, fn);
    }
  });
  polygonListeners = [];
}
