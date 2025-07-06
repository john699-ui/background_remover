export function outputToMaskImage(output, width, height) {
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
