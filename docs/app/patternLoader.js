export function createPatternLoader(options) {
    const { base64Input, tileWidthInput, tileHeightInput, tileWidthValue, tileHeightValue, scaleInput, scaleValue, onPatternLoaded, } = options;
    return function loadFromBase64() {
        const base64 = base64Input.value;
        if (!base64)
            return;
        let decoder;
        try {
            decoder = new PatternDecoder(base64);
        }
        catch (e) {
            alert(e.message);
            return;
        }
        const tileWidth = decoder.getTileWidth();
        const tileHeight = decoder.getTileHeight();
        const scale = decoder.getScale();
        tileWidthInput.value = tileWidth.toString();
        tileHeightInput.value = tileHeight.toString();
        tileWidthValue.value = tileWidthInput.value;
        tileHeightValue.value = tileHeightInput.value;
        scaleInput.value = scale.toString();
        scaleValue.textContent = String(1 << parseInt(scaleInput.value));
        const pattern = new Array(tileHeight);
        for (let y = 0; y < tileHeight; y++) {
            const row = new Array(tileWidth);
            for (let x = 0; x < tileWidth; x++) {
                row[x] = decoder.isSet(x << scale, y << scale) ? 1 : 0;
            }
            pattern[y] = row;
        }
        onPatternLoaded(pattern);
    };
}
