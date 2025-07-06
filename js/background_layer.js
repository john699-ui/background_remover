// background_layer.js

let bgImage = null;
let canvasBG = null;
let ctxBG = null;

export function initBackgroundLayer(canvas, fileInput) {
  canvasBG = canvas;
  ctxBG = canvas.getContext('2d');

  fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      bgImage = img;
      drawBG();
    };
    img.src = URL.createObjectURL(file);
  });
}

export function drawBG(scale = 1, originX = 0, originY = 0) {
  if (!bgImage || !ctxBG || !canvasBG) return;

  canvasBG.width = canvasBG.width; // clear
  ctxBG.setTransform(scale, 0, 0, scale, originX, originY);
  ctxBG.drawImage(bgImage, 0, 0);
}

export function getBGImage() {
  return bgImage;
}
