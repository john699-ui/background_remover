// canvas_sync.js
window.originX = 0;
window.originY = 0;
window.scale = 1;
let scale = 1;

let isDragging = false;
let lastX = 0;
let lastY = 0;
let imageRefs = {};
let syncedCanvases = [];

export function initCanvasSync(imageMap, ...canvases) {
  imageRefs = imageMap;
  syncedCanvases = canvases;

  canvases.forEach(canvas => {
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = 0.1;
      const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
      const mouseX = e.offsetX;
      const mouseY = e.offsetY;
      const newScale = window.scale * (1 + delta);
      window.originX = mouseX - ((mouseX - window.originX) * (newScale / window.scale));
      window.originY = mouseY - ((mouseY - window.originY) * (newScale / window.scale));
      window.scale = newScale;
      redrawAll();
    }, { passive: false });

    canvas.addEventListener('pointerdown', e => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    canvas.addEventListener('pointermove', e => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      window.originX += dx;
      window.originY += dy;
      lastX = e.clientX;
      lastY = e.clientY;
      redrawAll();
    });

    canvas.addEventListener('pointerup', () => {
      isDragging = false;
    });

    canvas.addEventListener('pointerleave', () => {
      isDragging = false;
    });
  });
}

export function redrawAll() {
  syncedCanvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const image = imageRefs[canvas.id];
    if (!image) return;

    canvas.width = canvas.width; // reset canvas state
    ctx.setTransform(window.scale, 0, 0, window.scale, window.originX, window.originY);
    ctx.drawImage(image, 0, 0);
  });
}
export function getTransform() {
  return {
    originX: window.originX || 0,
    originY: window.originY || 0,
    scale: window.scale || 1
  };
}
