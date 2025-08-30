// imageLoader.js
export function loadImage(file, targetCanvas) {
  return new Promise((resolve, reject) => {
    const ctx = targetCanvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      // Scale for display
      const maxW = window.innerWidth * 0.9;
      const maxH = window.innerHeight * 0.6;
      let scale = Math.min(maxW / img.width, maxH / img.height, 1);

      targetCanvas.width = img.width * scale;
      targetCanvas.height = img.height * scale;

      ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      ctx.drawImage(img, 0, 0, targetCanvas.width, targetCanvas.height);

      console.log("Image loaded:", targetCanvas.width, targetCanvas.height, "scale:", scale);

      resolve({ img, scale });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
