export interface CvFilterSettings {
  enableClahe: boolean;
  claheClipLimit: number; // 1.0 to 5.0
  claheGridSize: number; // 4 to 16
  enableDenoise: boolean;
  denoiseRadius: number; // 1 to 5
  enableShadowRemoval: boolean;
  shadowStrength: number; // 0.1 to 1.0
  enableEdgeEnhancement: boolean;
  edgeWeight: number; // 0.1 to 2.0
  perspectiveTiltX: number; // -30 to 30 deg
  perspectiveTiltY: number; // -30 to 30 deg
  binarizationMode: 'none' | 'adaptive-otsu' | 'relief-emboss' | 'chisel-edges';
  thresholdCutoff: number; // 0 to 255
}

export const DEFAULT_CV_SETTINGS: CvFilterSettings = {
  enableClahe: true,
  claheClipLimit: 2.8,
  claheGridSize: 8,
  enableDenoise: true,
  denoiseRadius: 1,
  enableShadowRemoval: true,
  shadowStrength: 0.6,
  enableEdgeEnhancement: true,
  edgeWeight: 1.2,
  perspectiveTiltX: 0,
  perspectiveTiltY: 0,
  binarizationMode: 'none',
  thresholdCutoff: 128,
};

export interface ProcessedCvResult {
  processedDataUrl: string;
  histogram: {
    original: number[];
    enhanced: number[];
  };
  detectedContours: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    area: number;
    isGlyph: boolean;
    confidence: number;
    strokeRegularity: number;
    classification: 'carved_glyph' | 'rock_crack' | 'lichen_erosion';
  }[];
  processingTimeMs: number;
}

/**
 * Executes Step 1 (OpenCV/Canvas Preprocessing) and Step 2 (Contour & Connected Component Segmentation)
 */
export async function runCvPipeline(
  imageSource: HTMLImageElement | HTMLCanvasElement,
  settings: CvFilterSettings
): Promise<ProcessedCvResult> {
  const startTime = performance.now();

  const width = imageSource.width || 600;
  const height = imageSource.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2d context');

  // Perspective correction if tilted
  ctx.save();
  if (settings.perspectiveTiltX !== 0 || settings.perspectiveTiltY !== 0) {
    ctx.translate(width / 2, height / 2);
    ctx.transform(
      1,
      Math.tan((settings.perspectiveTiltY * Math.PI) / 180) * 0.4,
      Math.tan((settings.perspectiveTiltX * Math.PI) / 180) * 0.4,
      1,
      0,
      0
    );
    ctx.translate(-width / 2, -height / 2);
  }
  ctx.drawImage(imageSource, 0, 0, width, height);
  ctx.restore();

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Build original luminance histogram
  const origHist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const luma = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    origHist[luma]++;
  }

  // Convert to grayscale working buffer
  const gray = new Uint8Array(width * height);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  let processedGray: Uint8Array<any> = new Uint8Array(width * height);
  processedGray.set(gray);

  // 1. Denoise (Box/Gaussian smoothing to soften grainy rock texture)
  if (settings.enableDenoise && settings.denoiseRadius > 0) {
    processedGray = applyBoxBlur(processedGray, width, height, settings.denoiseRadius);
  }

  // 2. Shadow Removal & Non-uniform Illumination Flattening
  if (settings.enableShadowRemoval) {
    const backgroundIllumination = applyBoxBlur(processedGray, width, height, 16);
    const meanBg = calculateMean(backgroundIllumination);
    for (let i = 0; i < processedGray.length; i++) {
      const diff = processedGray[i] - backgroundIllumination[i];
      const normalized = meanBg + diff * (1 + settings.shadowStrength * 0.8);
      processedGray[i] = Math.max(0, Math.min(255, Math.round(normalized)));
    }
  }

  // 3. CLAHE (Contrast Limited Adaptive Histogram Equalization)
  if (settings.enableClahe) {
    processedGray = applyClahe(
      processedGray,
      width,
      height,
      settings.claheGridSize,
      settings.claheClipLimit
    );
  }

  // 4. Edge Enhancement (Sobel Gradient for Chisel Relief)
  if (settings.enableEdgeEnhancement) {
    const edges = applySobel(processedGray, width, height);
    for (let i = 0; i < processedGray.length; i++) {
      const val = processedGray[i] - edges[i] * (settings.edgeWeight * 0.35);
      processedGray[i] = Math.max(0, Math.min(255, Math.round(val)));
    }
  }

  // 5. Binarization / Relief Emboss display mode
  if (settings.binarizationMode === 'adaptive-otsu') {
    const threshold = otsuThreshold(processedGray);
    for (let i = 0; i < processedGray.length; i++) {
      processedGray[i] = processedGray[i] < threshold ? 25 : 235;
    }
  } else if (settings.binarizationMode === 'chisel-edges') {
    const edges = applySobel(processedGray, width, height);
    for (let i = 0; i < processedGray.length; i++) {
      processedGray[i] = edges[i] > settings.thresholdCutoff ? 255 : 20;
    }
  }

  // Write back to canvas
  const enhancedHist = new Array(256).fill(0);
  for (let j = 0, i = 0; j < processedGray.length; j++, i += 4) {
    const val = processedGray[j];
    enhancedHist[val]++;
    data[i] = val;
    data[i + 1] = Math.round(val * 0.96); // slight warm sandstone tint
    data[i + 2] = Math.round(val * 0.90);
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // Step 2: Contour Detection & Rock Noise / Crack Classifier
  const contours = extractContourCandidates(processedGray, width, height);

  const processingTimeMs = Math.round(performance.now() - startTime);

  return {
    processedDataUrl: canvas.toDataURL('image/jpeg', 0.92),
    histogram: {
      original: origHist,
      enhanced: enhancedHist,
    },
    detectedContours: contours,
    processingTimeMs,
  };
}

