function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : { r: 255, g: 255, b: 255 };
}
export function createPreviewRenderer(options) {
    const { canvas, context, primaryColorInput, secondaryColorInput, tertiaryColorInput, quaternaryColorInput, } = options;
    return function renderPreview(pattern) {
        var _a;
        const decoder = new PatternDecoder(pattern);
        const width = 512;
        const height = 512;
        canvas.width = width;
        canvas.height = height;
        const colors = [
            hexToRgb(primaryColorInput.value),
            hexToRgb(secondaryColorInput.value),
            hexToRgb(tertiaryColorInput.value),
            hexToRgb(quaternaryColorInput.value),
        ];
        const imageData = context.createImageData(width, height);
        const data = imageData.data;
        let i = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = 255;
                const value = decoder.getValue(x, y);
                const color = (_a = colors[value]) !== null && _a !== void 0 ? _a : colors[0];
                data[i++] = color.r;
                data[i++] = color.g;
                data[i++] = color.b;
                data[i++] = alpha;
            }
        }
        context.putImageData(imageData, 0, 0);
    };
}
