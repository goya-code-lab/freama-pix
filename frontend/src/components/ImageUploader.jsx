import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImagePlus, AlertCircle } from 'lucide-react';

const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_DIMENSION = 6000;

function ImageUploader({ onUpload }) {
    const [error, setError] = useState('');

    const validateImageDimensions = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
                    resolve(`画像が大きすぎます（最大${MAX_DIMENSION}pxまで）`);
                } else {
                    resolve(null);
                }
            };
            img.onerror = () => resolve('画像の読み込みに失敗しました');
            img.src = URL.createObjectURL(file);
        });
    };

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        setError('');

        if (rejectedFiles.length > 0) {
            const err = rejectedFiles[0].errors[0];
            if (err.code === 'file-too-large') {
                setError('ファイルサイズが15MBを超えています');
            } else {
                setError('対応していないファイル形式かサイズです');
            }
            return;
        }

        const validImages = [];
        for (const file of acceptedFiles) {
            const dimensionError = await validateImageDimensions(file);
            if (dimensionError) {
                setError(dimensionError);
                return; // Stop processing if one fails, or could just skip it
            }

            validImages.push({
                id: Math.random().toString(36).substring(7),
                file,
                preview: URL.createObjectURL(file),
                // Initial crop configuration can be set here later if needed
                crop: null,
            });
        }

        if (validImages.length > 0) {
            onUpload(validImages);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp']
        },
        maxSize: MAX_SIZE,
    });

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`
          border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
          ${isDragActive ? 'border-transparent bg-blue-50/50 drag-active-glow scale-[1.02]' : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]'}
          ${error ? 'border-red-400 bg-red-50/50' : ''}
        `}
            >
                <input {...getInputProps()} />
                <ImagePlus
                    size={32}
                    className={`mb-3 ${isDragActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}
                />
                <p className="text-sm font-medium mb-1">
                    {isDragActive ? 'ここに画像をドロップ...' : 'ここへ画像をドラッグ＆ドロップ'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                    またはクリックしてファイルを選ぶ
                </p>
            </div>

            {error && (
                <div className="mt-2 text-xs text-red-500 flex items-start gap-1 p-2 bg-red-50 rounded-lg">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            <div className="mt-3 text-[10px] text-[var(--muted-foreground)] space-y-1 px-1">
                <p>• 最大サイズ: 15MB</p>
                <p>• 最大寸法: 縦横6000px</p>
                <p>• 対応形式: JPG, PNG, WEBP</p>
            </div>
        </div>
    );
}

export default ImageUploader;