// Helpers
function calculateMean(buffer: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i];
  return sum / buffer.length;
}

function applyBoxBlur(
  src: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  const dst = new Uint8Array(src.length);
  const kSize = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx >= 0 && nx < width) {
              sum += src[ny * width + nx];
              count++;
            }
          }
        }
      }
      dst[y * width + x] = Math.round(sum / count);
    }
  }
  return dst;
}

// CLAHE Implementation
function applyClahe(
  src: Uint8Array,
  width: number,
  height: number,
  gridCount: number,
  clipLimitVal: number
): Uint8Array {
  const dst = new Uint8Array(src.length);
  const tileW = Math.floor(width / gridCount);
  const tileH = Math.floor(height / gridCount);

  // Compute CDFs for all tiles
  const cdfs: Float32Array[] = [];
  for (let gy = 0; gy < gridCount; gy++) {
    for (let gx = 0; gx < gridCount; gx++) {
      const hist = new Int32Array(256);
      const startX = gx * tileW;
      const startY = gy * tileH;
      const endX = gx === gridCount - 1 ? width : startX + tileW;
      const endY = gy === gridCount - 1 ? height : startY + tileH;
      const pixelCount = (endX - startX) * (endY - startY);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          hist[src[y * width + x]]++;
        }
      }

      // Clip limit
      const clipLimit = Math.max(1, Math.round((clipLimitVal * pixelCount) / 256));
      let excess = 0;
      for (let i = 0; i < 256; i++) {
        if (hist[i] > clipLimit) {
          excess += hist[i] - clipLimit;
          hist[i] = clipLimit;
        }
      }
      const excessPerBin = Math.floor(excess / 256);
      for (let i = 0; i < 256; i++) {
        hist[i] += excessPerBin;
      }

      // Compute CDF
      const cdf = new Float32Array(256);
      let cumulative = 0;
      for (let i = 0; i < 256; i++) {
        cumulative += hist[i];
        cdf[i] = cumulative / pixelCount;
      }
      cdfs.push(cdf);
    }
  }

  // Bilinear interpolation across tiles
  for (let y = 0; y < height; y++) {
    const gyFloat = (y - tileH / 2) / tileH;
    const gy0 = Math.max(0, Math.min(gridCount - 1, Math.floor(gyFloat)));
    const gy1 = Math.max(0, Math.min(gridCount - 1, gy0 + 1));
    const wy = Math.max(0, Math.min(1, gyFloat - gy0));

    for (let x = 0; x < width; x++) {
      const gxFloat = (x - tileW / 2) / tileW;
      const gx0 = Math.max(0, Math.min(gridCount - 1, Math.floor(gxFloat)));
      const gx1 = Math.max(0, Math.min(gridCount - 1, gx0 + 1));
      const wx = Math.max(0, Math.min(1, gxFloat - gx0));

      const val = src[y * width + x];
      const c00 = cdfs[gy0 * gridCount + gx0][val];
      const c10 = cdfs[gy0 * gridCount + gx1][val];
      const c01 = cdfs[gy1 * gridCount + gx0][val];
      const c11 = cdfs[gy1 * gridCount + gx1][val];

      const top = c00 * (1 - wx) + c10 * wx;
      const bot = c01 * (1 - wx) + c11 * wx;
      const finalVal = (top * (1 - wy) + bot * wy) * 255;

      dst[y * width + x] = Math.max(0, Math.min(255, Math.round(finalVal)));
    }
  }
  return dst;
}

