// imageLoader.js
export function loadImage(file, bgCanvas) {
    return new Promise((resolve, reject) => {
        const ctx = bgCanvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            // Scale for display only
            const maxDisplayWidth = window.innerWidth * 0.9;
            const maxDisplayHeight = window.innerHeight * 0.6;
            let scale = Math.min(maxDisplayWidth / img.width, maxDisplayHeight / img.height, 1);

            bgCanvas.width = img.width * scale;
            bgCanvas.height = img.height * scale;
            ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            ctx.drawImage(img, 0, 0, bgCanvas.width, bgCanvas.height);

            resolve({ img, scale });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}
