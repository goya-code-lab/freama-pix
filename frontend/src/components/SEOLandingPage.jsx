import React from 'react';
import { Upload, Image as ImageIcon, Download, Scissors, ShieldAlert, CheckCircle2 } from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

const SEOLandingPage = () => {
    return (
        <div className="bg-white scroll-smooth pb-24">
            {/* Hero / Value Prop Section */}
            <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    <span className="block text-xl md:text-2xl text-blue-600 mb-3 font-bold tracking-widest">出品画像変換ステーション</span>
                    フリマピクス
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                    フリマ出品をもっとカンタンに、もっと綺麗に。メルカリ、ヤフオク、ラクマなどのフリマアプリに最適な画像サイズへ、一括でトリミング・モザイク加工・透かし文字入れができる完全無料のブラウザツールです。
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-700">
                    <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                        <CheckCircle2 size={16} /> インストール不要
                    </span>
                    <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                        <CheckCircle2 size={16} /> 複数画像を一括処理
                    </span>
                    <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
                        <CheckCircle2 size={16} /> 完全無料・登録なし
                    </span>
                </div>
            </section>

            {/* In-feed Ad 1 */}
            <div className="max-w-4xl mx-auto px-6 mb-12">
                <AdPlaceholder format="インフィード広告 (レスポンシブ)" height="120px" />
            </div>

            {/* How to Use Section */}
            <section id="how-to-use" className="bg-gray-50 py-16 border-y border-gray-100 scroll-mt-6">
                <div className="max-w-4xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-center text-gray-900 mb-12">
                        使い方 3ステップ
                    </h3>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative pt-10">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center text-lg shadow-md border-4 border-gray-50">1</div>
                            <div className="flex justify-center mb-4 text-blue-500">
                                <Upload size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-center mb-2">画像をアップロード</h4>
                            <p className="text-gray-600 text-sm leading-relaxed text-center">
                                スマホやPCから、出品したい商品画像をドラッグ＆ドロップで一括で追加します。
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative pt-10">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center text-lg shadow-md border-4 border-gray-50">2</div>
                            <div className="flex justify-center mb-4 text-blue-500">
                                <Scissors size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-center mb-2">サイト選択・編集</h4>
                            <p className="text-gray-600 text-sm leading-relaxed text-center">
                                出品先のサイト（メルカリ等）を選ぶと自動で最適な縦横比に。モザイクや透かし文字も直感的に入れられます。
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative pt-10">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center text-lg shadow-md border-4 border-gray-50">3</div>
                            <div className="flex justify-center mb-4 text-blue-500">
                                <Download size={32} />
                            </div>
                            <h4 className="text-lg font-bold text-center mb-2">一括ダウンロード</h4>
                            <p className="text-gray-600 text-sm leading-relaxed text-center">
                                編集が終わったらダウンロードボタンを押すだけ。複数の画像が1つのZIPファイルにまとまって保存されます。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / Use Cases */}
            <section className="max-w-4xl mx-auto px-6 py-16">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-10">
                    こんな機能で出品をサポート
                </h3>
                <div className="grid sm:grid-cols-2 gap-6">
                    <div className="flex gap-4 items-start p-5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="bg-red-100 text-red-600 p-3 rounded-lg shrink-0">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">各プラットフォーム推奨サイズ対応</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">メルカリの正方形（1:1）や、ヤフオクの4:3など、自動でガイド枠が表示され、迷わず綺麗なカタログ画像が作れます。</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start p-5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="bg-orange-100 text-orange-600 p-3 rounded-lg shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">無断転載防止の透かし文字入れ</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">あなたの大切な商品画像が外部サイト等で勝手に使われないよう、半透明のウォーターマークを自由な位置に一括合成できます。</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* In-feed Ad 2 */}
            <div className="max-w-3xl mx-auto px-6 mb-16">
                <AdPlaceholder format="記事下広告 (レクタングル大または横長)" height="250px" />
            </div>

            {/* FAQ Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-3xl mx-auto px-6">
                    <h3 className="text-2xl font-bold text-center mb-10">
                        よくある質問 (FAQ)
                    </h3>
                    <div className="space-y-6">
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <span className="text-blue-400">Q.</span> スマホで撮った縦長の画像でも大丈夫ですか？
                            </h4>
                            <p className="text-gray-300 leading-relaxed ml-7">
                                はい。長方形の画像でも、各フリマアプリ推奨の比率（正方形など）の切り抜き枠が表示されます。画像上で枠を動かして、目立たせたい部分を簡単にトリミングできます。
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <span className="text-blue-400">Q.</span> 画像はサーバーに保存されますか？（安全性について）
                            </h4>
                            <p className="text-gray-300 leading-relaxed ml-7">
                                いいえ、保存されません。当ツールは画像処理のために一時的に暗号化してサーバーへ送信を行いますが、変換終了後ただちにデータは自動削除されます。外部サーバーに皆様の画像が保管されることは一切ありませんので、安全にご利用いただけます。
                            </p>
                        </div>
                        <div className="bg-gray-800 rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <span className="text-blue-400">Q.</span> モザイク加工はどうやって使いますか？
                            </h4>
                            <p className="text-gray-300 leading-relaxed ml-7">
                                サイドメニューの「モザイク処理」から「追加」を選択し、画像の隠したい部分（背景の部屋や個人情報など）をマウスや指でなぞるだけで、簡単にモザイクをかけられます。
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SEOLandingPage;
