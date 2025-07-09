// main.js
import { initCanvasSync } from './canvas_sync.js';
import { runAI } from './auto_remove.js'; // correct function name and file
import { initRestoreBrush } from './manual_restore.js'; // correct function and file
import { initBackgroundLayer } from './background_layer.js';
import { initPolygonErase, applyErase, cancelPolygon, undoLastPoint } from './polygon_erase.js';
import { disableRestoreBrush } from './manual_restore.js';
//import { initRestoreBrush} from './manual_restore.js';

let canvasAuto = document.getElementById('canvasAuto');
let canvasManual = document.getElementById('canvasManual');
let canvasBG = document.getElementById('canvasBG');
let imageLoader = document.getElementById('imageLoader');
let bgLoader = document.getElementById('bgLoader');
let brushSize = document.getElementById('brushSize');

let ctxAuto = canvasAuto.getContext('2d');
let ctxManual = canvasManual.getContext('2d');
let ctxBG = canvasBG.getContext('2d');

let originalImage = null;
let mode = 'idle';

initCanvasSync(canvasAuto, canvasManual, canvasBG);
initBackgroundLayer(canvasBG, bgLoader);

imageLoader.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    canvasAuto.width = canvasManual.width = canvasBG.width = img.width;
    canvasAuto.height = canvasManual.height = canvasBG.height = img.height;
    ctxAuto.clearRect(0, 0, img.width, img.height);
    ctxManual.clearRect(0, 0, img.width, img.height);
    ctxBG.clearRect(0, 0, img.width, img.height);

    ctxAuto.drawImage(img, 0, 0);
    ctxManual.drawImage(img, 0, 0);
    originalImage = img;
    initRestoreBrush(canvasManual, originalImage, brushSize);
  };
  img.src = URL.createObjectURL(file);
});

window.runAI = () => {
  if (!originalImage) return;
  mode = 'auto';
  runAI(canvasAuto, originalImage); // ✅ correct usage
  canvasAuto.style.display = 'block';
  canvasManual.style.display = 'none';
};

window.activateManualMode = () => {
  if (!originalImage) return;
  mode = 'manual';
  canvasAuto.style.display = 'none';
  canvasManual.style.display = 'block';
  //ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);
  //ctxManual.drawImage(originalImage, 0, 0);
};
/*
window.enableRestore = () => {
  if (mode !== 'manual') window.activateManualMode();
    const sizeSelector = document.getElementById('brushSize');
    initRestoreBrush(canvasManual, originalImage, sizeSelector);
};
*/
window.enableRestore = () => {
  if (mode !== 'manual') window.activateManualMode();
  
  ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);

  //const sizeSelector = document.getElementById('brushSize');
  //initRestoreBrush(canvasManual, originalImage, sizeSelector);
  const sizeSelector = document.getElementById('brushSize');
  if (sizeSelector) {
      initRestoreBrush(canvasManual, originalImage, sizeSelector);
  } else {
      console.error("❌ brushSize select element not found!");
  }
  canvasManual.style.display = 'block';
  canvasAuto.style.display = 'block'; // show AI canvas underneath
};
window.enablePolygonErase = () => {
  if (mode !== 'manual') window.activateManualMode();
  activateManualErase(canvasManual, ctxManual);
};
window.startPolygonErase = () => {
  if (mode !== 'manual') window.activateManualMode();
  // Disable restore brush listeners
  // 🧼 Remove restore brush listeners
  disableRestoreBrush(canvasManual);

  const canvasPolygon = document.getElementById('canvasPolygon');
  initPolygonErase(canvasPolygon, canvasManual, () => {
    console.log("✅ Polygon erase applied");
  });
  });
};
window.confirmErase = () => {
  applyErase();
};
window.undoPolygon = () => {
  undoLastPoint();
};
/*
window.downloadResult = () => {
  const format = document.getElementById('downloadFormat').value;
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvasManual.width;
  exportCanvas.height = canvasManual.height;
  const ctx = exportCanvas.getContext('2d');

  ctx.drawImage(canvasBG, 0, 0);
  ctx.drawImage(canvasManual.style.display === 'block' ? canvasManual : canvasAuto, 0, 0);

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const link = document.createElement('a');
  link.download = `output.${format}`;
  link.href = exportCanvas.toDataURL(mime);
  link.click();
};
*/
/*
window.downloadResult = () => {
  const format = document.getElementById('downloadFormat').value;

  // Create temporary canvas
  const finalCanvas = document.createElement('canvas');
  const width = canvasAuto.width;
  const height = canvasAuto.height;
  finalCanvas.width = width;
  finalCanvas.height = height;

  const finalCtx = finalCanvas.getContext('2d');

  // ✅ Draw background if it's visible
  if (canvasBG && canvasBG.style.display !== 'none') {
    finalCtx.drawImage(canvasBG, 0, 0, width, height);
  }

  // ✅ Draw AI-removed result
  finalCtx.drawImage(canvasAuto, 0, 0, width, height);

  // ✅ Draw manual restore strokes
  finalCtx.drawImage(canvasManual, 0, 0, width, height);

  // Create download link
  const link = document.createElement('a');
  link.download = `background_removed.${format}`;
  link.href = finalCanvas.toDataURL(`image/${format}`);
  link.click();
};
*/
window.quickDownload = () => {
  const format = document.getElementById('downloadFormat').value;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasManual.width;
  tempCanvas.height = canvasManual.height;
  const tempCtx = tempCanvas.getContext('2d');

  // Optional: clear to transparent background
  tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

  // 1. Draw background if visible
  if (canvasBG && canvasBG.style.display !== 'none') {
    tempCtx.drawImage(canvasBG, 0, 0);
  }

  // 2. Draw AI layer if visible
  if (canvasAuto && canvasAuto.style.display !== 'none') {
    tempCtx.drawImage(canvasAuto, 0, 0);
  }

  // 3. Draw manual edits if visible
  if (canvasManual && canvasManual.style.display !== 'none') {
    tempCtx.drawImage(canvasManual, 0, 0);
  }

  const link = document.createElement('a');
  link.download = `visible_result.${format}`;
  link.href = tempCanvas.toDataURL(`image/${format}`);
  link.click();
};

window.downloadAIResult = () => {
  const format = document.getElementById('downloadFormat').value;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasAuto.width;
  tempCanvas.height = canvasAuto.height;
  const tempCtx = tempCanvas.getContext('2d');

  // Draw AI layer
  tempCtx.drawImage(canvasAuto, 0, 0);

  // Draw background layer if visible
  if (canvasBG && canvasBG.style.display !== 'none') {
    tempCtx.globalCompositeOperation = 'destination-over';
    tempCtx.drawImage(canvasBG, 0, 0);
  }

  const link = document.createElement('a');
  link.download = `ai_result.${format}`;
  link.href = tempCanvas.toDataURL(`image/${format}`);
  link.click();
};
window.switchToManual = () => {
  mode = 'manual';
  canvasAuto.style.display = 'block';     // Show AI result as reference
  canvasManual.style.display = 'block';   // Activate manual layer
  canvasManual.style.pointerEvents = 'auto';

  // Optional: grey out canvasAuto so it's "locked"
  canvasAuto.style.opacity = 0.5;
};
