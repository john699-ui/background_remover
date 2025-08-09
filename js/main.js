// main.js
import { loadImage } from './imageLoader.js';
import { autoRemoveBackground } from './autoRemove.js';

const canvasBG = document.getElementById("canvasBG");
const canvasAuto = document.getElementById("canvasAuto");
const ctxAuto = canvasAuto.getContext("2d");

let loadedImage = null;
let imageScale = 1;

document.getElementById("imageInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { img, scale } = await loadImage(file, canvasBG);
    loadedImage = img;
    imageScale = scale;

    canvasAuto.width = canvasBG.width;
    canvasAuto.height = canvasBG.height;
    ctxAuto.clearRect(0, 0, canvasAuto.width, canvasAuto.height);
});

document.getElementById("btnRemove").addEventListener("click", async () => {
    if (!loadedImage) return alert("Please upload an image first!");
    const resultCanvas = await autoRemoveBackground(loadedImage);

    ctxAuto.clearRect(0, 0, canvasAuto.width, canvasAuto.height);
    ctxAuto.drawImage(resultCanvas, 0, 0, canvasAuto.width, canvasAuto.height);
});

document.getElementById("btnDownload").addEventListener("click", () => {
    if (!canvasAuto.width) return alert("No result to download!");
    const link = document.createElement("a");
    link.download = "background_removed.png";
    link.href = canvasAuto.toDataURL("image/png");
    link.click();
});
