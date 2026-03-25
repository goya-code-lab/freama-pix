import React, { useState } from 'react';
import { Settings, Image as ImageIcon, Layout, Type, FileText, Sliders } from 'lucide-react';

export const PLATFORM_PRESETS = [
    { id: 'mercari', name: 'メルカリ', ratio: 1 / 1, width: 1080, height: 1080, maxSizeMB: 10, format: 'JPEG', brandColor: '#E72121' },
    { id: 'yahoo-auction', name: 'ヤフオク', ratio: 4 / 3, width: 1200, height: 900, maxSizeMB: 5, format: 'JPEG', brandColor: '#FFCC00' },
    { id: 'yahoo-flea', name: 'ヤフーフリマ', ratio: 1 / 1, width: 1080, height: 1080, maxSizeMB: 5, format: 'JPEG', brandColor: '#FF3385' }, // より明るいピンク
    { id: 'rakuma', name: 'ラクマ', ratio: 1 / 1, width: 640, height: 640, maxSizeMB: 5, format: 'JPEG', brandColor: '#1D6AE5' },
    { id: 'jmty', name: 'ジモティー', ratio: 1 / 1, width: 500, height: 500, maxSizeMB: 2, format: 'JPEG', brandColor: '#238E23' },
    { id: 'mobaoku', name: 'モバオク', ratio: 4 / 3, width: 1200, height: 900, maxSizeMB: 5, format: 'JPEG', brandColor: '#FF6600' }, // オレンジ
];

const PLATFORM_COLOR_CLASSES = {
    'mercari': 'bg-red-50 text-red-800 border-red-200',
    'yahoo-auction': 'bg-amber-50 text-amber-800 border-amber-200',
    'yahoo-flea': 'bg-pink-50 text-pink-800 border-pink-200',
    'rakuma': 'bg-blue-50 text-blue-800 border-blue-200',
    'jmty': 'bg-green-50 text-green-800 border-green-200',
    'mobaoku': 'bg-orange-50 text-orange-800 border-orange-200',
};

