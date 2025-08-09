// autoRemove.js
export async function autoRemoveBackground(img) {
    const modelPath = "../u2netp.onnx"; // model is in main folder

    if (!window.u2netSession) {
        console.log("Loading U²-Net model...");
        window.u2netSession = await ort.InferenceSession.create(modelPath);
    }

    const tensor = imageToTensor(img);

    const feeds = { "input": tensor };
    const results = await window.u2netSession.run(feeds);
    const mask = results[Object.keys(results)[0]];

    const maskImageData = maskToImageData(mask, img.width, img.height);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = img.width;
    outCanvas.height = img.height;
    const ctx = outCanvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, outCanvas.width, outCanvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const alpha = maskImageData.data[i] / 255;
        imageData.data[i + 3] = imageData.data[i + 3] * alpha;
    }
    ctx.putImageData(imageData, 0, 0);

    return outCanvas;
}

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
        data[j] = imageData.data[i] / 255;
        data[j + 320 * 320] = imageData.data[i + 1] / 255;
        data[j + 2 * 320 * 320] = imageData.data[i + 2] / 255;
    }
    return new ort.Tensor("float32", data, [1, 3, 320, 320]);
}

function maskToImageData(maskTensor, width, height) {
    const maskData = maskTensor.data;
    const imageData = new ImageData(width, height);
    for (let i = 0; i < width * height; i++) {
        const val = maskData[i] * 255;
        imageData.data[i * 4] = val;
        imageData.data[i * 4 + 1] = val;
        imageData.data[i * 4 + 2] = val;
        imageData.data[i * 4 + 3] = 255;
    }
    return imageData;
}
