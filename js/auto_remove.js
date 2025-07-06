// auto_remove.js

let ort = null;
let session = null;

export async function initONNX() {
  if (!ort) {
    ort = await import('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');
  }

  if (!session) {
    session = await ort.InferenceSession.create('u2netp.onnx');
  }
}

export async function runAI(canvasAuto, image) {
  if (!ort || !session) await initONNX();

  const [inputTensor, width, height] = preprocess(image);

  const feeds = {};
  feeds[session.inputNames[0]] = inputTensor;

  const results = await session.run(feeds);
  const output = results[session.outputNames[0]];

  const mask = postprocess(output, width, height);
  applyMask(canvasAuto, image, mask);
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
    imageData.data[i + 3] = mask.data[i + 3]; // apply alpha
  }

  ctx.putImageData(imageData, 0, 0);
}
