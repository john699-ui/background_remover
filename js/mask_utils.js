/*export function outputToMaskImage(output, width, height) {
  const imageData = new ImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    const value = output[i] * 255;
    imageData.data[i * 4 + 0] = 0;
    imageData.data[i * 4 + 1] = 0;
    imageData.data[i * 4 + 2] = 0;
    imageData.data[i * 4 + 3] = 255 - value;
  }
  return imageData;
}
export function outputToMaskImage(output, width, height) {
  const mask = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const val = output[i] * 255; // 0–255
    mask[i * 4] = 0;    // R
    mask[i * 4 + 1] = 0; // G
    mask[i * 4 + 2] = 0; // B
    mask[i * 4 + 3] = val; // Alpha based on ONNX output
  }
  return new ImageData(mask, width, height);
}

export function outputToMaskImage(output, width, height) {
  const mask = new Uint8ClampedArray(width * height * 4);

  // Find min and max in output for normalization
  let minVal = Infinity;
  let maxVal = -Infinity;
  for (let i = 0; i < output.length; i++) {
    if (output[i] < minVal) minVal = output[i];
    if (output[i] > maxVal) maxVal = output[i];
  }
  const range = maxVal - minVal || 1; // Avoid division by zero

  for (let i = 0; i < width * height; i++) {
    // Normalize to 0-1
    const normVal = (output[i] - minVal) / range;
    const alpha = normVal * 255; // Scale to 0-255
    mask[i * 4] = 0;
    mask[i * 4 + 1] = 0;
    mask[i * 4 + 2] = 0;
    mask[i * 4 + 3] = alpha;
  }
  return new ImageData(mask, width, height);
}

export function outputToMaskImage(output, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const val = output[i]; // 0.0 to 1.0 usually
    const alpha = val > 0.2 ? 255 : 0; // ← This threshold might be too harsh!

    data[i * 4 + 0] = 0;     // R
    data[i * 4 + 1] = 0;     // G
    data[i * 4 + 2] = 0;     // B
    data[i * 4 + 3] = alpha; // A
  }
  return new ImageData(data, width, height);
}
export function outputToMaskImage(output, width, height) {
  const imageData = new ImageData(width, height);
  for (let i = 0; i < output.length; i++) {
    const alpha = output[i] > 0.05 ? 255 : 0; // Threshold: tweakable
    const idx = i * 4;
    imageData.data[idx] = 0;     // R
    imageData.data[idx + 1] = 0; // G
    imageData.data[idx + 2] = 0; // B
    imageData.data[idx + 3] = alpha; // Alpha from mask
  }
  return imageData;
} 

export function outputToMaskImage(output, width, height) {
  const imageData = new ImageData(width, height);
  for (let i = 0; i < output.length; i++) {
    //const alpha = Math.min(255, Math.max(0, output[i] * 255)); // Smooth mask
    const alpha = Math.min(255, Math.max(0, (output[i] ** 0.5) * 255)); // Brighter midtones
    const idx = i * 4;
    imageData.data[idx] = 0;     // R
    imageData.data[idx + 1] = 0; // G
    imageData.data[idx + 2] = 0; // B
    imageData.data[idx + 3] = alpha; // Scaled alpha
  }
  return imageData;
}

export function outputToMaskImage(outputData, threshold = 0.5) {
  const size = 320 * 320;
  const maskData = new Uint8ClampedArray(size * 4);

  for (let i = 0; i < size; i++) {
    const val = outputData[i];
    const alpha = val > threshold ? 255 : 0;
    maskData[i * 4 + 0] = 0;   // R
    maskData[i * 4 + 1] = 0;   // G
    maskData[i * 4 + 2] = 0;   // B
    maskData[i * 4 + 3] = alpha; // A
  }

  return new ImageData(maskData, 320, 320);
}
*/
