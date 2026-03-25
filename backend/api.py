from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from typing import List
import urllib.parse
from core.image_processor import process_and_zip_images

router = APIRouter()

# Platform presets dictionary for backend validation and specs
PLATFORMS = {
    "mercari": {"width": 1080, "height": 1080, "max_mb": 10},
    "yahoo-flea": {"width": 1080, "height": 1080, "max_mb": 5},
    "rakuma": {"width": 640, "height": 640, "max_mb": 5},
    "jmty": {"width": 500, "height": 500, "max_mb": 2},
    "yahoo-auction": {"width": 1200, "height": 900, "max_mb": 5}, # 4:3
    "mobaoku": {"width": 1200, "height": 900, "max_mb": 5}, # 4:3
}

@router.post("/convert")
async def convert_images(
    files: List[UploadFile] = File(...),
    platform: str = Form(...),
    base_name: str = Form("Image"),
    start_index: int = Form(1)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # フロントエンドで encodeURIComponent() されたbase_nameを復元
    base_name = urllib.parse.unquote(base_name)

    if platform not in PLATFORMS:
        raise HTTPException(status_code=400, detail="Invalid platform preset")

    preset = PLATFORMS[platform]
    max_bytes = preset["max_mb"] * 1024 * 1024
    
    # Read all files into memory
    files_data = []
    for f in files:
        # Validate content type roughly if needed
        data = await f.read()
        files_data.append(data)
        
    try:
        # Process images and create ZIP
        zip_buffer = process_and_zip_images(
            files_data=files_data,
            platform_label=platform,
            target_width=preset["width"],
            target_height=preset["height"],
            max_bytes=max_bytes,
            start_index=start_index
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

    # Generate filename
    zip_filename = f"{base_name}-{platform}.zip"
    encoded_filename = urllib.parse.quote(zip_filename)
    
    return Response(
        content=zip_buffer.getvalue(), 
        media_type="application/zip", 
        headers={"Content-Disposition": f"attachment; filename*=utf-8''{encoded_filename}"}
    )
