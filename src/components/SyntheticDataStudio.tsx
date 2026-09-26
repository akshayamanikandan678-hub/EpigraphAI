import React, { useState, useRef, useEffect } from 'react';
import { Layers, Download, Sliders, Sparkles, RefreshCw, CheckCircle, FileText } from 'lucide-react';
import { renderStoneInscription, StoneRenderOptions } from '../utils/stoneRenderer';
import { downloadFile } from '../utils/exportFormats';

export const SyntheticDataStudio: React.FC = () => {
  const [substrate, setSubstrate] = useState<StoneRenderOptions['substrateType']>('charnockite-granite');
  const [erosion, setErosion] = useState<number>(45);
  const [rakingAngle, setRakingAngle] = useState<number>(55);
  const [fissureDensity, setFissureDensity] = useState<number>(4);
  const [lichen, setLichen] = useState<boolean>(true);
  const [scriptChoice, setScriptChoice] = useState<'Tamil-Brahmi' | 'Vatteluttu' | 'Grantha'>('Tamil-Brahmi');
  const [customText, setCustomText] = useState<string>('𑀓𑀡𑀺𑀬𑀦𑁆 𑀦𑀦𑁆𑀤𑀸𑀲𑀺𑀭𑀺𑀬𑀺𑀓𑁂');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick preset templates
  const presets = [
    { label: 'Mangulam Brahmi', text: '𑀓𑀡𑀺𑀬𑀦𑁆 𑀦𑀦𑁆𑀤𑀸𑀲𑀺𑀭𑀺𑀬𑀺𑀓𑁂', script: 'Tamil-Brahmi' as const, sub: 'charnockite-granite' as const },
    { label: 'Brihadisvara Vatteluttu', text: '𑀲𑁆𑀯𑀲𑁆𑀢𑀺 𑀰𑁆𑀭𑀻 𑀓𑁄 𑀭𑀸𑀚', script: 'Vatteluttu' as const, sub: 'pink-granite' as const },
    { label: 'Mahabalipuram Grantha', text: '𑌶𑍍𑌰𑍀𑌮𑌤𑍋 ऽ𑌤𑍍𑌯𑌨𑍍𑌤𑌕𑌾𑌮', script: 'Grantha' as const, sub: 'sandstone' as const },
    { label: 'Chendan Hero Stone', text: '𑀏𑀭𑀼𑀫𑀺𑀦𑀸𑀟𑀼 𑀓𑀼𑀫𑀼𑀵𑀹𑀭𑁆', script: 'Tamil-Brahmi' as const, sub: 'basalt' as const },
  ];

  // Render on change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Split text into characters
    const chars = Array.from(customText);
    const count = chars.length;
    const charItems = chars.map((ch, idx) => ({
      char: ch,
      label: ch,
      xRatio: (idx + 1) / (count + 1),
      yRatio: 0.5,
      size: Math.max(26, Math.min(48, Math.floor(650 / (count + 2)))),
    }));

    renderStoneInscription(canvas, {
      width: 750,
      height: 420,
      substrateType: substrate,
      erosionLevel: erosion,
      rakingLightAngle: rakingAngle,
      fissureDensity,
      lichenPatches: lichen,
      ancientCharacters: charItems,
    });
  }, [substrate, erosion, rakingAngle, fissureDensity, lichen, customText]);

  // Export YOLO Annotations (.txt) and Ground Truth (.json)
  const handleDownloadDatasetPair = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chars = Array.from(customText);
    const count = chars.length;

    // 1. Download Synthetic Stone Image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = imgData;
    a.download = `synthetic_${scriptChoice.toLowerCase()}_sample.jpg`;
    a.click();

    // 2. Generate YOLO format bounding boxes: <class_id> <x_center> <y_center> <width> <height> (normalized 0-1)
    const yoloLines = chars.map((ch, idx) => {
      const xCenter = ((idx + 1) / (count + 1)).toFixed(4);
      const yCenter = (0.5).toFixed(4);
      const w = (1 / (count + 2)).toFixed(4);
      const h = (0.24).toFixed(4);
      return `0 ${xCenter} ${yCenter} ${w} ${h}`;
    });
    downloadFile(
      `synthetic_${scriptChoice.toLowerCase()}_yolo.txt`,
      yoloLines.join('\n'),
      'text/plain'
    );

    // 3. Ground truth JSON
    const meta = {
      generator: 'EpigraphAI Synthetic Stone Augmentation Engine',
      script: scriptChoice,
      substrate,
      simulatedErosion: `${erosion}%`,
      rakingLightDegrees: rakingAngle,
      fissureNoiseScore: fissureDensity,
      groundTruthText: customText,
      characterCount: count,
      yoloClassMap: { 0: 'ancient_carved_glyph' },
    };
    downloadFile(
      `synthetic_${scriptChoice.toLowerCase()}_labels.json`,
      JSON.stringify(meta, null, 2),
      'application/json'
    );
  };

  // AI-Assisted Synthetic Sequence Generation
  const handleGenerateAiSample = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/generate-synthetic-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptType: scriptChoice,
          stoneType: substrate,
          textToRender: customText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.groundTruthTamil) {
          // If returned, enrich text
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                CRNN / YOLOv12 TRAINING ENGINE
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs text-stone-300">
                Section 3 & 8 Pipeline
              </span>
            </div>
            <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
              Synthetic Stone Inscription Augmentation Studio
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Public labeled epigraphical datasets are scarce. This engine simulates realistic weathering,
              crystalline granite fissures, raking sunlight, and erosion to generate infinite training pairs.
            </p>
          </div>

          <button
            onClick={handleDownloadDatasetPair}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 text-xs shadow-lg transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>Download Dataset Pair (Image + YOLO + JSON)</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Stone Canvas Preview (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs text-stone-400">
              <span className="font-mono-code text-amber-400">SYNTHETIC STONE RENDER (750x420px)</span>
              <span>Substrate: {substrate.replace('-', ' ')}</span>
            </div>

            <div className="flex items-center justify-center p-3">
              <canvas
                ref={canvasRef}
                className="max-h-[420px] w-auto max-w-full rounded-lg shadow-inner object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-800 text-[11px] text-stone-400 font-mono-code">
              <div>
                <span>Simulated Weathering: {erosion}%</span>
                <span className="ml-3">Raking Sun: {rakingAngle}°</span>
              </div>
              <div className="text-emerald-400 font-semibold">
                Ready for PyTorch / TFLite / YOLO Training
              </div>
            </div>
          </div>

          {/* Preset Inscription Cards */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-4">
            <span className="text-xs font-mono-code text-stone-300 block mb-2">QUICK EPIGRAPHICAL PRESETS</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setCustomText(p.text);
                    setScriptChoice(p.script);
                    setSubstrate(p.sub);
                  }}
                  className="p-2.5 rounded-xl border border-stone-800 bg-stone-900/60 hover:border-amber-600/60 hover:bg-stone-800 text-left transition-all text-xs"
                >
                  <div className="font-semibold text-stone-200">{p.label}</div>
                  <div className="text-[10px] text-stone-400 truncate mt-0.5">{p.script}</div>
                  <div className="font-tamil text-amber-400 text-xs mt-1 truncate">{p.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Augmentation Parameters (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
              <h3 className="font-serif-heading text-sm font-bold text-amber-300 flex items-center gap-2">
                <Sliders className="h-4 w-4" />
                Physical Augmentation Controls
              </h3>
            </div>

            {/* Inscription Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 block">Ancient Glyph Sequence to Inscribe</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2 text-sm font-tamil text-amber-300 focus:outline-none focus:border-amber-500"
                placeholder="Type or paste ancient characters..."
              />
            </div>

            {/* Script Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 block">Historical Script</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Tamil-Brahmi', 'Vatteluttu', 'Grantha'] as const).map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setScriptChoice(sc)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] border font-medium ${
                      scriptChoice === sc
                        ? 'border-amber-500 bg-amber-950/60 text-amber-200 font-bold'
                        : 'border-stone-800 bg-stone-900 text-stone-400'
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>

            {/* Substrate Type */}
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 block">Stone Substrate</label>
              <select
                value={substrate}
                onChange={(e) => setSubstrate(e.target.value as any)}
                className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              >
                <option value="charnockite-granite">Weathered Charnockite Granite (Madurai Caverns)</option>
                <option value="pink-granite">Pink Hard Granite (Thanjavur Brihadisvara)</option>
                <option value="sandstone">Warm Sandstone (Uttaramerur)</option>
                <option value="basalt">Volcanic Basalt (Hero Stone / Nadukal)</option>
                <option value="copper-plate">Patinated Bronze / Copper Plate (Sasana)</option>
              </select>
            </div>

            {/* Erosion Slider */}
            <div>
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Erosion & Weathering Level</span>
                <span className="font-mono-code text-amber-400">{erosion}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                value={erosion}
                onChange={(e) => setErosion(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>New Carving (0%)</span>
                <span>Century Worn</span>
                <span>2000y Eroded (95%)</span>
              </div>
            </div>

            {/* Raking Light Angle */}
            <div>
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Raking Light Angle (Shadow Direction)</span>
                <span className="font-mono-code text-amber-400">{rakingAngle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rakingAngle}
                onChange={(e) => setRakingAngle(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Rock Cracks & Fissures */}
            <div>
              <div className="flex justify-between text-xs text-stone-300 mb-1">
                <span>Natural Rock Fissure Density (Noise)</span>
                <span className="font-mono-code text-amber-400">{fissureDensity}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={fissureDensity}
                onChange={(e) => setFissureDensity(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Lichen Toggle */}
            <label className="flex items-center justify-between text-xs text-stone-300 cursor-pointer pt-2 border-t border-stone-800">
              <span>Lichen & Mineral Weathering Patches</span>
              <input
                type="checkbox"
                checked={lichen}
                onChange={(e) => setLichen(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
