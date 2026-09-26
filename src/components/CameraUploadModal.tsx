import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, RefreshCw, AlertCircle, Check, Image as ImageIcon } from 'lucide-react';
import { CURATED_INSCRIPTIONS, InscriptionRecord } from '../data/inscriptions';

interface CameraUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (record: InscriptionRecord) => void;
  onCustomImageLoaded: (image: HTMLImageElement, name: string) => void;
  initialMode?: 'camera' | 'upload' | 'samples';
}

export const CameraUploadModal: React.FC<CameraUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  onCustomImageLoaded,
  initialMode = 'upload',
}) => {
  const [tab, setTab] = useState<'upload' | 'camera' | 'samples'>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setTab(initialMode);
  }, [initialMode, isOpen]);

  // Start Camera when camera tab is selected
  useEffect(() => {
    if (isOpen && tab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, tab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Could not access camera. Please allow camera permissions or upload an image file instead.'
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      onCustomImageLoaded(img, 'Camera Field Capture');
      stopCamera();
      onClose();
    };
    img.src = canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        onCustomImageLoaded(img, file.name);
        onClose();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-950 p-6 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Title */}
        <div>
          <h2 className="font-serif-heading text-lg font-bold text-amber-200">
            Acquire Inscription for Vision Pipeline
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Capture field photograph, upload high-resolution stone rubbings, or select curated historical inscriptions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-stone-900 p-1 border border-stone-800 text-xs">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
              tab === 'upload' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            onClick={() => setTab('camera')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
              tab === 'camera' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Field Camera</span>
          </button>
          <button
            onClick={() => setTab('samples')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
              tab === 'samples' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Curated Samples</span>
          </button>
        </div>

        {/* Tab 1: Upload */}
        {tab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-700 bg-stone-900/40 p-8 hover:border-amber-500/80 hover:bg-stone-900 cursor-pointer transition-all text-center space-y-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-xs font-semibold text-stone-200">
                Click to browse or drop stone inscription image here
              </div>
              <p className="text-[11px] text-stone-400">
                Supports JPG, PNG, WebP up to 25MB (temple wall, hero stone, rock rubbing)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Camera */}
        {tab === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Camera Access Notice</p>
                  <p className="text-[11px] mt-1 text-red-300/80">{cameraError}</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-stone-800 bg-black overflow-hidden flex items-center justify-center max-h-[360px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto object-cover max-h-[360px]"
                />
                
                {/* Framing Reticle */}
                <div className="absolute inset-8 border-2 border-amber-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="text-[10px] font-mono-code text-amber-300/70 bg-black/60 px-2 py-0.5 rounded">
                    ALIGN INSCRIPTION REGISTER
                  </div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 text-xs shadow-xl transition-all"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Capture Inscription</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Curated Archaeological Samples */}
        {tab === 'samples' && (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {CURATED_INSCRIPTIONS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-stone-800 bg-stone-900/40 hover:border-amber-500/60 hover:bg-stone-800/60 cursor-pointer transition-all text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-200">{sample.title}</span>
                    <span className="rounded bg-amber-950 px-1.5 py-0.5 text-[9px] font-mono-code text-amber-300 border border-amber-800">
                      {sample.scriptType}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {sample.siteName} &bull; {sample.dynasty} ({sample.approxDate})
                  </div>
                </div>
                <button className="px-3 py-1 bg-amber-600/90 text-stone-950 rounded-lg font-bold text-[11px] whitespace-nowrap">
                  Load
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
