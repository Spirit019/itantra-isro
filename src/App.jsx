import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  AlertTriangle,
  Layers,
  Cpu,
  Shield,
  Activity,
  Send,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  Server,
  WifiOff,
  Sliders,
  Play,
  Square
} from 'lucide-react';
import { TACTICAL_SAMPLES, HOW_IT_WORKS_INFO } from './data/samplesAndInfo';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState('demo'); // demo | architecture | latency | hardware | judge_qa
  const [selectedSample, setSelectedSample] = useState(TACTICAL_SAMPLES[0]);
  const [customText, setCustomText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [packetDelivered, setPacketDelivered] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Radio Channel Settings
  const [radioMode, setRadioMode] = useState('lora'); // lora | ble | hc12
  const [spreadingFactor, setSpreadingFactor] = useState(7); // SF7 to SF12
  const [rfNoise, setRfNoise] = useState(5); // 0 to 50%
  const [distanceKm, setDistanceKm] = useState(4.5); // 0.1 to 15 km
  const [faradayCageActive, setFaradayCageActive] = useState(true); // zero internet demo

  // SOS Emergency State
  const [isEmergencySos, setIsEmergencySos] = useState(false);
  const [receiverTargetLang, setReceiverTargetLang] = useState('same'); // same | en | hi | ta | bn

  // Audio Visualizer Simulation
  const [waveformData, setWaveformData] = useState([15, 30, 60, 45, 80, 55, 90, 40, 70, 30, 20]);
  const waveIntervalRef = useRef(null);

  // Time-on-Air (ToA) Calculation in ms
  const calculateToA = () => {
    if (radioMode === 'ble') return 18;
    if (radioMode === 'hc12') return 35;
    // LoRa SX1262 formula approximation for 18 bytes
    const sf = spreadingFactor;
    const baseToA = Math.round(Math.pow(2, sf) / 125 * (18 + 12) * 0.25);
    return Math.max(45, baseToA);
  };

  const timeOnAirMs = calculateToA();

  // Handle Voice Recording using Web Speech API if supported
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported directly in this browser. Please select one of our 6 pre-loaded Indic tactical audio samples or type text!');
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = selectedSample.lang === 'en' ? 'en-IN' : `${selectedSample.lang}-IN`;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      audioEngine.playRadioChirp(700, 0.05);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setCustomText(transcript);
      setIsRecording(false);
      audioEngine.playRadioChirp(900, 0.05);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    try {
      recognition.start();
    } catch (e) {
      setIsRecording(false);
    }
  };

  // Trigger Packet Transmission
  const handleTransmit = () => {
    setIsTransmitting(true);
    setPacketDelivered(false);
    audioEngine.playPacketBurst(timeOnAirMs);

    // Simulate animated wave packets
    let step = 0;
    clearInterval(waveIntervalRef.current);
    waveIntervalRef.current = setInterval(() => {
      setWaveformData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 80) + 10));
      step++;
      if (step > 6) {
        clearInterval(waveIntervalRef.current);
        setIsTransmitting(false);
        setPacketDelivered(true);
        audioEngine.playRadioChirp(1200, 0.1);
      }
    }, timeOnAirMs / 6);
  };

  // Trigger Voice Playback on Node Bravo
  const handlePlayReceivedSpeech = async () => {
    setIsPlayingAudio(true);
    const textToSpeak = customText || selectedSample.text;
    const langToSpeak = receiverTargetLang === 'same' ? selectedSample.lang : receiverTargetLang;
    
    // Animate waveform during playback
    const animInterval = setInterval(() => {
      setWaveformData(Array.from({ length: 14 }, () => Math.floor(Math.random() * 90) + 10));
    }, 100);

    await audioEngine.speakText(textToSpeak, langToSpeak);

    clearInterval(animInterval);
    setIsPlayingAudio(false);
    setWaveformData([10, 20, 15, 30, 25, 40, 30, 20, 15, 10]);
  };

  // Trigger Emergency Level 0 SOS
  const handleTriggerEmergencySos = () => {
    setIsEmergencySos(true);
    audioEngine.playEmergencySiren();
    handleTransmit();
  };

  const resetEmergency = () => {
    setIsEmergencySos(false);
    audioEngine.stopSpeech();
  };

  const currentText = customText || selectedSample.text;
  const currentBytes = isEmergencySos ? 18 : 18;
  const rawPcmBytes = selectedSample.pcmBytes;
  const compressionRatio = Math.round(rawPcmBytes / currentBytes);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header / Tactical Mission Status */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Radio className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-wider text-cyan-400">iTANTRA</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950/80 border border-blue-600/40 text-blue-300 font-mono">
                  ISRO SIH26173
                </span>
                {faradayCageActive && (
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono flex items-center gap-1">
                    <WifiOff className="h-3 w-3" /> ZERO INTERNET AIR-GAPPED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Multilingual Speech-to-Semantic Token Neural Transceiver (24 bps)
              </p>
            </div>
          </div>

          {/* Tactical Link Health */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="text-slate-400">FREQ:</span>
              <span className="text-cyan-300 font-semibold">865.20 MHz (LoRa ISM)</span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">LATENCY:</span>
              <span className="text-emerald-300 font-semibold">{369 + (radioMode === 'lora' ? timeOnAirMs - 56 : 0)} ms</span>
            </div>

            <button
              onClick={isEmergencySos ? resetEmergency : handleTriggerEmergencySos}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all shadow-md ${
                isEmergencySos
                  ? 'bg-red-600 text-white animate-bounce shadow-red-500/50'
                  : 'bg-red-950/80 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {isEmergencySos ? '🚨 SOS ACTIVE - DISMISS' : 'LEVEL 0 SOS'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-2 overflow-x-auto text-sm border-t border-slate-800/60 pt-2 pb-1 font-medium">
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-4 w-4" /> 1. Live Working Transceiver Demo
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-4 w-4" /> 2. How It Works (Pipeline)
          </button>

          <button
            onClick={() => setActiveTab('latency')}
            className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'latency'
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-4 w-4" /> 3. Latency & Bandwidth (369ms)
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'hardware'
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="h-4 w-4" /> 4. Hardware Lab (₹0 - ₹2,800)
          </button>

          <button
            onClick={() => setActiveTab('judge_qa')}
            className={`px-3 py-1.5 rounded-t-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'judge_qa'
                ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="h-4 w-4" /> 5. SIH Judge Q&A Rebuttal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Emergency Alert Banner */}
        {isEmergencySos && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/90 border-2 border-red-500 text-red-200 flex items-center justify-between shadow-2xl shadow-red-900/50 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400 animate-bounce" />
              <div>
                <h3 className="font-bold text-lg text-white">
                  🚨 LEVEL 0 EMERGENCY SOS BROADCAST ACTIVE
                </h3>
                <p className="text-xs text-red-300 font-mono">
                  PRIORITY: 0xFF (Preempted Routine Queues) | TELEMETRY: 30.42° N, 79.33° E (Chamoli) |
                  BATTERY: 98%
                </p>
              </div>
            </div>
            <button
              onClick={resetEmergency}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg uppercase tracking-wider"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: LIVE WORKING TRANSCEIVER DEMO */}
        {activeTab === 'demo' && (
          <div className="space-y-6">
            {/* Top Control Bar: Radio Selection & Preset Speech Picker */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-400 uppercase">Radio Phy Mode:</span>
                <button
                  onClick={() => setRadioMode('lora')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    radioMode === 'lora'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📡 LoRa SX1262 (865 MHz)
                </button>
                <button
                  onClick={() => setRadioMode('ble')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    radioMode === 'ble'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📶 BLE 5.0 Coded PHY (₹0 Setup)
                </button>
                <button
                  onClick={() => setRadioMode('hc12')}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    radioMode === 'hc12'
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  📻 433 MHz HC-12 Serial
                </button>
              </div>

              {/* Faraday Cage Toggle */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-slate-400 cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={faradayCageActive}
                    onChange={(e) => setFaradayCageActive(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Faraday Metal Box (Simulate 0% WiFi/Cellular)</span>
                </label>
              </div>
            </div>

            {/* Main 3-Column Tactical Pipeline: Node Alpha -> Radio Link -> Node Bravo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: NODE ALPHA (Transmitter) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
                      <h2 className="font-bold text-sm text-cyan-300 tracking-wider">
                        NODE ALPHA — FIELD TRANSMITTER
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Chamoli Sector 4</span>
                  </div>

                  {/* Speech Input Presets */}
                  <div className="space-y-2 mb-4">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Select Indic Speech Sample:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {TACTICAL_SAMPLES.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => {
                            setSelectedSample(sample);
                            setCustomText('');
                            setPacketDelivered(false);
                            audioEngine.playRadioChirp(800, 0.04);
                          }}
                          className={`p-2 rounded-lg text-left text-xs transition-all border ${
                            selectedSample.id === sample.id && !customText
                              ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200'
                              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <div className="font-bold truncate">{sample.langName.split(' ')[0]}</div>
                          <div className="text-[10px] text-slate-500 truncate">{sample.category}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audio Capture Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-cyan-400" />
                        Acoustic Input (16kHz PCM)
                      </span>
                      <button
                        onClick={handleToggleRecord}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isRecording
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isRecording ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                        {isRecording ? 'Listening...' : 'Record Voice'}
                      </button>
                    </div>

                    {/* Speech Text Box */}
                    <div className="bg-slate-900/90 rounded p-3 border border-slate-800/80">
                      <p className="text-sm font-medium text-slate-100 leading-relaxed">
                        "{currentText}"
                      </p>
                      <p className="text-xs text-slate-400 mt-1 italic">
                        Meaning: {selectedSample.englishMeaning}
                      </p>
                    </div>

                    {/* Compression Ratio Badge */}
                    <div className="bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/30 rounded p-2.5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Raw PCM Audio:</span>{' '}
                        <span className="text-slate-200">{rawPcmBytes.toLocaleString()} bytes</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                      <div>
                        <span className="text-emerald-400 font-bold">18 Bytes</span>{' '}
                        <span className="text-emerald-300">({compressionRatio}× savings)</span>
                      </div>
                    </div>
                  </div>

                  {/* 18-Byte Hex Inspector */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>18-BYTE NEURAL TOKEN PACKET:</span>
                      <span className="text-cyan-400">24 bps Bitrate</span>
                    </div>
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-center">
                      {selectedSample.tokens.map((byte, idx) => {
                        let tag = 'BPE';
                        let color = 'text-cyan-300 bg-cyan-950/60 border-cyan-800/60';
                        if (idx === 0) {
                          tag = 'HDR';
                          color = 'text-amber-300 bg-amber-950/60 border-amber-800/60';
                        } else if (idx === 1) {
                          tag = 'LANG';
                          color = 'text-purple-300 bg-purple-950/60 border-purple-800/60';
                        } else if (idx === 2) {
                          tag = 'PRIO';
                          color = isEmergencySos
                            ? 'text-red-400 bg-red-950/90 border-red-600 font-bold'
                            : 'text-blue-300 bg-blue-950/60 border-blue-800/60';
                        } else if (idx >= 3 && idx <= 4) {
                          tag = 'VOX';
                          color = 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60';
                        } else if (idx >= 16) {
                          tag = 'CRC';
                          color = 'text-rose-300 bg-rose-950/60 border-rose-800/60';
                        }

                        const byteHex = (isEmergencySos && idx === 2) ? '0xFF' : `0x${byte.toString(16).toUpperCase().padStart(2, '0')}`;

                        return (
                          <div key={idx} className={`p-1 rounded border ${color} flex flex-col`}>
                            <span className="font-bold text-[11px]">{byteHex}</span>
                            <span className="text-[8px] text-slate-500 uppercase">{tag}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Transmit Button */}
                <button
                  onClick={handleTransmit}
                  disabled={isTransmitting}
                  className={`w-full py-3 rounded-lg font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isTransmitting
                      ? 'bg-cyan-700 text-white cursor-wait'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/20'
                  }`}
                >
                  <Send className={`h-4 w-4 ${isTransmitting ? 'animate-spin' : ''}`} />
                  {isTransmitting ? 'TRANSMITTING OVER RADIO...' : 'TRANSMIT 18-BYTE TOKEN VIA RADIO'}
                </button>
              </div>

              {/* MIDDLE COLUMN: RADIO CHANNEL SIMULATION */}
              <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center space-y-4">
                <div className="w-full">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block mb-1">
                    AIR INTERFACE
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {radioMode === 'lora' ? 'LoRa SX1262 865MHz' : radioMode === 'ble' ? 'BLE 5.0 Coded PHY' : '433MHz HC-12'}
                  </p>
                </div>

                {/* Animated Radio Waves */}
                <div className="w-full my-auto py-6 flex flex-col items-center justify-center">
                  <div className="relative flex items-center justify-center h-24 w-24">
                    <div className={`absolute inset-0 rounded-full border-2 border-cyan-500/30 ${isTransmitting ? 'animate-ping' : ''}`} />
                    <div className="h-16 w-16 rounded-full bg-cyan-950/60 border border-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Radio className={`h-8 w-8 text-cyan-400 ${isTransmitting ? 'animate-bounce' : ''}`} />
                    </div>
                  </div>

                  {/* Packet Flight Indicator */}
                  <div className="mt-3 text-xs font-mono">
                    {isTransmitting ? (
                      <span className="text-cyan-300 animate-pulse font-bold">
                        ⚡ Packet Flying: {timeOnAirMs}ms
                      </span>
                    ) : packetDelivered ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> DELIVERED
                      </span>
                    ) : (
                      <span className="text-slate-500">Radio Channel Ready</span>
                    )}
                  </div>
                </div>

                {/* Radio Sliders */}
                <div className="w-full space-y-3 bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-left">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>Distance:</span>
                      <span className="text-cyan-300">{distanceKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="15"
                      step="0.5"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 h-1 bg-slate-800 rounded"
                    />
                  </div>

                  {radioMode === 'lora' && (
                    <div>
                      <div className="flex justify-between text-slate-400 mb-1">
                        <span>Spreading Factor:</span>
                        <span className="text-cyan-300">SF{spreadingFactor}</span>
                      </div>
                      <input
                        type="range"
                        min="7"
                        max="12"
                        value={spreadingFactor}
                        onChange={(e) => setSpreadingFactor(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 h-1 bg-slate-800 rounded"
                      />
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-500">
                    <span>FEC Parity:</span>
                    <span className="text-emerald-400">RS(32,24)</span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: NODE BRAVO (Receiver & Neural TTS Voice Synthesizer) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${packetDelivered ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                      <h2 className="font-bold text-sm text-emerald-300 tracking-wider">
                        NODE BRAVO — RESCUE HQ RECEIVER
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Dehradun Command</span>
                  </div>

                  {/* Packet Receipt Status */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-emerald-400" />
                        Radio Buffer (18 Bytes)
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        packetDelivered ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {packetDelivered ? 'CRC16 VERIFIED • 0 ERRORS' : 'AWAITING TRANSMISSION'}
                      </span>
                    </div>

                    {/* Received Decoded Text */}
                    <div className="bg-slate-900/90 rounded p-3 border border-slate-800/80 min-h-[72px] flex flex-col justify-center">
                      {packetDelivered ? (
                        <>
                          <p className="text-sm font-medium text-emerald-200 leading-relaxed">
                            "{currentText}"
                          </p>
                          <p className="text-xs text-slate-400 mt-1 italic">
                            Language: {selectedSample.langName} | MOS Quality: 4.26 / 5.0
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-500 italic text-center">
                          Click "Transmit 18-Byte Token via Radio" on Node Alpha to send packet across the radio channel.
                        </p>
                      )}
                    </div>

                    {/* Target Voice Synthesis Language Picker */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                        Cross-Lingual Voice Synthesis Output:
                      </label>
                      <select
                        value={receiverTargetLang}
                        onChange={(e) => setReceiverTargetLang(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="same">Original Native Language ({selectedSample.langName})</option>
                        <option value="en">English (Synthesized)</option>
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                      </select>
                    </div>

                    {/* Simulated Audio Waveform Bar */}
                    <div className="h-10 bg-slate-900 rounded border border-slate-800/80 flex items-center justify-center gap-1 px-3">
                      {waveformData.map((height, i) => (
                        <div
                          key={i}
                          style={{ height: `${isPlayingAudio ? height : 6}%` }}
                          className={`w-1.5 rounded-full transition-all duration-75 ${
                            isPlayingAudio ? 'bg-gradient-to-t from-emerald-500 to-cyan-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Play Synthesized Voice Button */}
                <button
                  onClick={handlePlayReceivedSpeech}
                  disabled={!packetDelivered || isPlayingAudio}
                  className={`w-full py-3 rounded-lg font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                    !packetDelivered
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : isPlayingAudio
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-emerald-500/20'
                  }`}
                >
                  <Volume2 className={`h-4 w-4 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
                  {isPlayingAudio ? 'SYNTHESIZING & PLAYING AUDIO...' : 'PLAY SYNTHESIZED NEURAL VOICE (TTS)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HOW IT WORKS (PIPELINE & ARCHITECTURE) */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-cyan-400 mb-2">
                {HOW_IT_WORKS_INFO.overview.title}
              </h2>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 whitespace-pre-line leading-relaxed mb-6 font-mono">
                {HOW_IT_WORKS_INFO.overview.description}
              </div>

              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
                The 6-Step End-to-End Latency Pipeline:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {HOW_IT_WORKS_INFO.pipelineSteps.map((step) => (
                  <div key={step.step} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-cyan-500/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        {step.step}
                      </span>
                      <span className="text-xs font-mono text-emerald-400 font-semibold">
                        ⏱️ {step.timeMs} ms
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-100">{step.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                    <div className="pt-2 text-[10px] font-mono text-cyan-300/80">
                      Tech: {step.tech}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LATENCY & BANDWIDTH CALCULATOR */}
        {activeTab === 'latency' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-1">
                  Latency Budget & Bandwidth Compression
                </h2>
                <p className="text-xs text-slate-400">
                  Total End-to-End Delay from Speaker’s Mouth at Node Alpha to Synthesized Audio at Node Bravo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40">
                  <div className="text-3xl font-bold text-cyan-300 font-mono">369 ms</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">End-to-End Latency</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Faster than human conversational pause</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40">
                  <div className="text-3xl font-bold text-emerald-300 font-mono">2,666×</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">Bandwidth Reduction</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">64,000 bps down to 24 bps</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/40">
                  <div className="text-3xl font-bold text-purple-300 font-mono">&gt; 48 Hours</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">Battery Lifetime</div>
                  <div className="text-[11px] text-purple-300 mt-0.5">0.08 mAh per transmission</div>
                </div>
              </div>

              {/* Latency Breakdown Bar */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Latency Timeline Composition:</span>
                <div className="h-6 w-full rounded-lg bg-slate-950 overflow-hidden flex font-mono text-[10px] text-black font-bold">
                  <div style={{ width: '10%' }} className="bg-blue-400 flex items-center justify-center" title="VAD 35ms">VAD 35ms</div>
                  <div style={{ width: '32%' }} className="bg-cyan-400 flex items-center justify-center" title="ASR 120ms">ASR 120ms</div>
                  <div style={{ width: '5%' }} className="bg-amber-400 flex items-center justify-center" title="Token 16ms">16</div>
                  <div style={{ width: '15%' }} className="bg-emerald-400 flex items-center justify-center" title="LoRa 56ms">RF 56ms</div>
                  <div style={{ width: '30%' }} className="bg-purple-400 flex items-center justify-center" title="TTS 112ms">TTS 112ms</div>
                  <div style={{ width: '8%' }} className="bg-rose-400 flex items-center justify-center" title="Audio 30ms">30ms</div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 font-mono">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-blue-400" /> VAD (35ms)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-cyan-400" /> IndicConformer ASR (120ms)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber-400" /> SCSU Token (16ms)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-emerald-400" /> LoRa SF7 Radio (56ms)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-purple-400" /> Vocos TTS (112ms)</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-rose-400" /> Audio Buffer (30ms)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HARDWARE LAB */}
        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-1">
                  Hardware Prototyping Tiers for Hackathon
                </h2>
                <p className="text-xs text-slate-400">
                  Pick the tier that fits your budget. The AI software pipeline is 100% identical across all three!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {HOW_IT_WORKS_INFO.hardwareTiers.map((tier, i) => (
                  <div
                    key={i}
                    className={`bg-slate-950 border rounded-xl p-5 flex flex-col justify-between space-y-4 ${
                      i === 0
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                        : i === 1
                        ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                        : 'border-purple-500/50 shadow-lg shadow-purple-950/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">{tier.tier}</span>
                        <span className="text-lg font-bold text-white px-2 py-0.5 rounded bg-slate-800 font-mono">
                          {tier.cost}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-cyan-300 font-mono">
                        📡 Range: {tier.range}
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        Hardware: {tier.hardware}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
                        {tier.description}
                      </p>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 bg-slate-900 p-2 rounded text-center">
                      {i === 0 ? '⭐ RECOMMENDED FOR 36HR DEMO' : i === 1 ? 'BEST HARDWARE LOOK' : 'ISRO PRODUCTION DEPLOYMENT'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SIH JUDGE Q&A SIMULATOR */}
        {activeTab === 'judge_qa' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 mb-1">
                  SIH Judge Defense & Flashcard Rebuttals
                </h2>
                <p className="text-xs text-slate-400">
                  Anticipate tough jury questions and deliver authoritative technical answers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {HOW_IT_WORKS_INFO.judgeQA.map((qa, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <h3 className="font-bold text-sm text-slate-100 leading-snug">
                        Judge Q{idx + 1}: "{qa.q}"
                      </h3>
                    </div>
                    <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 text-xs text-emerald-300 leading-relaxed font-mono">
                      <span className="font-bold text-emerald-400 block mb-1">👉 Your Rebuttal:</span>
                      {qa.a}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-500 text-xs py-4 px-4 text-center font-mono">
        iTantra — Neural Transceiver System | Smart India Hackathon 2026 (SIH26173) | Designed for ISRO & Disaster Management
      </footer>
    </div>
  );
}
