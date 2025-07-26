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
}*/
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
