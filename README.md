# 🛰️ iTantra — Indian Multilingual Neural Transceiver (SIH26173)

> **Smart India Hackathon 2026 | Problem Statement: SIH26173 (ISRO)**  
> **Team NeuralMesh** | Ultra-Low Bitrate (24 bps) Speech-to-Semantic-Token Radio Transceiver for Disaster Zones & Space Missions.

---

## ⚡ Overview

In disaster zones, maritime crises, and remote space analog missions, high-bandwidth cellular networks collapse. Traditional voice codecs (PCM, Opus, AMR) require **12,000 to 64,000 bits per second**, causing instant communication blackouts.

**iTantra solves this by replacing waveform audio transmission with Semantic Communication:**
1. **Speech ➔ Text:** On-device Conformer ASR converts spoken Indian languages directly into text without internet.
2. **Text ➔ 18-Byte Token:** SCSU + Indic-BPE compresses sentences into an **18-byte neural token** (a **2,666× bandwidth reduction** down to **24 bps**).
3. **Low-Bitrate Radio Transport:** Transmitted over 865 MHz LoRa (SX1262) or Bluetooth Low Energy (BLE 5.0 Long Range) penetrating concrete and heavy foliage.
4. **Token ➔ Neural Voice:** On-device FastPitch + Vocos neural TTS reconstructs natural, studio-quality voice in the recipient's chosen Indian language.

---

## 🚀 Quick Start (Run Working Demo Locally)

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch
```bash
# Clone or navigate to the repository
cd itantra-demo-app

# Install dependencies
npm install

# Start local interactive demo
npm run dev
```

Open **`http://localhost:5173/`** in your browser to interact with the working transceiver simulator.

---

## 🎮 Interactive Features in the Demo App

- **🎙️ Live Push-To-Talk (PTT) Transmitter (Node Alpha):** 
  - 6 pre-loaded Indic disaster/tactical samples (Hindi, Tamil, Bengali, Telugu, Marathi, English).
  - Microphone capture with live audio waveform.
- **📦 18-Byte Hex Inspector:**
  - Interactive breakdown of Byte 0 (Header), Byte 1 (Language ID), Byte 2 (Priority), Bytes 3-4 (Speaker Embedding), Bytes 5-15 (BPE Payload), Bytes 16-17 (Reed-Solomon RS(32,24) & CRC16).
- **📡 Air Interface Radio Simulator:**
  - Dynamic sliders for Distance (0.5 to 15 km), Spreading Factor (SF7 to SF12), RF Noise & Time-on-Air (ToA) calculation.
  - Faraday Cage toggle simulating operation with zero WiFi/cellular.
- **🔊 Token-to-Speech Receiver (Node Bravo):**
  - Instant voice synthesis playback using Web Speech & Web Audio APIs in native Indic accents.
  - Cross-lingual synthesis (speak Hindi at Node A, hear Tamil at Node B).
- **🚨 Level 0 Emergency SOS:**
  - Instant channel preemption, audible siren, and simulated NavIC GPS telemetry (`30.42° N, 79.33° E`).

---

## ⏱️ 369ms End-to-End Latency Budget

| Pipeline Step | Module | Latency |
| :--- | :--- | :---: |
| 1. Voice Capture & VAD | Silero VAD v5 ONNX | **35 ms** |
| 2. Speech-to-Text | IndicConformer RNN-T INT8 | **120 ms** |
| 3. Compression & Framing | SCSU + Indic-BPE + RS(32,24) | **16 ms** |
| 4. Radio Air Interface | LoRa SX1262 (SF7 / 125kHz) | **56 ms** |
| 5. Neural Speech Synthesis | FastPitch + Vocos ONNX | **112 ms** |
| 6. Audio HAL Buffer | Android AAudio | **30 ms** |
| **TOTAL END-TO-END** | | **369 ms** |

---

## 🛠️ Hardware Setup Tiers for SIH

| Tier | Hardware Required | Range | Cost | Best For |
| :--- | :--- | :---: | :---: | :--- |
| **Tier 1 (BLE)** | 2× Standard Android Phones (BLE 5.0) | 50–100 m | **₹0** | Instant 36-hour hackathon demo |
| **Tier 2 (HC-12)** | 2× HC-12 433 MHz Modules + USB-OTG | 1–1.8 km | **₹600** | External radio hardware look |
| **Tier 3 (LoRa)** | 2× SX1262 EBYTE Modules + SMA Antennas | 10–15 km | **₹2,800** | ISRO field deployment |

---

## 📁 Project Structure

```
itantra-demo-app/
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── App.jsx              # Main tactical UI & simulator
│   ├── index.css            # Dark tactical CSS & animations
│   ├── main.jsx             # React entrypoint
│   ├── data/
│   │   └── samplesAndInfo.js # Multilingual Indic samples & specs
│   └── utils/
│       └── audioEngine.js   # Web Audio API + SpeechSynthesis engine
└── dist/                    # Compiled static production build
```

---

## 📜 License
MIT License — Built for Smart India Hackathon 2026.
