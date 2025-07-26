// auto_remove.js
import { outputToMaskImage } from './mask_utils.js';
//let ort = null;
let ort = window.ort;
let session = null;

export async function initONNX() {
  if (!ort) {
    ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
  }

  if (!session) {
    session = await ort.InferenceSession.create('u2netp.onnx');
    //console.log("ONNX Results:", results);
  }
}
/*
export async function runAI(canvas, image) {
  const ctx = canvas.getContext('2d');

  // STEP 1: Resize image to 320x320 for ONNX input
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = 320;
  resizedCanvas.height = 320;
  const rCtx = resizedCanvas.getContext('2d');
  rCtx.drawImage(image, 0, 0, 320, 320);

  const inputData = getImageTensor(resizedCanvas);

  // STEP 2: Run ONNX model
  await initONNX();
  console.log("✅ ONNX model initialized successfully");

  const feeds = { 'input.1': inputData };
  const results = await session.run(feeds);
  const firstKey = Object.keys(results)[0];
  const output = results[firstKey].data;

  // STEP 3: Convert 320x320 output mask to ImageData
  const smallMaskImage = outputToMaskImage(output, 320, 320);

  // STEP 4: Resize mask to match original image
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = image.width;
  maskCanvas.height = image.height;
  const maskCtx = maskCanvas.getContext('2d');

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = 320;
  tmpCanvas.height = 320;
  tmpCanvas.getContext('2d').putImageData(smallMaskImage, 0, 0);

  maskCtx.drawImage(tmpCanvas, 0, 0, image.width, image.height);
  const resizedMaskData = maskCtx.getImageData(0, 0, image.width, image.height);

  // STEP 5: Apply the alpha mask to original image
  //applyMask(canvas, image, resizedMaskData);
  applyMask(canvas, image, resizedMaskData, displayScale);
  console.log("Mask alpha sample:", resizedMaskData.data.slice(0, 20));
}
*/
export async function runAI(canvas, image) {
  try {
    const ctx = canvas.getContext('2d');

    // STEP 1: Resize image to 320x320 for ONNX input
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = 320;
    resizedCanvas.height = 320;
    const rCtx = resizedCanvas.getContext('2d');
    rCtx.drawImage(image, 0, 0, 320, 320);

    const inputData = getImageTensor(resizedCanvas);

    // STEP 2: Run ONNX model
    await initONNX();
    console.log("✅ ONNX model initialized successfully");

    const feeds = { 'input.1': inputData };
    const results = await session.run(feeds);
    const firstKey = Object.keys(results)[0];
    const output = results[firstKey].data;

    console.log("✅ Inference complete. Output length:", output.length);

    // STEP 3: Convert 320x320 output mask to ImageData
    const smallMaskImage = outputToMaskImage(output, 320, 320);
    console.log("✅ Small mask generated:", smallMaskImage);

    // STEP 4: Resize mask to match original image
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = image.width;
    maskCanvas.height = image.height;
    const maskCtx = maskCanvas.getContext('2d');

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = 320;
    tmpCanvas.height = 320;
    tmpCanvas.getContext('2d').putImageData(smallMaskImage, 0, 0);

    maskCtx.drawImage(tmpCanvas, 0, 0, image.width, image.height);
    const resizedMaskData = maskCtx.getImageData(0, 0, image.width, image.height);

    console.log("✅ Resized mask ready:", resizedMaskData);

    // STEP 5: Apply the alpha mask to original image
    applyMask(canvas, image, resizedMaskData);
    console.log("Mask alpha sample:", resizedMaskData.data.slice(0, 20));
    console.log("✅ Mask applied successfully");
  } catch (err) {
    console.error("❌ Error in runAI:", err);
  }
}
function getImageTensor(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, 320, 320);
  const { data } = imageData;

  // Normalize and convert to Float32Array [1, 3, 320, 320]
  const tensorData = new Float32Array(1 * 3 * 320 * 320);
  for (let i = 0; i < 320 * 320; i++) {
    tensorData[i] = data[i * 4] / 255;         // R
    tensorData[i + 320 * 320] = data[i * 4 + 1] / 255; // G
    tensorData[i + 2 * 320 * 320] = data[i * 4 + 2] / 255; // B
  }

  return new ort.Tensor('float32', tensorData, [1, 3, 320, 320]);
}

function preprocess(image) {
  const width = image.width;
  const height = image.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height).data;
  const input = new Float32Array(width * height * 3);

  for (let i = 0; i < width * height; i++) {
    input[i] = imgData[i * 4] / 255;
    input[i + width * height] = imgData[i * 4 + 1] / 255;
    input[i + 2 * width * height] = imgData[i * 4 + 2] / 255;
  }

  const inputTensor = new ort.Tensor('float32', input, [1, 3, height, width]);
  return [inputTensor, width, height];
}

function postprocess(output, width, height) {
  const data = output.data;
  const mask = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const val = data[i] * 255;
    mask[i * 4] = 0;
    mask[i * 4 + 1] = 0;
    mask[i * 4 + 2] = 0;
    mask[i * 4 + 3] = 255 - val;
  }
  return new ImageData(mask, width, height);
}
/*
function applyMask(canvas, image, mask) {
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(image, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

  for (let i = 0; i < mask.data.length; i += 4) {
    //imageData.data[i + 3] = mask.data[i + 3]; // apply alpha
    imageData.data[i + 3] = 255 - mask.data[i + 3]; // ✅ inverts alpha
  }

  ctx.putImageData(imageData, 0, 0);
}
*/
function applyMask(canvas, image, mask){
  const ctx = canvas.getContext('2d');

  // ✅ Do NOT change canvas width/height here (keep original resolution)
  // Keep canvas at image resolution (already set during load)

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(image, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, image.width, image.height);

  for (let i = 0; i < mask.data.length; i += 4) {
    imageData.data[i + 3] = 255 - mask.data[i + 3]; // ✅ Apply alpha correctly
  }

  ctx.putImageData(imageData, 0, 0);

  // ✅ Preserve CSS scaling for preview
  canvas.style.width = `${image.width * displayScale}px`;
  canvas.style.height = `${image.height * displayScale}px`;
}
