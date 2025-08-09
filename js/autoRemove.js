// autoRemove.js
export async function autoRemoveBackground(img) {
    const modelPath = "model/u2netp.onnx"; // adjust path if needed

    // Load model once
    if (!window.u2netSession) {
        console.log("Loading U²-Net model...");
        window.u2netSession = await ort.InferenceSession.create(modelPath);
    }

    // Convert image to tensor
    const tensor = imageToTensor(img);

    // Run inference
    const feeds = { "input": tensor };
    const results = await window.u2netSession.run(feeds);
    const mask = results[Object.keys(results)[0]]; // usually 'output'

    // Convert mask tensor to ImageData
    const maskImageData = maskToImageData(mask, img.width, img.height);

    // Create transparent background output
    const outCanvas = document.createElement("canvas");
    outCanvas.width = img.width;
    outCanvas.height = img.height;
    const ctx = outCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);

    // Apply alpha from mask
    for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = maskImageData.data[i] / 255; // mask grayscale
        imageData.data[i + 3] = imageData.data[i + 3] * alpha;
    }
    ctx.putImageData(imageData, 0, 0);

    return outCanvas;
}

// Convert HTMLImageElement → ONNX tensor
function imageToTensor(image) {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 320;
    tempCanvas.height = 320;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 320, 320);
    const imageData = ctx.getImageData(0, 0, 320, 320);

    const data = new Float32Array(3 * 320 * 320);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const j = i / 4;
        data[j] = imageData.data[i] / 255;          // R
        data[j + 320 * 320] = imageData.data[i+1] / 255; // G
        data[j + 2 * 320 * 320] = imageData.data[i+2] / 255; // B
    }
    return new ort.Tensor("float32", data, [1, 3, 320, 320]);
}

// Convert ONNX mask tensor → ImageData
function maskToImageData(maskTensor, width, height) {
    const maskData = maskTensor.data;
    const imageData = new ImageData(width, height);
    for (let i = 0; i < width * height; i++) {
        const val = maskData[i] * 255; // 0..1 → 0..255
        imageData.data[i * 4] = val;
        imageData.data[i * 4 + 1] = val;
        imageData.data[i * 4 + 2] = val;
        imageData.data[i * 4 + 3] = 255;
    }
    return imageData;
}
