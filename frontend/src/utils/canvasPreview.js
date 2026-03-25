export async function canvasPreview(
    image,
    canvas,
    crop,
    settings,
    mosaicPaths,
    scale = 1,
    rotate = 0,
    noCrop = false,
) {
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Fallback to natural width/height if image is off-screen (width = 0)
    const displayWidth = image.width || image.naturalWidth;
    const displayHeight = image.height || image.naturalHeight;

    // Helper to normalize crop to percentages
    const toPercent = (c) => {
        if (c?.unit === 'px') {
            return {
                x: (c.x / displayWidth) * 100,
                y: (c.y / displayHeight) * 100,
                width: (c.width / displayWidth) * 100,
                height: (c.height / displayHeight) * 100,
            };
        }
        return c; // Already in %
    };

    const normCrop = toPercent(crop);

    let cropX = (normCrop.x / 100) * image.naturalWidth;
    let cropY = (normCrop.y / 100) * image.naturalHeight;
    let cropW = (normCrop.width / 100) * image.naturalWidth;
    let cropH = (normCrop.height / 100) * image.naturalHeight;

    // モバイルでのメモリ溢れや真っ白・オリジナル画像送信のフォールバックを防ぐため
    const MAX_DIMENSION = 2048;
    let pixelRatio = 1;
    if (cropW > MAX_DIMENSION || cropH > MAX_DIMENSION) {
        pixelRatio = Math.min(MAX_DIMENSION / cropW, MAX_DIMENSION / cropH);
    }

    const logicalWidth = cropW;
    const logicalHeight = cropH;

    canvas.width = Math.floor(logicalWidth * pixelRatio);
    canvas.height = Math.floor(logicalHeight * pixelRatio);

    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    ctx.save();

    // Fill background with white in case of transparent padding
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    // Center and rotate if needed
    ctx.translate(logicalWidth / 2, logicalHeight / 2);
    ctx.scale(scale, scale);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-logicalWidth / 2, -logicalHeight / 2);

    // Track the actual drawn area of the source image for overlays (like watermark)
    let drawW = logicalWidth;
    let drawH = logicalHeight;
    let drawX = 0;
    let drawY = 0;

    // Apply User Adjustment Filters 
    const filterStr = `brightness(${settings.brightness || 100}%) contrast(${settings.contrast || 100}%) saturate(${settings.saturation || 100}%)`;
    ctx.filter = filterStr;

    if (noCrop) {
        // Render the entire image fitted inside the crop boundaries
        // Maintain aspect ratio of original image within canvas
        const imgAspect = image.naturalWidth / image.naturalHeight;
        const canvasAspect = logicalWidth / logicalHeight;

        if (imgAspect > canvasAspect) {
            // Image is wider than canvas
            drawH = logicalWidth / imgAspect;
            drawY = (logicalHeight - drawH) / 2;
        } else {
            // Image is taller than canvas
            drawW = logicalHeight * imgAspect;
            drawX = (logicalWidth - drawW) / 2;
        }

        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
            drawX,
            drawY,
            drawW,
            drawH,
        );
    } else {
        // Draw the main cropped area of the original image
        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropW,
            cropH,
            0,
            0,
            logicalWidth,
            logicalHeight,
        );
    }

    ctx.restore();

    // Overlay Mosaic if paths exist
    if (mosaicPaths && mosaicPaths.length > 0) {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const mCtx = maskCanvas.getContext('2d');

        mCtx.lineCap = 'round';
        mCtx.lineJoin = 'round';

        // Draw the strokes onto the mask canvas
        const drawPath = (path) => {
            if (!path || path.points.length === 0) return;
            mCtx.globalCompositeOperation = path.mode === 'erase' ? 'destination-out' : 'source-over';

            let currentStrokeSize, getX, getY, offX, offY;

            if (noCrop) {
                currentStrokeSize = (path.size / 500) * (drawW * pixelRatio);
                getX = (px) => (px / 100) * (drawW * pixelRatio);
                getY = (py) => (py / 100) * (drawH * pixelRatio);
                offX = -drawX * pixelRatio;
                offY = -drawY * pixelRatio;
            } else {
                currentStrokeSize = path.size * (image.naturalWidth / 500) * pixelRatio;
                getX = (px) => (px / 100) * image.naturalWidth * pixelRatio;
                getY = (py) => (py / 100) * image.naturalHeight * pixelRatio;
                offX = cropX * pixelRatio;
                offY = cropY * pixelRatio;
            }

            mCtx.lineWidth = currentStrokeSize;
            mCtx.strokeStyle = 'white';
            mCtx.beginPath();

            const first = path.points[0];
            mCtx.moveTo(getX(first.x) - offX, getY(first.y) - offY);
            for (let i = 1; i < path.points.length; i++) {
                const p = path.points[i];
                mCtx.lineTo(getX(p.x) - offX, getY(p.y) - offY);
            }
            mCtx.stroke();
        };

        mosaicPaths.forEach(drawPath);

        // 1. Draw blurred version of the crop onto a new temporary canvas
        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = canvas.width;
        blurCanvas.height = canvas.height;
        const bCtx = blurCanvas.getContext('2d');

        if (noCrop) {
            const blurScaleFactor = (drawW * pixelRatio) / 500;
            const scaledBlur = settings.mosaicStrength * blurScaleFactor;
            bCtx.filter = `blur(${scaledBlur}px) ${filterStr}`;

            bCtx.drawImage(
                image,
                0, 0, image.naturalWidth, image.naturalHeight,
                drawX * pixelRatio, drawY * pixelRatio, drawW * pixelRatio, drawH * pixelRatio
            );
        } else {
            const blurScaleFactor = (image.naturalWidth * pixelRatio) / 500;
            const scaledBlur = settings.mosaicStrength * blurScaleFactor;
            bCtx.filter = `blur(${scaledBlur}px) ${filterStr}`;

            bCtx.drawImage(
                image,
                cropX, cropY, cropW, cropH,
                0, 0, canvas.width, canvas.height
            );
        }

        // 2. Use destination-in to mask the blurCanvas with our stroked maskCanvas
        bCtx.filter = 'none';
        bCtx.globalCompositeOperation = 'destination-in';
        bCtx.drawImage(maskCanvas, 0, 0);

        // 3. Draw the masked blurCanvas ONTO the main canvas
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform back to physical pixels
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(blurCanvas, 0, 0);
        ctx.restore();
    }

    // Draw Watermark
    if (settings && settings.watermarkText) {
        ctx.save();

        // Font size logic based on the actual drawn image area
        let fontScale = 0.05;
        if (settings.watermarkSize === 'S') fontScale = 0.03;
        if (settings.watermarkSize === 'L') fontScale = 0.08;

        const fontSize = Math.max(16, Math.floor(drawW * fontScale));

        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${settings.watermarkOpacity / 100})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = Math.max(2, fontSize * 0.1);
        ctx.shadowOffsetY = Math.max(1, fontSize * 0.05);

        let x = drawX + (drawW / 2);
        let y = drawY + (drawH / 2);
        // Adjust padding to look nicely distanced from edges
        const padding = fontSize;

        switch (settings.watermarkPosition) {
            case 'top-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                x = drawX + padding;
                y = drawY + padding;
                break;
            case 'top-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                x = drawX + drawW - padding;
                y = drawY + padding;
                break;
            case 'bottom-left':
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';
                x = drawX + padding;
                y = drawY + drawH - padding;
                break;
            case 'bottom-right':
                ctx.textAlign = 'right';
                ctx.textBaseline = 'bottom';
                x = drawX + drawW - padding;
                y = drawY + drawH - padding;
                break;
            case 'center':
            default:
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                x = drawX + (drawW / 2);
                y = drawY + (drawH / 2);
                break;
        }

        ctx.fillText(settings.watermarkText, x, y);
        ctx.restore();
    }
}
