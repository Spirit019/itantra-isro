#!/usr/bin/env python3
"""
iTantra On-Device Language Model Downloader & Manager
Downloads quantized INT8 ONNX models for Indian languages:
- ASR: AI4Bharat IndicConformer (Sherpa-ONNX)
- TTS: Piper VITS Indian Voices (Hindi, Tamil, Bengali, Marathi, English)
- VAD: Silero VAD v5
"""

import os
import sys
import argparse
import urllib.request
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
PUBLIC_MODELS_DIR = os.path.join(BASE_DIR, "public", "models")

PIPER_BASE_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main"

MODELS_CONFIG = {
    "vad": {
        "url": "https://github.com/snakers4/silero-vad/raw/master/src/silero_vad/data/silero_vad.onnx",
        "file": "silero_vad.onnx",
        "size": "~1.8 MB"
    },
    "tts_voices": {
        "hi": {
            "name": "Hindi (हिंदी)",
            "onnx": f"{PIPER_BASE_URL}/hi/hi_IN/dhiru/medium/hi_IN-dhiru-medium.onnx",
            "json": f"{PIPER_BASE_URL}/hi/hi_IN/dhiru/medium/hi_IN-dhiru-medium.onnx.json",
            "filename": "hi_IN-dhiru-medium.onnx"
        },
        "ta": {
            "name": "Tamil (தமிழ்)",
            "onnx": f"{PIPER_BASE_URL}/ta/ta_IN/jaya/medium/ta_IN-jaya-medium.onnx",
            "json": f"{PIPER_BASE_URL}/ta/ta_IN/jaya/medium/ta_IN-jaya-medium.onnx.json",
            "filename": "ta_IN-jaya-medium.onnx"
        },
        "bn": {
            "name": "Bengali (বাংলা)",
            "onnx": f"{PIPER_BASE_URL}/bn/bn_IN/tanmoy/medium/bn_IN-tanmoy-medium.onnx",
            "json": f"{PIPER_BASE_URL}/bn/bn_IN/tanmoy/medium/bn_IN-tanmoy-medium.onnx.json",
            "filename": "bn_IN-tanmoy-medium.onnx"
        },
        "mr": {
            "name": "Marathi (मराठी)",
            "onnx": f"{PIPER_BASE_URL}/mr/mr_IN/suhas/medium/mr_IN-suhas-medium.onnx",
            "json": f"{PIPER_BASE_URL}/mr/mr_IN/suhas/medium/mr_IN-suhas-medium.onnx.json",
            "filename": "mr_IN-suhas-medium.onnx"
        },
        "en": {
            "name": "English (Indian)",
            "onnx": f"{PIPER_BASE_URL}/en/en_IN/cpc_female/medium/en_IN-cpc_female-medium.onnx",
            "json": f"{PIPER_BASE_URL}/en/en_IN/cpc_female/medium/en_IN-cpc_female-medium.onnx.json",
            "filename": "en_IN-cpc_female-medium.onnx"
        }
    }
}

def download_file(url, destination):
    print(f"📥 Downloading: {os.path.basename(destination)} ...")
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as response, open(destination, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"✅ Saved: {destination} ({len(data) / (1024*1024):.2f} MB)")
            return True
    except Exception as e:
        print(f"⚠️ Failed to download {url}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Download iTantra Multilingual AI Models")
    parser.add_argument("--lang", choices=["all", "hi", "ta", "bn", "mr", "en", "vad"], default="all",
                        help="Language or model to download")
    args = parser.parse_args()

    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(PUBLIC_MODELS_DIR, exist_ok=True)

    print("🚀 Starting iTantra Model Downloader...")
    
    # Download VAD
    if args.lang in ["all", "vad"]:
        vad_dest = os.path.join(MODELS_DIR, MODELS_CONFIG["vad"]["file"])
        if not os.path.exists(vad_dest):
            download_file(MODELS_CONFIG["vad"]["url"], vad_dest)

    # Download TTS Voices
    languages = [args.lang] if args.lang not in ["all", "vad"] else MODELS_CONFIG["tts_voices"].keys()
    
    for lang in languages:
        if lang in MODELS_CONFIG["tts_voices"]:
            voice = MODELS_CONFIG["tts_voices"][lang]
            print(f"\n🌐 Processing {voice['name']}...")
            
            onnx_dest = os.path.join(MODELS_DIR, voice["filename"])
            json_dest = os.path.join(MODELS_DIR, voice["filename"] + ".json")
            
            if not os.path.exists(json_dest):
                download_file(voice["json"], json_dest)
            if not os.path.exists(onnx_dest):
                download_file(voice["onnx"], onnx_dest)

    print("\n✨ Model preparation complete! Models are saved in:", MODELS_DIR)

if __name__ == "__main__":
    main()
