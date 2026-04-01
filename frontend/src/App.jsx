import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageEditorCanvas from './components/ImageEditorCanvas';
import SettingsPanel from './components/SettingsPanel';
import SEOLandingPage from './components/SEOLandingPage';
import AdPlaceholder from './components/AdPlaceholder';
import SeasonalHeader from './components/SeasonalHeader';
import { Upload, Download, HelpCircle, Expand, Minimize, Trash2, ShoppingBag, Images, Crop, Settings, RotateCcw, RotateCw } from 'lucide-react';
import { canvasPreview } from './utils/canvasPreview';
import { PLATFORM_PRESETS } from './components/SettingsPanel';

// ★オプション3（アニメーション＋アイコン強調）の切り替えフラグ
const USE_OPTION_3 = true;

function App() {
  const [images, setImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  // モバイル用タブ state: 'upload' | 'editor' | 'settings'
  const [mobileTab, setMobileTab] = useState('upload');

  const [settings, setSettings] = useState({
    platform: 'mercari',
    baseName: '',
    watermarkText: '',
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 50,
    watermarkSize: 'M',
    mosaicMode: 'none',
    mosaicBrushSize: 20,
    mosaicStrength: 10,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const handleImagesUploaded = (newImages) => {
    setImages((prev) => [...prev, ...newImages]);
    if (selectedImageIndex === null && newImages.length > 0) {
      setSelectedImageIndex(0);
    }
    // スマホ: 画像アップロード後は自動で「編集」タブへ
    setMobileTab('editor');
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessImages = async () => {
    if (images.length === 0) return;

    if (settings.mosaicMode !== 'none') {
      alert('処置中のモザイク処理を確定させてください。');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('platform', settings.platform);
      formData.append('base_name', encodeURIComponent(settings.baseName || 'Image'));
      formData.append('start_index', '1');

      const processedBlobs = await Promise.all(
        images.map(async (img, index) => {
          const imageElement = new Image();
          imageElement.src = img.preview;
          await new Promise((resolve, reject) => {
            imageElement.onload = resolve;
            imageElement.onerror = reject;
          });

          let imageCrop = img.crop;

          if (!imageCrop || isNaN(imageCrop.width) || imageCrop.width === 0) {
            const preset = PLATFORM_PRESETS.find(p => p.id === settings.platform);
            const aspect = preset ? preset.ratio : 1;
            const naturalWidth = imageElement.naturalWidth || 1;
            const naturalHeight = imageElement.naturalHeight || 1;
            const imageAspect = naturalWidth / naturalHeight;

            let cropWidth = 100;
            let cropHeight = 100;

            if (imageAspect > aspect) {
              cropWidth = (naturalHeight * aspect / naturalWidth) * 100;
            } else {
              cropHeight = (naturalWidth / aspect / naturalHeight) * 100;
            }

            imageCrop = {
              unit: '%',
              width: Math.max(0.1, cropWidth),
              height: Math.max(0.1, cropHeight),
              x: Math.max(0, (100 - cropWidth) / 2),
              y: Math.max(0, (100 - cropHeight) / 2)
            };
          }

          const canvas = document.createElement('canvas');

          await canvasPreview(
            imageElement,
            canvas,
            imageCrop,
            settings,
            img.mosaicPaths,
            1,
            0,
            img.noCrop,
            img.rotation || 0
          );

          return new Promise((resolve) => {
            if (canvas.width === 0 || canvas.height === 0) {
              console.error(`Canvas dimensions are zero: ${canvas.width}x${canvas.height} for ${img.file.name}`);
              resolve({ file: img.file, name: img.file.name });
              return;
            }

            canvas.toBlob((blob) => {
              if (!blob) {
                console.error(`Canvas is empty for ${img.file.name}`);
                resolve({ file: img.file, name: img.file.name });
                return;
              }
              const finalFile = new File([blob], img.file.name, { type: 'image/jpeg' });
              resolve({ file: finalFile, name: finalFile.name });
            }, 'image/jpeg', 1.0);
          });
        })
      );

      processedBlobs.forEach((pImg) => {
        formData.append('files', pImg.file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${settings.baseName || 'Image'}-${settings.platform}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to process images trace:', error);
      alert(`画像の処理中にエラーが発生しました: ${error.message}\n(Canvas Tainted, Memory Limit, or Fetch Error)\nコンソールを確認してください。`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 画像リスト + アップローダーパネル（左カラム / モバイル「画像」タブ）
  const uploadPanel = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-sm text-[var(--muted-foreground)] uppercase tracking-wider">画像のアップロード</h2>
          {images.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('アップロードされたすべての画像をクリアして最初からやり直しますか？')) {
                  setImages([]);
                  setSelectedImageIndex(null);
                  setMobileTab('upload');
                }
              }}
              className="text-xs text-red-500 hover:text-red-600 font-bold px-2 py-1.5 rounded-md bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5"
              title="すべての画像を削除する"
            >
              <Trash2 size={14} />
              全クリア
            </button>
          )}
        </div>
        <ImageUploader onUpload={handleImagesUploaded} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col">
        {images.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)] text-sm text-center px-4">
            <p>まだ画像がありません。</p>
            <p className="mt-1 opacity-70">上のエリアに画像をドロップして追加してください。</p>
            <div className="mt-10 w-full animate-in fade-in duration-700">
              <AdPlaceholder format="左カラムネイティブ広告" height="150px" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                onClick={() => {
                  setSelectedImageIndex(index);
                  setMobileTab('editor'); // スマホ: サムネイル選択で編集タブへ
                }}
                className={`
                  animate-slide-up-fade
                  relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 aspect-square
                  ${selectedImageIndex === index ? 'border-[var(--primary)] shadow-md scale-[1.02] ring-2 ring-[var(--primary)]/30' : 'border-transparent hover:border-[var(--border)] opacity-90 hover:opacity-100'}
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-full h-full object-cover transition-transform duration-300"
                  style={{ transform: `rotate(${img.rotation || 0}deg)` }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 flex justify-between items-end">
                  <p className="text-xs text-white truncate drop-shadow-md">{img.file.name}</p>
                </div>

                {/* No-Crop Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newImages = [...images];
                    newImages[index] = { ...newImages[index], noCrop: !newImages[index].noCrop };
                    setImages(newImages);
                  }}
                  className={`absolute top-1 left-1 rounded-md p-1.5 transition-all duration-200 shadow-sm z-10 backdrop-blur-sm
                    ${img.noCrop
                      ? 'bg-blue-500 text-white opacity-100 ring-2 ring-white/50'
                      : 'bg-black/40 text-white/90 hover:bg-black/60 opacity-0 group-hover:opacity-100'
                    }
                  `}
                  title={img.noCrop ? "全体表示ON (余白あり)" : "トリミング表示 (全画面)"}
                >
                  {img.noCrop ? <Minimize size={14} /> : <Expand size={14} />}
                </button>

                {/* Rotate Left Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newImages = [...images];
                    const cur = newImages[index].rotation || 0;
                    newImages[index] = { ...newImages[index], rotation: (cur - 90 + 360) % 360, crop: null, mosaicPaths: [] };
                    setImages(newImages);
                  }}
                  className="absolute bottom-1 left-1 bg-black/40 text-white/90 hover:bg-black/60 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10 backdrop-blur-sm"
                  title="左に90°回転"
                >
                  <RotateCcw size={14} />
                </button>

                {/* Rotate Right Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newImages = [...images];
                    const cur = newImages[index].rotation || 0;
                    newImages[index] = { ...newImages[index], rotation: (cur + 90) % 360, crop: null, mosaicPaths: [] };
                    setImages(newImages);
                  }}
                  className="absolute bottom-1 right-8 bg-black/40 text-white/90 hover:bg-black/60 rounded-md p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10 backdrop-blur-sm"
                  title="右に90°回転"
                >
                  <RotateCw size={14} />
                </button>

                {/* Delete Image Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newImages = [...images];
                    newImages.splice(index, 1);
                    setImages(newImages);

                    if (selectedImageIndex === index) {
                      if (newImages.length > 0) {
                        setSelectedImageIndex(0);
                      } else {
                        setSelectedImageIndex(null);
                        setMobileTab('upload');
                      }
                    } else if (selectedImageIndex > index) {
                      setSelectedImageIndex(selectedImageIndex - 1);
                    }
                  }}
                  className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10 backdrop-blur-sm"
                  title="削除する"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // エディターパネル（中央カラム / モバイル「編集」タブ）
  const editorPanel = (
    <div className="flex-1 bg-[var(--background)] flex items-center justify-center p-4 md:p-6 overflow-hidden relative h-full">
      {selectedImageIndex !== null && images[selectedImageIndex] ? (
        <div key={selectedImageIndex} className="animate-in fade-in duration-300 w-full h-full flex items-center justify-center">
          <ImageEditorCanvas
            image={images[selectedImageIndex]}
            settings={settings}
            onChange={(updatedImage) => {
              const newImages = [...images];
              newImages[selectedImageIndex] = updatedImage;
              setImages(newImages);
            }}
          />
        </div>
      ) : (
        <div className="text-center flex flex-col items-center w-full h-full justify-center">
          <div className="w-full max-w-sm mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-150 fill-mode-both hidden md:block">
            <AdPlaceholder format="メインキャンバス中央広告" height="250px" />
          </div>
          <div className="text-[var(--muted-foreground)] animate-in fade-in duration-500 delay-300 fill-mode-both flex flex-col items-center">
            <div className="mx-auto w-12 h-12 bg-[var(--muted)] rounded-full flex items-center justify-center mb-3">
              <Upload size={20} opacity={0.5} />
            </div>
            <h3 className="text-base font-medium text-[var(--foreground)] mb-1">画像が選択されていません</h3>
            <p className="text-xs max-w-[250px] mx-auto opacity-70 mb-4">「画像」タブから画像をアップロードしてください。</p>
            {/* スマホ用: 画像タブへ誘導ボタン */}
            <button
              onClick={() => setMobileTab('upload')}
              className="md:hidden inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md transition-colors"
            >
              <Images size={16} />
              画像をアップロード
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // 設定パネル（右カラム / モバイル「設定」タブ）
  const settingsPanel = (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-[var(--card)]">
      <SettingsPanel
        settings={settings}
        onChange={handleSettingsChange}
        onProcess={handleProcessImages}
        isReady={images.length > 0 && !isProcessing}
        isProcessing={isProcessing}
      />
      {/* スマホ用: 設定パネル内ダウンロードボタン */}
      <div className="md:hidden p-4 border-t border-[var(--border)] bg-[var(--card)] sticky bottom-0">
        <button
          onClick={handleProcessImages}
          disabled={images.length === 0 || isProcessing}
          className={`
            w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200
            ${images.length > 0 && !isProcessing
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>処理中...</span>
            </>
          ) : (
            <>
              <Download size={18} />
              <span>一括変換してダウンロード（ZIP）</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 border-t border-gray-100 hidden md:block">
        <AdPlaceholder format="右カラム(設定パネル下)広告" height="200px" />
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-gray-900 text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">

      {/* App Workspace Area */}
      <div className="w-full h-[100dvh] flex flex-col bg-[var(--background)] shadow-2xl relative z-20 border-b border-[var(--border)]">

        {/* Header */}
        <header className="border-b flex-shrink-0 border-[var(--border)] bg-[var(--card)] z-10 shadow-sm relative overflow-hidden">

          {/* ヘッダー上段: ロゴ + ダウンロードボタン（PC用） */}
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <SeasonalHeader />

            {/* ロゴ */}
            <div className="flex items-center gap-3 relative z-10 flex-shrink-0">
              <img src="/フリマピクス.ico" alt="フリマピクス ロゴ" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm rounded-lg" />
              <div className="flex flex-col">
                <span className="text-[9px] md:text-xs font-bold text-gray-500 tracking-wider">出品画像変換ステーション</span>
                <h1 className="text-lg md:text-2xl font-extrabold tracking-tight text-gray-900 leading-none mt-0.5">
                  フリマピクス
                </h1>
              </div>
            </div>

            {/* 出品サイト選択 (PC: ヘッダー中央) */}
            <div className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 justify-center z-10 w-auto">
              <div className={`flex flex-wrap justify-center items-center gap-2 bg-gray-50/80 px-4 py-2 rounded-full border shadow-inner transition-all duration-300 ${USE_OPTION_3 ? 'border-blue-100 ring-2 ring-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)] bg-white/95 animate-site-select-pulse' : 'border-gray-100'}`}>
                {USE_OPTION_3 ? (
                  <div className="flex items-center gap-1.5 pl-2 pr-1">
                    <ShoppingBag size={14} className="text-blue-500" />
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest select-none">出品サイト選択</span>
                    <span className="flex h-2 w-2 relative ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-2 pr-1 select-none">出品サイト選択</span>
                )}
                {PLATFORM_PRESETS.map((preset) => {
                  const isActive = settings.platform === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSettingsChange({ platform: preset.id })}
                      style={isActive ? {
                        backgroundColor: preset.brandColor,
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.2)',
                        boxShadow: `0 4px 14px 0 ${preset.brandColor}64`
                      } : {}}
                      className={`
                        relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ease-out flex-shrink-0
                        ${isActive
                          ? `scale-[1.03] -translate-y-0.5 border magic-tab-active ${USE_OPTION_3 ? 'animate-site-select-ripple' : ''}`
                          : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800 shadow-sm'
                        }
                      `}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 右側ボタン群 (PC: ダウンロード + 使い方) */}
            <div className="hidden md:flex items-center justify-end z-20 gap-3">
              <a
                href="#how-to-use"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('how-to-use')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] font-medium transition-colors p-2 rounded-lg hover:bg-[var(--muted)]"
                title="使い方の説明へ移動"
              >
                <HelpCircle size={18} />
                使い方
              </a>

              <button
                onClick={handleProcessImages}
                disabled={images.length === 0 || isProcessing}
                className={`
                  px-5 py-2.5 rounded-full font-bold shadow-sm flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap
                  ${images.length > 0 && !isProcessing
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow shadow-blue-500/30 text-white transform hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span className="text-sm">処理中...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span className="text-sm">一括変換してダウンロード（ZIP）</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 出品サイト選択 (スマホ: 横スクロール行) */}
          <div className="md:hidden border-t border-[var(--border)] px-3 py-2 overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              <div className="flex items-center gap-1 pr-1">
                <ShoppingBag size={12} className="text-blue-500 flex-shrink-0" />
                <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">出品サイト:</span>
              </div>
              {PLATFORM_PRESETS.map((preset) => {
                const isActive = settings.platform === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSettingsChange({ platform: preset.id })}
                    style={isActive ? {
                      backgroundColor: preset.brandColor,
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.2)',
                    } : {}}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 flex-shrink-0 whitespace-nowrap
                      ${isActive
                        ? 'border shadow-sm'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }
                    `}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content Area - 3パネルを1セットだけ定義し CSS で切り替え */}
        <main className="flex-1 flex overflow-hidden">

          {/* 左パネル: 画像リスト
              PC → 常に表示 (flex)
              スマホ → mobileTab === 'upload' の時だけ表示 */}
          <div className={`
            border-r border-[var(--border)] bg-[var(--card)] flex-col h-full z-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
            w-full md:w-80
            ${mobileTab === 'upload' ? 'flex' : 'hidden'} md:flex
          `}>
            {uploadPanel}
          </div>

          {/* 中央パネル: エディタ（ImageEditorCanvas は常にマウント）
              PC → 常に表示
              スマホ → mobileTab === 'editor' の時だけ表示 */}
          <div className={`
            flex-1 bg-[var(--background)] items-center justify-center overflow-hidden relative
            ${mobileTab === 'editor' ? 'flex' : 'hidden'} md:flex
          `}>
            <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
              {selectedImageIndex !== null && images[selectedImageIndex] ? (
                <div key={selectedImageIndex} className="animate-in fade-in duration-300 w-full h-full flex items-center justify-center">
                  <ImageEditorCanvas
                    image={images[selectedImageIndex]}
                    settings={settings}
                    onChange={(updatedImage) => {
                      const newImages = [...images];
                      newImages[selectedImageIndex] = updatedImage;
                      setImages(newImages);
                    }}
                  />
                </div>
              ) : (
                <div className="text-center flex flex-col items-center w-full h-full justify-center">
                  <div className="w-full max-w-sm mb-8 hidden md:block">
                    <AdPlaceholder format="メインキャンバス中央広告" height="250px" />
                  </div>
                  <div className="text-[var(--muted-foreground)] flex flex-col items-center">
                    <div className="mx-auto w-12 h-12 bg-[var(--muted)] rounded-full flex items-center justify-center mb-3">
                      <Upload size={20} opacity={0.5} />
                    </div>
                    <h3 className="text-base font-medium text-[var(--foreground)] mb-1">画像が選択されていません</h3>
                    <p className="text-xs max-w-[250px] mx-auto opacity-70 mb-4">「画像」タブから画像をアップロードしてください。</p>
                    <button
                      onClick={() => setMobileTab('upload')}
                      className="md:hidden inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-full text-sm font-bold shadow-md"
                    >
                      <Images size={16} />
                      画像をアップロード
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右パネル: 設定
              PC → 常に表示
              スマホ → mobileTab === 'settings' の時だけ表示 */}
          <div className={`
            border-l border-[var(--border)] flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-0
            w-full md:w-80
            ${mobileTab === 'settings' ? 'flex' : 'hidden'} md:flex
          `}>
            {settingsPanel}
          </div>

          {/* スマホ用ボトムタブナビ（常に表示、PCでは hidden） */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--card)] flex items-stretch h-14 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-50">
            <button
              onClick={() => setMobileTab('upload')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors text-[11px] font-bold relative
                ${mobileTab === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {mobileTab === 'upload' && <span className="absolute top-0 inset-x-4 h-0.5 bg-blue-600 rounded-b-full" />}
              <Images size={20} />
              <span>画像</span>
              {images.length > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-18px)] bg-blue-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {images.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileTab('editor')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors text-[11px] font-bold relative
                ${mobileTab === 'editor' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {mobileTab === 'editor' && <span className="absolute top-0 inset-x-4 h-0.5 bg-blue-600 rounded-b-full" />}
              <Crop size={20} />
              <span>編集</span>
            </button>
            <button
              onClick={() => setMobileTab('settings')}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors text-[11px] font-bold relative
                ${mobileTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {mobileTab === 'settings' && <span className="absolute top-0 inset-x-4 h-0.5 bg-blue-600 rounded-b-full" />}
              <Settings size={20} />
              <span>設定</span>
            </button>
          </nav>

        </main>

        {/* スマホ用ボトムナビの高さ分のスペーサー */}
        <div className="md:hidden h-14 flex-shrink-0" />

      </div>


      {/* SEO & Landing Page Content */}
      <div className="relative z-10 w-full bg-white">
        <SEOLandingPage />
      </div>

    </div>
  );
}

export default App;