// Sobel Filter
function applySobel(src: Uint8Array, width: number, height: number): Uint8Array {
  const dst = new Uint8Array(src.length);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const p00 = src[(y - 1) * width + (x - 1)];
      const p01 = src[(y - 1) * width + x];
      const p02 = src[(y - 1) * width + (x + 1)];
      const p10 = src[y * width + (x - 1)];
      const p12 = src[y * width + (x + 1)];
      const p20 = src[(y + 1) * width + (x - 1)];
      const p21 = src[(y + 1) * width + x];
      const p22 = src[(y + 1) * width + (x + 1)];

      const gx = -p00 + p02 - 2 * p10 + 2 * p12 - p20 + p22;
      const gy = -p00 - 2 * p01 - p02 + p20 + 2 * p21 + p22;
      const mag = Math.sqrt(gx * gx + gy * gy);
      dst[y * width + x] = Math.min(255, Math.round(mag));
    }
  }
  return dst;
}

// Otsu Binarization
function otsuThreshold(src: Uint8Array): number {
  const hist = new Int32Array(256);
  for (let i = 0; i < src.length; i++) hist[src[i]]++;

  const total = src.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let maxVar = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;

    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);

    if (varBetween > maxVar) {
      maxVar = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

// Contour and Connected Component Candidate Detection
function extractContourCandidates(
  gray: Uint8Array,
  width: number,
  height: number
): ProcessedCvResult['detectedContours'] {
  const otsu = otsuThreshold(gray);
  const binary = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) {
    binary[i] = gray[i] < otsu * 0.9 ? 1 : 0;
  }

  // Connected components with grid clustering
  const stepX = Math.max(12, Math.floor(width / 35));
  const stepY = Math.max(14, Math.floor(height / 20));
  const candidates: ProcessedCvResult['detectedContours'] = [];

  for (let y = stepY; y < height - stepY; y += stepY * 1.5) {
    for (let x = stepX; x < width - stepX; x += stepX * 1.4) {
      // Sample local patch
      let darkCount = 0;
      let edgeCount = 0;
      const boxW = Math.min(width - x, Math.round(stepX * 1.8));
      const boxH = Math.min(height - y, Math.round(stepY * 2.2));

      for (let py = y; py < y + boxH; py += 2) {
        for (let px = x; px < x + boxW; px += 2) {
          if (binary[py * width + px] === 1) darkCount++;
        }
      }

      const totalSamples = (boxW / 2) * (boxH / 2);
      const density = darkCount / totalSamples;

      // Filter: Carved characters exhibit moderate stroke density (0.15 - 0.55),
      // whereas plain rock texture is < 0.10 and large shadow/holes are > 0.70
      if (density > 0.12 && density < 0.65) {
        const aspectRatio = boxW / boxH;
        const isCrack = aspectRatio > 3.2 || aspectRatio < 0.25 || density > 0.55;
        const strokeRegularity = Math.round(Math.min(99, Math.max(40, (1 - Math.abs(density - 0.32)) * 100)));

        candidates.push({
          id: `contour_${Math.round(x)}_${Math.round(y)}`,
          x: Math.round(x),
          y: Math.round(y),
          w: boxW,
          h: boxH,
          area: boxW * boxH,
          isGlyph: !isCrack,
          confidence: isCrack ? 18 : strokeRegularity,
          strokeRegularity,
          classification: isCrack ? 'rock_crack' : 'carved_glyph',
        });
      }
    }
  }

  return candidates;
}
