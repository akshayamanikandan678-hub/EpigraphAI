import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders,
  Maximize2,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  FileCode,
  Download,
  Share2,
  Compass,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
  ChevronRight,
  ZoomIn,
  Play,
  Square,
  Bookmark
} from 'lucide-react';
import { InscriptionRecord, CharacterSegment } from '../data/inscriptions';
import {
  CvFilterSettings,
  DEFAULT_CV_SETTINGS,
  runCvPipeline,
  ProcessedCvResult,
} from '../utils/imageCvPipeline';
import { epigraphSpeech, SpeechState } from '../utils/audioSpeech';
import {
  exportToEpiDocXml,
  exportToGeoJson,
  exportToMarkdown,
  downloadFile,
} from '../utils/exportFormats';

interface PipelineViewerProps {
  currentRecord: InscriptionRecord;
  rawImageCanvas: HTMLCanvasElement | null;
  onUpdateRecord?: (updated: InscriptionRecord) => void;
  isProcessing: boolean;
  onRunAiAnalysis?: () => void;
  isOfflineMode: boolean;
}

export const PipelineViewer: React.FC<PipelineViewerProps> = ({
  currentRecord,
  rawImageCanvas,
  onUpdateRecord,
  isProcessing,
  onRunAiAnalysis,
  isOfflineMode,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [cvSettings, setCvSettings] = useState<CvFilterSettings>(DEFAULT_CV_SETTINGS);
  const [cvResult, setCvResult] = useState<ProcessedCvResult | null>(null);
  const [isCvRunning, setIsCvRunning] = useState(false);
  const [showRockCracks, setShowRockCracks] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<CharacterSegment | null>(
    currentRecord.segments[0] || null
  );
  const [viewMode, setViewMode] = useState<'split' | 'processed' | 'original'>('split');
  const [speechState, setSpeechState] = useState<SpeechState>({
    isPlaying: false,
    activeLanguage: null,
    speed: 0.9,
  });

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to speech synthesis
  useEffect(() => {
    epigraphSpeech.subscribe((s) => setSpeechState(s));
    return () => epigraphSpeech.stop();
  }, []);

  // Update selected segment when record changes
  useEffect(() => {
    if (currentRecord.segments.length > 0) {
      setSelectedSegment(currentRecord.segments[0]);
    }
  }, [currentRecord]);

  // Execute CV pipeline when image or settings change
  useEffect(() => {
    if (!rawImageCanvas) return;
    let isCancelled = false;

    const run = async () => {
      setIsCvRunning(true);
      try {
        const res = await runCvPipeline(rawImageCanvas, cvSettings);
        if (!isCancelled) {
          setCvResult(res);
        }
      } catch (err) {
        console.error('CV pipeline error:', err);
      } finally {
        if (!isCancelled) setIsCvRunning(false);
      }
    };

    const timer = setTimeout(run, 120);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [rawImageCanvas, cvSettings]);

  // Draw overlay with bounding boxes on preview canvas
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !rawImageCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = rawImageCanvas.width;
    canvas.height = rawImageCanvas.height;

    // Draw base image according to viewMode
    if (viewMode === 'original' || !cvResult) {
      ctx.drawImage(rawImageCanvas, 0, 0);
    } else if (viewMode === 'processed') {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        drawBoundingBoxes(ctx, canvas.width, canvas.height);
      };
      img.src = cvResult.processedDataUrl;
      return;
    } else {
      // Split view: Left half processed CLAHE, Right half raw stone
      const splitX = Math.round(canvas.width * 0.5);
      ctx.drawImage(rawImageCanvas, splitX, 0, canvas.width - splitX, canvas.height, splitX, 0, canvas.width - splitX, canvas.height);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, splitX, canvas.height, 0, 0, splitX, canvas.height);
        // Draw split divider line
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label badges on canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 140, 24);
        ctx.fillStyle = '#fbbf24';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText('CLAHE + DENOISE', 18, 26);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width - 150, 10, 140, 24);
        ctx.fillStyle = '#a8a29e';
        ctx.fillText('RAW STONE PHOTO', canvas.width - 142, 26);

        drawBoundingBoxes(ctx, canvas.width, canvas.height);
      };
      img.src = cvResult.processedDataUrl;
      return;
    }

    drawBoundingBoxes(ctx, canvas.width, canvas.height);
  }, [cvResult, viewMode, activeStep, currentRecord, selectedSegment, showRockCracks]);

  const drawBoundingBoxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Only draw bounding boxes in Step 2 (Segmentation) and Step 3 (Recognition)
    if (activeStep !== 2 && activeStep !== 3) return;

    currentRecord.segments.forEach((seg) => {
      if (!seg.isCarvedGlyph && !showRockCracks) return;

      const [ymin, xmin, ymax, xmax] = seg.box_2d;
      const bx = (xmin / 1000) * width;
      const by = (ymin / 1000) * height;
      const bw = ((xmax - xmin) / 1000) * width;
      const bh = ((ymax - ymin) / 1000) * height;

      const isSelected = selectedSegment?.id === seg.id;

      if (!seg.isCarvedGlyph) {
        // Rock crack / noise (Red dashed)
        ctx.strokeStyle = isSelected ? '#ef4444' : 'rgba(239, 68, 68, 0.65)';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);

        // Tag label
        ctx.fillStyle = 'rgba(185, 28, 28, 0.85)';
        ctx.fillRect(bx, by - 16, Math.max(bw, 70), 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText('ROCK CRACK', bx + 4, by - 4);
      } else {
        // Carved Character (Green/Amber solid)
        const isHighConf = seg.confidence >= 90;
        ctx.strokeStyle = isSelected
          ? '#38bdf8'
          : isHighConf
          ? 'rgba(34, 197, 94, 0.85)'
          : 'rgba(245, 158, 11, 0.85)';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(bx, by, bw, bh);

        // Fill subtle highlight if selected
        if (isSelected) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fillRect(bx, by, bw, bh);
        }

        // Tag label on top
        const labelBg = isSelected
          ? '#0284c7'
          : isHighConf
          ? '#15803d'
          : '#b45309';
        ctx.fillStyle = labelBg;
        ctx.fillRect(bx, by - 18, Math.max(bw, 60), 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(`${seg.transcribedChar} ${seg.confidence}%`, bx + 4, by - 5);
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 1000;
    const clickY = ((e.clientY - rect.top) / rect.height) * 1000;

    // Find clicked segment
    const found = currentRecord.segments.find((seg) => {
      const [ymin, xmin, ymax, xmax] = seg.box_2d;
      return clickX >= xmin && clickX <= xmax && clickY >= ymin && clickY <= ymax;
    });

    if (found) {
      setSelectedSegment(found);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inscription Header & Quick Metadata */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                {currentRecord.scriptType}
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-300">
                {currentRecord.dynasty}
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs font-medium text-stone-300">
                {currentRecord.period}
              </span>
              <span className="rounded-md bg-emerald-950/70 border border-emerald-800 px-2.5 py-0.5 text-xs font-mono-code font-bold text-emerald-400">
                OCR Conf: {currentRecord.confidenceScore}%
              </span>
            </div>
            <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
              {currentRecord.title}
            </h1>
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-amber-500" />
              {currentRecord.siteName} &bull; {currentRecord.location} &bull; Substrate: {currentRecord.substrate}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onRunAiAnalysis && (
              <button
                onClick={onRunAiAnalysis}
                disabled={isProcessing}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold px-4 py-2 text-xs shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-stone-950" />
                    <span>Processing Vision Model...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-stone-950" />
                    <span>Full Gemini Epigraphy Analysis</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5-Step Pipeline Navigation Bar (Matching Prompt Document) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-stone-800 pb-3">
        {[
          { step: 1, title: 'Step 1: Preprocessing', sub: 'CLAHE, Denoise, Tilt' },
          { step: 2, title: 'Step 2: Segmentation', sub: 'Contour vs Crack CNN' },
          { step: 3, title: 'Step 3: Recognition', sub: 'YOLO + CRNN / ViT' },
          { step: 4, title: 'Step 4: Transliteration', sub: 'IndicBERT + Translation' },
          { step: 5, title: 'Step 5: Output & Archive', sub: 'TEI XML & Field Report' },
        ].map((item) => (
          <button
            key={item.step}
            onClick={() => setActiveStep(item.step as any)}
            className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
              activeStep === item.step
                ? 'border-amber-500/80 bg-amber-950/40 shadow-md shadow-amber-950/20'
                : 'border-stone-800 bg-stone-900/40 hover:bg-stone-800/40 text-stone-400'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  activeStep === item.step
                    ? 'bg-amber-500 text-stone-950 font-mono-code'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {item.step}
              </span>
              <span
                className={`text-xs font-semibold ${
                  activeStep === item.step ? 'text-amber-200' : 'text-stone-300'
                }`}
              >
                {item.title}
              </span>
            </div>
            <span className="text-[11px] text-stone-400 mt-1 pl-6 truncate w-full">
              {item.sub}
            </span>
          </button>
        ))}
      </div>

      {/* Main Canvas & Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Visualizer Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-2xl">
            {/* View Mode Controls Bar */}
            <div className="flex items-center justify-between border-b border-stone-800 bg-stone-900/90 px-4 py-2.5 text-xs text-stone-300">
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-[11px] text-amber-400 font-semibold">
                  INTERACTIVE STAGE VISUALIZER
                </span>
                {isCvRunning && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-300 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Filtering...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Crack Toggle in Step 2 */}
                {activeStep === 2 && (
                  <button
                    onClick={() => setShowRockCracks(!showRockCracks)}
                    className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium border ${
                      showRockCracks
                        ? 'border-red-900/80 bg-red-950/40 text-red-300'
                        : 'border-stone-700 bg-stone-800 text-stone-400'
                    }`}
                  >
                    {showRockCracks ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    <span>Rock Cracks</span>
                  </button>
                )}

                {/* Split / Processed / Original Buttons */}
                <div className="flex rounded-lg bg-stone-800 p-0.5 border border-stone-700 text-[11px]">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded ${
                      viewMode === 'split' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
                    }`}
                  >
                    Split CLAHE
                  </button>
                  <button
                    onClick={() => setViewMode('processed')}
                    className={`px-2.5 py-1 rounded ${
                      viewMode === 'processed' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
                    }`}
                  >
                    Enhanced
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-2.5 py-1 rounded ${
                      viewMode === 'original' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
                    }`}
                  >
                    Original
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="relative flex items-center justify-center p-2 bg-[#121110]">
              <canvas
                ref={previewCanvasRef}
                onClick={handleCanvasClick}
                className="max-h-[500px] w-auto max-w-full rounded-lg cursor-crosshair object-contain shadow-inner"
              />
            </div>

            {/* Bottom Status bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-stone-800 bg-stone-900/80 px-4 py-2 text-[11px] text-stone-400 font-mono-code">
              <div>
                <span>Resolution: {rawImageCanvas?.width || 800}x{rawImageCanvas?.height || 500}px</span>
                {cvResult && <span className="ml-3 text-amber-300">CV Latency: {cvResult.processingTimeMs}ms</span>}
              </div>
              <div>
                <span>Carved Glyphs: {currentRecord.segments.filter(s => s.isCarvedGlyph).length}</span>
                <span className="ml-3 text-red-400">Filtered Cracks: {currentRecord.segments.filter(s => !s.isCarvedGlyph).length}</span>
              </div>
            </div>
          </div>

          {/* Histogram Visualizer below canvas in Step 1 */}
          {activeStep === 1 && cvResult && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono-code text-stone-300 flex items-center gap-2">
                  <Sliders className="h-3.5 w-3.5 text-amber-500" />
                  Luminance Histogram (Before vs After CLAHE Adaptive Equalization)
                </span>
                <span className="text-[11px] text-stone-500">256 Grayscale Bins</span>
              </div>
              <div className="h-16 w-full flex items-end gap-[1px] bg-stone-950 rounded p-1 border border-stone-800 overflow-hidden">
                {cvResult.histogram.enhanced.map((val, idx) => {
                  if (idx % 2 !== 0) return null; // sample every 2 bins
                  const maxVal = Math.max(...cvResult.histogram.enhanced);
                  const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                  return (
                    <div
                      key={idx}
                      style={{ height: `${Math.max(2, heightPct)}%` }}
                      className="flex-1 bg-amber-500/70 hover:bg-amber-400 transition-all"
                      title={`Luminance ${idx}: ${val} pixels`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-stone-500 mt-1 font-mono-code">
                <span>0 (Deep Inscribed Shadow)</span>
                <span>128 (Mid-tone Stone Face)</span>
                <span>255 (Sunlit Chisel Ridge)</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Step-Specific Interactive Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* STEP 1: PREPROCESSING CONTROLS */}
          {activeStep === 1 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  OpenCV Preprocessing Engine
                </h3>
                <button
                  onClick={() => setCvSettings(DEFAULT_CV_SETTINGS)}
                  className="text-[11px] text-stone-400 hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* CLAHE Clip Limit */}
              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>CLAHE Contrast Limit</span>
                  <span className="font-mono-code text-amber-400">{cvSettings.claheClipLimit.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.2"
                  value={cvSettings.claheClipLimit}
                  onChange={(e) =>
                    setCvSettings({ ...cvSettings, claheClipLimit: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Prevents noise amplification while bringing out shallow stone incisions.
                </p>
              </div>

              {/* CLAHE Grid Size */}
              <div>
                <div className="flex justify-between text-xs text-stone-300 mb-1">
                  <span>Adaptive Tile Grid</span>
                  <span className="font-mono-code text-amber-400">{cvSettings.claheGridSize} x {cvSettings.claheGridSize}</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="16"
                  step="2"
                  value={cvSettings.claheGridSize}
                  onChange={(e) =>
                    setCvSettings({ ...cvSettings, claheGridSize: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Denoise & Shadow Removal Toggles */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                  <span>Bilateral Denoising (Rock Grain)</span>
                  <input
                    type="checkbox"
                    checked={cvSettings.enableDenoise}
                    onChange={(e) =>
                      setCvSettings({ ...cvSettings, enableDenoise: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                  <span>Shadow & Uneven Torch Lighting Removal</span>
                  <input
                    type="checkbox"
                    checked={cvSettings.enableShadowRemoval}
                    onChange={(e) =>
                      setCvSettings({ ...cvSettings, enableShadowRemoval: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer">
                  <span>Sobel Chisel Ridge Edge Boost</span>
                  <input
                    type="checkbox"
                    checked={cvSettings.enableEdgeEnhancement}
                    onChange={(e) =>
                      setCvSettings({ ...cvSettings, enableEdgeEnhancement: e.target.checked })
                    }
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                </label>
              </div>

              {/* Perspective Correction Sliders */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <div className="flex justify-between text-xs text-stone-300">
                  <span>Perspective Keystoning (Temple Wall Angle)</span>
                  <span className="font-mono-code text-amber-400">{cvSettings.perspectiveTiltX}°</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  step="1"
                  value={cvSettings.perspectiveTiltX}
                  onChange={(e) =>
                    setCvSettings({ ...cvSettings, perspectiveTiltX: parseInt(e.target.value) })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Binarization Mode */}
              <div className="pt-2 border-t border-stone-800">
                <span className="text-xs text-stone-300 block mb-2">Display Filter Mode</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['none', 'adaptive-otsu', 'chisel-edges'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setCvSettings({ ...cvSettings, binarizationMode: mode })}
                      className={`px-2 py-1 text-[11px] rounded border text-center capitalize ${
                        cvSettings.binarizationMode === mode
                          ? 'border-amber-500 bg-amber-950/60 text-amber-200'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      {mode.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CHARACTER SEGMENTATION & CRACK CLASSIFICATION */}
          {activeStep === 2 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="border-b border-stone-800 pb-3">
                <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Contour Segmentation & CNN Classifier
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  Ancient scripts lack word spaces. The CNN binary classifier separates carved glyphs from rock cracks and mineral inclusions.
                </p>
              </div>

              {/* Selected Glyph Inspector Card */}
              {selectedSegment ? (
                <div className="rounded-xl border border-stone-700 bg-stone-950/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-code text-stone-400">INSPECTED GLYPH</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        selectedSegment.isCarvedGlyph
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {selectedSegment.isCarvedGlyph ? 'CARVED GLYPH' : 'ROCK FISSURE (REJECTED)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-stone-900 border border-stone-800 text-2xl font-tamil text-amber-400 font-bold">
                      {selectedSegment.isCarvedGlyph ? selectedSegment.transcribedChar : '✗'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-200">
                        {selectedSegment.ancientGlyphName}
                      </div>
                      <div className="text-xs text-stone-400 font-mono-code">
                        Confidence: <span className="text-amber-400 font-bold">{selectedSegment.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {selectedSegment.palaeographicNotes && (
                    <p className="text-[11px] text-stone-400 bg-stone-900 p-2 rounded border border-stone-800">
                      {selectedSegment.palaeographicNotes}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-stone-500 italic text-center py-4">
                  Click on any bounding box on the image to inspect
                </div>
              )}

              {/* Segment List */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                <span className="text-[11px] font-mono-code text-stone-400">DETECTED CONTOURS ({currentRecord.segments.length})</span>
                {currentRecord.segments.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => setSelectedSegment(seg)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedSegment?.id === seg.id
                        ? 'border-amber-500 bg-amber-950/40 text-white'
                        : 'border-stone-800/80 bg-stone-900/40 hover:bg-stone-800/40 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-tamil font-bold text-amber-400 text-sm">
                        {seg.isCarvedGlyph ? seg.transcribedChar : '—'}
                      </span>
                      <span className="text-[11px] truncate max-w-[130px]">{seg.ancientGlyphName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono-code font-bold ${
                        seg.isCarvedGlyph ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {seg.confidence}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SCRIPT RECOGNITION (OCR CORE) */}
          {activeStep === 3 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="border-b border-stone-800 pb-3">
                <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  YOLOv12 + CRNN Sequence Recognition
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  CRNN (CNN + BiLSTM + CTC) reads sequential ligatures without rigid spacing.
                </p>
              </div>

              {/* Script Type Classification Probabilities */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono-code text-stone-400">CLASSIFIER CERTAINTY</span>
                {[
                  { script: 'Tamil-Brahmi', conf: currentRecord.scriptType === 'Tamil-Brahmi' ? 96.4 : 3.2 },
                  { script: 'Vatteluttu', conf: currentRecord.scriptType === 'Vatteluttu' ? 98.1 : 4.5 },
                  { script: 'Pallava Grantha', conf: currentRecord.scriptType === 'Grantha' ? 95.8 : 2.1 },
                  { script: 'Chola Medieval Tamil', conf: currentRecord.scriptType === 'Chola Inscriptional Tamil' ? 97.2 : 5.0 },
                ].map((s) => (
                  <div key={s.script}>
                    <div className="flex justify-between text-xs text-stone-300 mb-1">
                      <span>{s.script}</span>
                      <span className="font-mono-code text-amber-400 font-bold">{s.conf}%</span>
                    </div>
                    <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                      <div
                        style={{ width: `${s.conf}%` }}
                        className={`h-full rounded-full ${
                          s.conf > 90 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-stone-700'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sequential Characters Flow */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <span className="text-[11px] font-mono-code text-stone-400">DECODED SEQUENCE (CTC GREEDY)</span>
                <div className="flex flex-wrap gap-1.5 p-2 bg-stone-950 rounded-xl border border-stone-800">
                  {currentRecord.segments.filter(s => s.isCarvedGlyph).map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSegment(s)}
                      className={`flex flex-col items-center p-1.5 rounded-lg border cursor-pointer ${
                        selectedSegment?.id === s.id
                          ? 'border-amber-400 bg-amber-950/60'
                          : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-base font-tamil font-bold text-amber-300">{s.transcribedChar}</span>
                      <span className="text-[9px] font-mono-code text-stone-400">{s.confidence}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TRANSLITERATION & TRANSLATION (INDICBERT) */}
          {activeStep === 4 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    IndicBERT Transliteration & NLP
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Character mapping to modern Tamil & English archaeological translation.
                  </p>
                </div>
              </div>

              {/* Audio Readout Accessibility */}
              <div className="rounded-xl border border-stone-700 bg-stone-950/80 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-950 border border-amber-800/80 flex items-center justify-center text-amber-400">
                    <Volume2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-200">Voice Accessibility</div>
                    <div className="text-[10px] text-stone-400">Tamil & English Speech Output</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      speechState.isPlaying && speechState.activeLanguage === 'ta'
                        ? epigraphSpeech.stop()
                        : epigraphSpeech.speak(currentRecord.modernTamilText, 'ta')
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border flex items-center gap-1 ${
                      speechState.isPlaying && speechState.activeLanguage === 'ta'
                        ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                        : 'border-stone-700 bg-stone-900 text-stone-300 hover:text-white'
                    }`}
                  >
                    {speechState.isPlaying && speechState.activeLanguage === 'ta' ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>Tamil</span>
                  </button>

                  <button
                    onClick={() =>
                      speechState.isPlaying && speechState.activeLanguage === 'en'
                        ? epigraphSpeech.stop()
                        : epigraphSpeech.speak(currentRecord.englishTranslation, 'en')
                    }
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border flex items-center gap-1 ${
                      speechState.isPlaying && speechState.activeLanguage === 'en'
                        ? 'bg-amber-600 text-stone-950 border-amber-500 font-bold'
                        : 'border-stone-700 bg-stone-900 text-stone-300 hover:text-white'
                    }`}
                  >
                    {speechState.isPlaying && speechState.activeLanguage === 'en' ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    <span>English</span>
                  </button>
                </div>
              </div>

              {/* Modern Tamil Transliteration */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono-code text-stone-400">MODERN TAMIL TRANSLITERATION</span>
                <div className="rounded-xl border border-amber-900/40 bg-stone-950 p-3 text-base font-tamil font-semibold text-amber-200 leading-relaxed">
                  {currentRecord.modernTamilText}
                </div>
              </div>

              {/* English Translation */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono-code text-stone-400">ENGLISH ARCHAEOLOGICAL TRANSLATION</span>
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs text-stone-300 leading-relaxed italic">
                  "{currentRecord.englishTranslation}"
                </div>
              </div>

              {/* Palaeographical Highlights */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono-code text-stone-400">PALAEOGRAPHICAL FEATURES</span>
                <ul className="text-xs text-stone-400 space-y-1 list-disc list-inside">
                  {currentRecord.palaeographicFeatures.map((feat, i) => (
                    <li key={i} className="text-[11px]">{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* STEP 5: OUTPUT & FIELD ARCHIVAL RECORD */}
          {activeStep === 5 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="border-b border-stone-800 pb-3">
                <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Field Archival & GIS Metadata
                </h3>
                <p className="text-[11px] text-stone-400 mt-1">
                  Export standard archaeological EpiDoc XML, GeoJSON, and field survey report cards.
                </p>
              </div>

              {/* GPS & Site Details */}
              <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 text-xs space-y-1.5 font-mono-code">
                <div className="flex justify-between">
                  <span className="text-stone-500">GPS LAT / LNG:</span>
                  <span className="text-amber-400">{currentRecord.gps.lat}° N, {currentRecord.gps.lng}° E</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">ERA / CENTURY:</span>
                  <span className="text-stone-200">{currentRecord.approxDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">SUBSTRATE:</span>
                  <span className="text-stone-200 truncate max-w-[170px]">{currentRecord.substrate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">CONSERVATION:</span>
                  <span className="text-emerald-400 font-bold">{currentRecord.confidenceScore >= 95 ? 'Legible' : 'Weathered'}</span>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="space-y-2 pt-2 border-t border-stone-800">
                <button
                  onClick={() =>
                    downloadFile(
                      `${currentRecord.id}_epidoc.xml`,
                      exportToEpiDocXml(currentRecord),
                      'application/xml'
                    )
                  }
                  className="w-full flex items-center justify-between rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 text-xs font-medium border border-stone-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-amber-400" />
                    <span>Download EpiDoc TEI XML</span>
                  </span>
                  <Download className="h-3.5 w-3.5 text-stone-400" />
                </button>

                <button
                  onClick={() =>
                    downloadFile(
                      `${currentRecord.id}_gis.geojson`,
                      exportToGeoJson(currentRecord),
                      'application/json'
                    )
                  }
                  className="w-full flex items-center justify-between rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 text-xs font-medium border border-stone-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-emerald-400" />
                    <span>Download GeoJSON Layer</span>
                  </span>
                  <Download className="h-3.5 w-3.5 text-stone-400" />
                </button>

                <button
                  onClick={() =>
                    downloadFile(
                      `${currentRecord.id}_field_report.md`,
                      exportToMarkdown(currentRecord),
                      'text/markdown'
                    )
                  }
                  className="w-full flex items-center justify-between rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 px-3.5 py-2 text-xs font-medium border border-stone-700 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-amber-500" />
                    <span>Export ASI Field Report Card</span>
                  </span>
                  <Download className="h-3.5 w-3.5 text-stone-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
