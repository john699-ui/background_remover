import * as ort from "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js";

let session = null;

export async function initModel() {
  if (!session) {
    session = await ort.InferenceSession.create("./u2netp.onnx");
    console.log("ONNX model loaded");
  }
  return session;
}

export async function removeBackground(img, scale, canvasAuto) {
  const ctx = canvasAuto.getContext("2d");

  // Create temporary canvas at model size (320x320)
  const tmp = document.createElement("canvas");
  tmp.width = 320;
  tmp.height = 320;
  const tctx = tmp.getContext("2d");
  tctx.drawImage(img, 0, 0, tmp.width, tmp.height);

  // Preprocess → Float32 tensor
  const imgData = tctx.getImageData(0, 0, tmp.width, tmp.height);
  const data = new Float32Array(3 * 320 * 320);
  for (let i = 0; i < 320 * 320; i++) {
    data[i] = imgData.data[i * 4] / 255;     // R
    data[i + 320 * 320] = imgData.data[i * 4 + 1] / 255; // G
    data[i + 2 * 320 * 320] = imgData.data[i * 4 + 2] / 255; // B
  }
  const tensor = new ort.Tensor("float32", data, [1, 3, 320, 320]);

  // Run inference
  const results = await session.run({ "input": tensor });
  const output = results[Object.keys(results)[0]].data;

  // Post-process → mask
  const mask = new Float32Array(320 * 320);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = output[i]; // values 0..1
  }

  // Resize mask to match displayed canvas
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = canvasAuto.width;
  maskCanvas.height = canvasAuto.height;
  const mctx = maskCanvas.getContext("2d");
  const maskData = mctx.createImageData(320, 320);
  for (let i = 0; i < mask.length; i++) {
    const val = mask[i] * 255;
    maskData.data[i * 4] = val;
    maskData.data[i * 4 + 1] = val;
    maskData.data[i * 4 + 2] = val;
    maskData.data[i * 4 + 3] = 255;
  }
  mctx.putImageData(maskData, 0, 0);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0, canvasAuto.width, canvasAuto.height);
  ctx.globalCompositeOperation = "source-over";

  console.log("Background removed");
}
