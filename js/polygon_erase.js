// polygon_erase.js
import { getTransform } from './canvas_sync.js';
export {applyErase, cancelPolygon, undoLastPoint };
let points = [];
let isDrawing = false;
let ctxManual = null;
let canvasManual = null;
let eraseCallback = null;
let ctxPolygon = null;
let canvasPolygon = null;




function onKeyDown(e) {
  if (e.key === 'Enter' && points.length >= 3) {
    applyErase();
  } else if (e.key === 'Escape') {
    cancelPolygon();
  }
}
/*
export function initPolygonErase(canvas, onEraseDone) {
  canvasManual = canvas;
  ctxManual = canvas.getContext('2d');
  eraseCallback = onEraseDone;

  canvas.addEventListener('pointerdown', onPointerDown);
  window.removeEventListener('keydown', onKeyDown); // added
  window.addEventListener('keydown', onKeyDown);
}
*//*
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

export function initPolygonErase(polygonCanvas, manualCanvas, onEraseDone) {
  canvasPolygon = polygonCanvas;
  ctxPolygon = canvasPolygon.getContext('2d');

  canvasManual = manualCanvas;
  ctxManual = canvasManual.getContext('2d');

  eraseCallback = onEraseDone;

  canvasPolygon.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);
}
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
  const rect = canvasPolygon.getBoundingClientRect();
  const { originX, originY, scale } = getTransform();

  const x = (e.clientX - rect.left - originX) / scale;
  const y = (e.clientY - rect.top - originY) / scale;

  points.push([x, y]);
  console.log("Point added:", x, y);
  drawPolygon();
}
/*
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
*/
function drawPolygon() {
  ctxPolygon.clearRect(0, 0, canvasPolygon.width, canvasPolygon.height);

  if (points.length === 0) return;

  ctxPolygon.beginPath();
  ctxPolygon.moveTo(points[0][0], points[0][1]);

  for (let i = 1; i < points.length; i++) {
    ctxPolygon.lineTo(points[i][0], points[i][1]);
  }

  ctxPolygon.strokeStyle = 'rgba(255, 0, 0, 0.6)';
  ctxPolygon.lineWidth = 2;
  ctxPolygon.stroke();
}
/*
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
*/
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
/*
function cancelPolygon() {
  points = [];

  const overlayCanvas = document.getElementById('canvasPolygon');
  if (overlayCanvas) {
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}
*/
function cancelPolygon() {
  points = [];
  if (ctxPolygon) ctxPolygon.clearRect(0, 0, canvasPolygon.width, canvasPolygon.height);
}
function undoLastPoint() {
  if (points.length > 0) {
    points.pop();
    drawPolygon();
  }
}
