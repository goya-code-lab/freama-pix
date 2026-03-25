import React, { useRef, useState, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { PLATFORM_PRESETS } from './SettingsPanel';
import { Expand } from 'lucide-react';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    const minPercent = 90;
    const imageAspect = mediaWidth / mediaHeight;
    let cropWidth = minPercent;
    let cropHeight = minPercent;

    if (imageAspect > aspect) {
        cropWidth = (minPercent * mediaHeight * aspect) / mediaWidth;
    } else {
        cropHeight = (minPercent * mediaWidth) / (mediaHeight * aspect);
    }

    return {
        unit: '%',
        width: cropWidth,
        height: cropHeight,
        x: (100 - cropWidth) / 2,
        y: (100 - cropHeight) / 2
    };
}

function ImageEditorCanvas({ image, settings, onChange }) {
    const selectedPreset = PLATFORM_PRESETS.find(p => p.id === settings.platform);
    const aspect = selectedPreset ? selectedPreset.ratio : 1;

    // If the image doesn't have a crop initialized, start with null.
    // onImageLoad will calculate the correct crop once the natural dimensions are known.
    const [localCrop, setLocalCrop] = useState(image.crop ?? null);

    // Mosaic Brush States
    const [paths, setPaths] = useState(image.mosaicPaths || []);
    const [currentPath, setCurrentPath] = useState(null);
    const [maskDataUrl, setMaskDataUrl] = useState('');
    const maskCanvasRef = useRef(document.createElement('canvas'));

    const imgRef = useRef(null);

    // useRef で paths の最新値を常に参照できるようにする（stale closure 対策）
    const pathsRef = useRef(paths);
    useEffect(() => { pathsRef.current = paths; }, [paths]);

    // Reset crop and paths when image changes or aspect ratio changes (preset change)
    useEffect(() => {
        if (imgRef.current && imgRef.current.width > 0 && imgRef.current.height > 0) {
            const { width, height } = imgRef.current;
            const newCrop = centerAspectCrop(width, height, aspect);
            const newPaths = image.mosaicPaths || [];
            setLocalCrop(newCrop);
            setPaths(newPaths);
            setMaskDataUrl('');
            // mosaicPaths を明示的に渡して消去されないようにする
            onChange({ ...image, crop: newCrop, mosaicPaths: newPaths, imgRef: imgRef.current });
        }
    }, [image.id, aspect]);

    function onImageLoad(e) {
        // 画像ロード時は pathsRef.current（最新の paths）を使って mosaicPaths を保持する
        const currentPaths = pathsRef.current;
        if (!image.crop) {
            const { width, height } = e.currentTarget;
            const newCrop = centerAspectCrop(width, height, aspect);
            setLocalCrop(newCrop);
            onChange({ ...image, crop: newCrop, mosaicPaths: currentPaths, imgRef: imgRef.current });
        } else {
            onChange({ ...image, mosaicPaths: currentPaths, imgRef: imgRef.current });
        }
    }

    // Rebuild Mask DataURL whenever paths change
    useEffect(() => {
        if (!imgRef.current) return;
        const canvas = maskCanvasRef.current;
        const ctx = canvas.getContext('2d');
        // Use logical dimensions or natural, logical is easiest for proportional drawing matches
        const { width, height } = imgRef.current;
        if (width === 0 || height === 0) return;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const drawPath = (path) => {
            if (!path || path.points.length === 0) return;
            ctx.globalCompositeOperation = path.mode === 'erase' ? 'destination-out' : 'source-over';
            // Scale brush size relative to a standard 500px width reference so it feels consistent
            ctx.lineWidth = path.size * (width / 500);
            ctx.strokeStyle = 'black'; // Color doesn't matter for alpha mask visually, mask-image uses alpha

            ctx.beginPath();
            const first = path.points[0];
            ctx.moveTo((first.x / 100) * width, (first.y / 100) * height);
            for (let i = 1; i < path.points.length; i++) {
                const p = path.points[i];
                ctx.lineTo((p.x / 100) * width, (p.y / 100) * height);
            }
            ctx.stroke();
        };

        paths.forEach(drawPath);
        if (currentPath) drawPath(currentPath);

        setMaskDataUrl(canvas.toDataURL('image/png'));
    }, [paths, currentPath, image.id]);

    const handlePointerDown = (e) => {
        if (settings.mosaicMode === 'none') return;
        e.preventDefault();
        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setCurrentPath({
            mode: settings.mosaicMode,
            size: settings.mosaicBrushSize,
            points: [{ x, y }]
        });
    };

    const handlePointerMove = (e) => {
        if (!currentPath || settings.mosaicMode === 'none') return;
        e.preventDefault();
        const rect = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCurrentPath(prev => ({ ...prev, points: [...prev.points, { x, y }] }));
    };

    const handlePointerUp = (e) => {
        if (!currentPath || settings.mosaicMode === 'none') return;
        const newPaths = [...paths, currentPath];
        setPaths(newPaths);
        onChange({ ...image, mosaicPaths: newPaths, imgRef: imgRef.current });
        setCurrentPath(null);
    };

    const currentCrop = image.noCrop
        ? { unit: '%', width: 100, height: 100, x: 0, y: 0 }
        : (localCrop || image.crop);

    const isMosaicMode = settings.mosaicMode !== 'none';

    // Calculate cursor size based on brush size setting
    // The brush size in canvas is relative to a 500px width. 
    // We scale it approximately for the viewport cursor.
    const getCursorStyle = () => {
        if (!isMosaicMode) return 'default';

        let displaySize = 20; // Default fallback
        if (imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            // Match the brush visual scale logic: size * (width / 500)
            displaySize = settings.mosaicBrushSize * (rect.width / 500);
        }

        // Clamp size to avoid massive cursors
        const cursorSize = Math.min(Math.max(displaySize, 10), 100);
        const halfSize = cursorSize / 2;

        let cursorSVG = '';
        if (settings.mosaicMode === 'add') {
            // Circle cursor for Add
            cursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}">
                <circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - 1}" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" stroke-width="2"/>
                <path d="M ${halfSize - 4} ${halfSize} L ${halfSize + 4} ${halfSize} M ${halfSize} ${halfSize - 4} L ${halfSize} ${halfSize + 4}" stroke="rgb(59, 130, 246)" stroke-width="1.5"/>
            </svg>`;
        } else if (settings.mosaicMode === 'erase') {
            // Elegant Eraser cursor: Orange dashed outline with transparent fill to see the image beneath
            cursorSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 ${cursorSize} ${cursorSize}">
                <circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - 1}" fill="transparent" stroke="rgb(249, 115, 22)" stroke-width="2" stroke-dasharray="4"/>
                <circle cx="${halfSize}" cy="${halfSize}" r="1.5" fill="rgb(249, 115, 22)"/>
            </svg>`;
        } else {
            return 'default';
        }

        const encodedSVG = btoa(cursorSVG);
        return `url('data:image/svg+xml;base64,${encodedSVG}') ${halfSize} ${halfSize}, crosshair`;
    };

    return (
        <div className="flex flex-col h-full w-full items-center justify-center relative">
            {/* Ambient Platform Glow Background */}
            <div
                className="absolute inset-[-20%] pointer-events-none transition-all duration-1000 ease-out z-0"
                style={{
                    background: selectedPreset ? `radial-gradient(circle at center, ${selectedPreset.brandColor}1A 0%, ${selectedPreset.brandColor}0D 40%, transparent 80%)` : 'none',
                    opacity: isMosaicMode ? 0.3 : 1
                }}
            />

            {/* Preview Container */}
            <div
                className={`transition-all duration-500 relative max-w-full max-h-full overflow-hidden rounded-xl shadow-lg border border-[var(--border)] bg-gray-50 flex items-center justify-center p-2 z-10 ${isMosaicMode ? 'mosaic-active-container ring-2 ring-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''} ${image.noCrop ? 'no-crop-active-container' : ''}`}
                style={!isMosaicMode && selectedPreset ? { boxShadow: `0 20px 60px -15px ${selectedPreset.brandColor}33, 0 0 40px -10px ${selectedPreset.brandColor}26` } : {}}
            >
                <ReactCrop
                    crop={currentCrop}
                    onChange={(_, percentCrop) => {
                        if (!isMosaicMode && !image.noCrop) setLocalCrop(percentCrop);
                    }}
                    onComplete={(_, percentCrop) => {
                        if (!isMosaicMode && !image.noCrop) onChange({ ...image, crop: percentCrop, imgRef: imgRef.current });
                    }}
                    aspect={aspect}
                    className={`max-h-[70vh] react-crop-custom ${(image.noCrop && !isMosaicMode) ? 'opacity-70 grayscale-[30%]' : ''}`}
                    disabled={isMosaicMode || image.noCrop}
                    locked={isMosaicMode || image.noCrop}
                >
                    <img
                        ref={imgRef}
                        src={image.preview}
                        alt="切り抜きプレビュー"
                        onLoad={onImageLoad}
                        className="max-h-[70vh] w-auto object-contain select-none pointer-events-none transition-all duration-75"
                        style={{
                            filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`
                        }}
                    />

                    {/* Blurred Mask Overlay & Brush Event Catcher */}
                    {(isMosaicMode || maskDataUrl) && (
                        <div
                            className={`absolute inset-0 w-full h-full z-10 ${isMosaicMode ? 'touch-none' : 'pointer-events-none'}`}
                            onPointerDown={isMosaicMode ? handlePointerDown : undefined}
                            onPointerMove={isMosaicMode ? handlePointerMove : undefined}
                            onPointerUp={isMosaicMode ? handlePointerUp : undefined}
                            onPointerLeave={isMosaicMode ? handlePointerUp : undefined}
                            onPointerCancel={isMosaicMode ? handlePointerUp : undefined}
                            style={{
                                cursor: getCursorStyle(),
                                backdropFilter: maskDataUrl ? `blur(${settings.mosaicStrength}px)` : 'none',
                                WebkitBackdropFilter: maskDataUrl ? `blur(${settings.mosaicStrength}px)` : 'none',
                                maskImage: maskDataUrl ? `url(${maskDataUrl})` : 'none',
                                WebkitMaskImage: maskDataUrl ? `url(${maskDataUrl})` : 'none',
                                maskSize: '100% 100%',
                                WebkitMaskSize: '100% 100%',
                                maskRepeat: 'no-repeat',
                                WebkitMaskRepeat: 'no-repeat',
                            }}
                        />
                    )}
                </ReactCrop>

                {/* Overlay Watermark for UI Preview - Bound strictly to crop box visually if possible, or relative to image */}
                {settings.watermarkText && currentCrop && (
                    <div
                        className="absolute pointer-events-none text-white font-bold tracking-wider drop-shadow-md z-10 p-2"
                        style={{
                            opacity: settings.watermarkOpacity / 100,
                            // Size options
                            fontSize: settings.watermarkSize === 'S' ? 'clamp(0.7rem, 1.5vw, 1rem)' :
                                settings.watermarkSize === 'L' ? 'clamp(1.5rem, 5vw, 3rem)' : 'clamp(1rem, 3vw, 2rem)',
                            textShadow: '0px 2px 4px rgba(0,0,0,0.8)',

                            // Positioning relative to the crop area (represented by percentage logic visually on top of the image)
                            // Since the actual image is center-aligned, we simulate the crop box boundaries
                            ...(settings.watermarkPosition === 'top-left' && { top: `${currentCrop.y}%`, left: `${currentCrop.x}%` }),
                            ...(settings.watermarkPosition === 'top-right' && { top: `${currentCrop.y}%`, right: `${100 - currentCrop.x - currentCrop.width}%` }),
                            ...(settings.watermarkPosition === 'bottom-left' && { bottom: `${100 - currentCrop.y - currentCrop.height}%`, left: `${currentCrop.x}%` }),
                            ...(settings.watermarkPosition === 'bottom-right' && { bottom: `${100 - currentCrop.y - currentCrop.height}%`, right: `${100 - currentCrop.x - currentCrop.width}%` }),
                            ...(settings.watermarkPosition === 'center' && {
                                top: `${currentCrop.y + (currentCrop.height / 2)}%`,
                                left: `${currentCrop.x + (currentCrop.width / 2)}%`,
                                transform: 'translate(-50%, -50%)'
                            }),
                        }}
                    >
                        {settings.watermarkText}
                    </div>
                )}
                {/* No Crop Active Overlay Badge */}
                {image.noCrop && !isMosaicMode && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 bg-white/30 backdrop-blur-[2px]">
                        <div className="bg-blue-600 text-white font-bold px-8 py-5 rounded-2xl shadow-xl flex flex-col items-center gap-2 text-center transform transition-all">
                            <div className="flex items-center gap-2 text-xl mb-1">
                                <Expand size={24} />
                                全体表示ON
                            </div>
                            <div className="text-sm md:text-base font-medium opacity-90 leading-relaxed">
                                トリミングはせずに推奨サイズで保存されます。<br />
                                画像が無い部分は白い余白となります
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Temporary Info text for MVP */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow border border-gray-100 text-xs font-medium text-gray-600 flex flex-col gap-1 items-end z-20">
                <span>切り抜き比率: {aspect === 1 ? '1:1（正方形）' : '4:3（横長）'}</span>
                {isMosaicMode && <span className="text-blue-600">※現在モザイク処理（{settings.mosaicMode === 'add' ? '追加中' : '削除中'}）</span>}
            </div>
        </div>
    );
}

export default ImageEditorCanvas;
