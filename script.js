const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');

let ortSession;
const modelPath = 'u2net.onnx'; // Model must be in repo

// Load model
async function loadModel() {
  ortSession = await ort.InferenceSession.create(modelPath);
  console.log('U2Net Model Loaded');
}

// Preprocess image into tensor
function preprocessImage(image) {
  const width = 320, height = 320;
  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  const tmpCtx = tmpCanvas.getContext('2d');
  tmpCtx.drawImage(image, 0, 0, width, height);
  const imgData = tmpCtx.getImageData(0, 0, width, height).data;

  const input = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    input[i] = imgData[i * 4] / 255;      // R
    input[i + width * height] = imgData[i * 4 + 1] / 255; // G
    input[i + width * height * 2] = imgData[i * 4 + 2] / 255; // B
  }

  return new ort.Tensor('float32', input, [1, 3, height, width]);
}

// Postprocess output mask
function postprocess(outputData, originalImg) {
  const [w, h] = [originalImg.width, originalImg.height];
  const mask = outputData.data;
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = 320;
  maskCanvas.height = 320;
  const maskCtx = maskCanvas.getContext('2d');
  const imgData = maskCtx.createImageData(320, 320);

  for (let i = 0; i < mask.length; i++) {
    const val = Math.min(255, Math.max(0, mask[i] * 255));
    imgData.data[i * 4 + 0] = 255;
    imgData.data[i * 4 + 1] = 255;
    imgData.data[i * 4 + 2] = 255;
    imgData.data[i * 4 + 3] = val;
  }

  maskCtx.putImageData(imgData, 0, 0);

  // Draw original image with alpha from mask
  canvas.width = w;
  canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(originalImg, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);

  const scaledMaskCanvas = document.createElement('canvas');
  scaledMaskCanvas.width = w;
  scaledMaskCanvas.height = h;
  scaledMaskCanvas.getContext('2d').drawImage(maskCanvas, 0, 0, w, h);
  const maskData = scaledMaskCanvas.getContext('2d').getImageData(0, 0, w, h).data;

  for (let i = 0; i < w * h; i++) {
    imageData.data[i * 4 + 3] = maskData[i * 4 + 3]; // apply alpha
  }

  ctx.putImageData(imageData, 0, 0);
}

// Handle image upload
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = async () => {
    const inputTensor = preprocessImage(img);
    const output = await ortSession.run({ 'input': inputTensor });
    const mask = output[Object.keys(output)[0]];
    postprocess(mask, img);
  };
  img.src = URL.createObjectURL(file);
});

// Download result
downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'output.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Load model on startup
loadModel();