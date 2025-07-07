// main.js
import { initCanvasSync } from './canvas_sync.js';
import { runAI } from './auto_remove.js'; // correct function name and file
import { initRestoreBrush } from './manual_restore.js'; // correct function and file
import { initBackgroundLayer } from './background_layer.js';
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
    initRestoreBrush(canvasManual, originalImage);
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
  ctxManual.clearRect(0, 0, canvasManual.width, canvasManual.height);
  ctxManual.drawImage(originalImage, 0, 0);
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

  const sizeSelector = document.getElementById('brushSize');
  initRestoreBrush(canvasManual, originalImage, sizeSelector);
  canvasManual.style.display = 'block';
  canvasAuto.style.display = 'block'; // show AI canvas underneath
};
window.enablePolygonErase = () => {
  if (mode !== 'manual') window.activateManualMode();
  activateManualErase(canvasManual, ctxManual);
};

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
window.switchToManual = () => {
  mode = 'manual';
  canvasAuto.style.display = 'block';     // Show AI result as reference
  canvasManual.style.display = 'block';   // Activate manual layer
  canvasManual.style.pointerEvents = 'auto';

  // Optional: grey out canvasAuto so it's "locked"
  canvasAuto.style.opacity = 0.5;
};
