import io
import zipfile
from typing import List
from PIL import Image

import time


def process_and_zip_images(
    files_data: List[bytes],
    platform_label: str,
    target_width: int,
    target_height: int,
    max_bytes: int,
    start_index: int = 1
) -> io.BytesIO:
    """
    リサイズ、JPEG圧縮で容量制限を満たすまで画質を下げ、ZIPにまとめる処理
    """
    
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for i, file_data in enumerate(files_data):
            current_index = start_index + i
            # 連番ファイル名: e.g. "mercari-image01.jpg"
            filename = f"{platform_label}-image{current_index:02d}.jpg"
            
            # 画像を開く
            image = Image.open(io.BytesIO(file_data))
            
            # RGBに変換 (PNG等からの変換用)
            if image.mode in ("RGBA", "P"):
                image = image.convert("RGB")
            
            # リサイズ処理 (今回はフロントエンド側でアスペクト比固定される前提だが念のためリサイズ)
            # ANTIALIASはPillow 10で削除されたためResampling.LANCZOSを使用
            image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # JPEG圧縮で容量のチェックループ
            quality = 95
            min_quality = 10
            step = 5
            
            while quality >= min_quality:
                img_io = io.BytesIO()
                image.save(img_io, format="JPEG", quality=quality, optimize=True)
                size = img_io.tell()
                
                if size <= max_bytes:
                    # 制限を満たしたら採用
                    zip_file.writestr(filename, img_io.getvalue())
                    break
                
                # 容量オーバーのため品質を下げる
                quality -= step
            
            # 最低品質でも超えた場合（レアケース）はそのまま保存
            if quality < min_quality:
                img_io = io.BytesIO()
                image.save(img_io, format="JPEG", quality=min_quality, optimize=True)
                zip_file.writestr(filename, img_io.getvalue())
                
    zip_buffer.seek(0)
    return zip_buffer