function SettingsPanel({ settings, onChange, onProcess, isReady, isProcessing }) {
    const [isAdjustmentsOpen, setIsAdjustmentsOpen] = useState(false);

    const handlePlatformChange = (e) => {
        onChange({ platform: e.target.value });
    };

    const selectedPreset = PLATFORM_PRESETS.find(p => p.id === settings.platform);

    return (
        <div className="flex flex-col h-full bg-white text-sm">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Platform Selection Info Only (Moved to top of Panel) */}
                <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                        <Layout size={14} /> 選択中のプラットフォーム情報
                    </label>

                    {selectedPreset && (
                        <div className={`${PLATFORM_COLOR_CLASSES[selectedPreset.id] || 'bg-gray-50 text-gray-800 border-gray-200'} p-3 rounded-lg flex flex-col gap-1 text-xs border shadow-sm relative overflow-hidden transition-colors duration-300`}>
                            <div className="font-bold text-sm mb-1">{selectedPreset.name} 推奨画像</div>
                            <div className="flex justify-between">
                                <span className="opacity-80">画像の形:</span>
                                <span className="font-medium">{selectedPreset.ratio === 1 ? '1:1（正方形）' : '4:3（横長）'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">出力サイズ:</span>
                                <span className="font-medium">{selectedPreset.width} x {selectedPreset.height} px</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">容量上限:</span>
                                <span className="font-medium">{selectedPreset.maxSizeMB} MB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-80">保存形式:</span>
                                <span className="font-medium">{selectedPreset.format}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Settings Header */}
                <div className="pb-2 border-b border-gray-200 mt-2">
                    <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Settings size={18} />
                        出力設定
                    </h2>
                </div>

                {/* 0. 商品名 */}
                <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700">
                        <FileText size={16} className="text-blue-500" />
                        商品名<span className="text-[10px] text-gray-400 font-normal ml-1">（ZIPファイルの先頭名）</span>
                    </label>
                    <input
                        type="text"
                        maxLength="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 custom-focus-ring"
                        placeholder="例：夏物ワンピース"
                        value={settings.baseName}
                        onChange={(e) => onChange({ baseName: e.target.value })}
                    />
                </div>

                {/* 1. 画像補正 (Image Adjustments) */}
                <div className="space-y-3 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700">
                            <Sliders size={16} className="text-blue-500" /> 
                            画像補正<span className="text-[10px] text-gray-400 font-normal ml-1">（全体一括適用）</span>
                        </label>
                        {!isAdjustmentsOpen && (
                            <button
                                onClick={() => setIsAdjustmentsOpen(true)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded shadow-sm transition-colors"
                            >
                                調整
                            </button>
                        )}
                    </div>

                    {isAdjustmentsOpen && (
                        <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in fade-in slide-in-from-top-2">
                            {/* Brightness */}
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>明るさ</span>
                                    <span>{settings.brightness}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="200" step="5"
                                    value={settings.brightness}
                                    onChange={(e) => onChange({ brightness: parseInt(e.target.value) })}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            {/* Saturation */}
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>鮮やかさ（彩度）</span>
                                    <span>{settings.saturation}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="250" step="5"
                                    value={settings.saturation}
                                    onChange={(e) => onChange({ saturation: parseInt(e.target.value) })}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            {/* Contrast */}
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>くっきり感（コントラスト）</span>
                                    <span>{settings.contrast}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="250" step="5"
                                    value={settings.contrast}
                                    onChange={(e) => onChange({ contrast: parseInt(e.target.value) })}
                                    className="w-full accent-blue-500"
                                />
                            </div>
                            
                            {/* Reset & Close Buttons */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
                                <button
                                    onClick={() => onChange({ brightness: 100, saturation: 100, contrast: 100 })}
                                    className={`text-[10px] underline transition-colors ${
                                        (settings.brightness !== 100 || settings.saturation !== 100 || settings.contrast !== 100)
                                            ? 'text-gray-500 hover:text-red-500'
                                            : 'text-gray-300 cursor-not-allowed no-underline'
                                    }`}
                                    disabled={settings.brightness === 100 && settings.saturation === 100 && settings.contrast === 100}
                                >
                                    リセット
                                </button>
                                <button
                                    onClick={() => setIsAdjustmentsOpen(false)}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-bold rounded shadow-sm transition-colors"
                                >
                                    閉じる
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 pt-5 border-t border-gray-100">
                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700 select-none">
                        <ImageIcon size={16} className="text-blue-500" /> 
                        モザイク・ぼかし処理
                    </label>

                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => onChange({ mosaicMode: 'add' })}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${settings.mosaicMode === 'add' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            追加
                        </button>
                        <button
                            onClick={() => onChange({ mosaicMode: 'erase' })}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${settings.mosaicMode === 'erase' ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            削除
                        </button>
                        <button
                            onClick={() => onChange({ mosaicMode: 'none' })}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                                settings.mosaicMode !== 'none' 
                                    ? 'bg-red-500 text-white shadow-sm hover:bg-red-600 ring-2 ring-red-200' 
                                    : 'bg-blue-600 text-white shadow-sm'
                            }`}
                        >
                            確定
                        </button>
                    </div>

                    {settings.mosaicMode !== 'none' && (
                        <div className="pl-2 space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>ブラシサイズ</span>
                                    <span>{settings.mosaicBrushSize}</span>
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100 group-hover/slider:animate-tooltip-bounce pointer-events-none transition-opacity z-10 whitespace-nowrap">
                                    {settings.mosaicBrushSize} px
                                </div>
                                <input
                                    type="range"
                                    min="5" max="100" step="5"
                                    value={settings.mosaicBrushSize}
                                    onChange={(e) => onChange({ mosaicBrushSize: parseInt(e.target.value) })}
                                    className="w-full accent-blue-600 relative z-0"
                                />
                            </div>
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>モザイクの強さ</span>
                                    <span>{settings.mosaicStrength}</span>
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100 group-hover/slider:animate-tooltip-bounce pointer-events-none transition-opacity z-10 whitespace-nowrap">
                                    強さ: {settings.mosaicStrength}
                                </div>
                                <input
                                    type="range"
                                    min="1" max="50" step="1"
                                    value={settings.mosaicStrength}
                                    onChange={(e) => onChange({ mosaicStrength: parseInt(e.target.value) })}
                                    className="w-full accent-blue-600 relative z-0"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400">※画像上のドラッグでモザイクを塗れます。終わったら「確定」を押してください。</p>
                        </div>
                    )}
                </div>

                {/* Watermark Settings */}
                <div className="space-y-3 pt-5 border-t border-gray-100">
                    <label className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700">
                        <Type size={16} className="text-blue-500" /> 
                        透かし文字<span className="text-[10px] text-gray-400 font-normal ml-1">（無断転載防止用）</span>
                    </label>
                    <input
                        type="text"
                        maxLength="15"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 custom-focus-ring"
                        placeholder="例：@私のアカウント"
                        value={settings.watermarkText}
                        onChange={(e) => onChange({ watermarkText: e.target.value })}
                    />

                    {settings.watermarkText && (
                        <div className="space-y-4 mt-3 animate-in fade-in slide-in-from-top-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">文字の位置</label>
                                    <select
                                        value={settings.watermarkPosition}
                                        onChange={(e) => onChange({ watermarkPosition: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                                    >
                                        <option value="top-left">左上</option>
                                        <option value="top-right">右上</option>
                                        <option value="center">中央</option>
                                        <option value="bottom-left">左下</option>
                                        <option value="bottom-right">右下</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">文字の大きさ</label>
                                    <select
                                        value={settings.watermarkSize}
                                        onChange={(e) => onChange({ watermarkSize: e.target.value })}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                                    >
                                        <option value="S">小さめ</option>
                                        <option value="M">標準</option>
                                        <option value="L">大きめ</option>
                                    </select>
                                </div>
                            </div>
                            <div className="relative group/slider pb-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>文字の濃さ</span>
                                    <span>{settings.watermarkOpacity}%</span>
                                </div>
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover/slider:opacity-100 group-focus-within/slider:opacity-100 group-hover/slider:animate-tooltip-bounce pointer-events-none transition-opacity z-10 whitespace-nowrap">
                                    {settings.watermarkOpacity}%
                                </div>
                                <input
                                    type="range"
                                    min="10" max="100" step="10"
                                    value={settings.watermarkOpacity}
                                    onChange={(e) => onChange({ watermarkOpacity: parseInt(e.target.value) })}
                                    className="w-full accent-blue-600 relative z-0"
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div >
    );
}

export default SettingsPanel;
