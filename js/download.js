// download.js

export function downloadCanvas(autoCanvas, manualCanvas, bgCanvas, format = 'png') {
  const width = autoCanvas.width;
  const height = autoCanvas.height;

  const mergedCanvas = document.createElement('canvas');
  mergedCanvas.width = width;
  mergedCanvas.height = height;
  const ctx = mergedCanvas.getContext('2d');

  // Composite in order: background → manual edits → AI mask
  if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0);
  if (manualCanvas) ctx.drawImage(manualCanvas, 0, 0);
  if (autoCanvas) ctx.drawImage(autoCanvas, 0, 0);

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataURL = mergedCanvas.toDataURL(mime);

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = `background_removed.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
