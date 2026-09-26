export interface StoneRenderOptions {
  width: number;
  height: number;
  substrateType: 'charnockite-granite' | 'pink-granite' | 'sandstone' | 'basalt' | 'copper-plate';
  erosionLevel: number; // 0 (crisp modern incision) to 100 (heavily eroded 2000-year stone)
  rakingLightAngle: number; // in degrees, e.g. 45
  fissureDensity: number; // 0 to 10
  lichenPatches: boolean;
  ancientCharacters: {
    char: string;
    label: string;
    xRatio: number;
    yRatio: number;
    size: number;
  }[];
  titleText?: string;
}

export function renderStoneInscription(canvas: HTMLCanvasElement, options: StoneRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { width, height, substrateType, erosionLevel, rakingLightAngle, fissureDensity, lichenPatches, ancientCharacters } = options;
  canvas.width = width;
  canvas.height = height;

  // 1. Base Substrate Palette
  let bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (substrateType === 'charnockite-granite') {
    // Dark weathered grey-green charnockite
    bgGrad.addColorStop(0, '#383632');
    bgGrad.addColorStop(0.5, '#292825');
    bgGrad.addColorStop(1, '#201f1c');
  } else if (substrateType === 'pink-granite') {
    // Thanjavur Brihadisvara pink granite
    bgGrad.addColorStop(0, '#543b35');
    bgGrad.addColorStop(0.5, '#422c27');
    bgGrad.addColorStop(1, '#2c1e1a');
  } else if (substrateType === 'sandstone') {
    // Warm golden-ochre Uttaramerur sandstone
    bgGrad.addColorStop(0, '#664e32');
    bgGrad.addColorStop(0.5, '#523d24');
    bgGrad.addColorStop(1, '#3b2915');
  } else if (substrateType === 'copper-plate') {
    // Patinated bronze / copper plate with verdigris
    bgGrad.addColorStop(0, '#3d4439');
    bgGrad.addColorStop(0.5, '#2e352b');
    bgGrad.addColorStop(1, '#22281f');
  } else {
    // Weathered Basalt
    bgGrad.addColorStop(0, '#2b2c2d');
    bgGrad.addColorStop(0.5, '#1e2021');
    bgGrad.addColorStop(1, '#151718');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Grain and crystalline stone noise
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const grainSeed = 42;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * (38 + (erosionLevel / 100) * 25);
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. Horizontal stone bedding layers & chisel guideline striations
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 1.5;
  for (let y = height * 0.15; y < height; y += height * 0.35) {
    ctx.beginPath();
    ctx.moveTo(0, y + (Math.random() - 0.5) * 6);
    for (let x = 0; x < width; x += 40) {
      ctx.lineTo(x, y + Math.sin(x * 0.02) * 3 + (Math.random() - 0.5) * 4);
    }
    ctx.stroke();
  }

  // 4. Natural rock cracks and fissures (noise)
  if (fissureDensity > 0) {
    ctx.lineWidth = 1.2;
    for (let f = 0; f < fissureDensity; f++) {
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(15, 12, 10, 0.7)' : 'rgba(70, 65, 60, 0.4)';
      let cx = width * (0.1 + Math.random() * 0.8);
      let cy = height * (0.1 + Math.random() * 0.8);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const segments = 12 + Math.floor(Math.random() * 15);
      for (let s = 0; s < segments; s++) {
        cx += (Math.random() - 0.48) * 24;
        cy += (Math.random() - 0.45) * 24;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }
  }

  // 5. Lichen / Weathering mineral deposits
  if (lichenPatches) {
    for (let l = 0; l < 6; l++) {
      const lx = width * (0.05 + Math.random() * 0.9);
      const ly = height * (0.05 + Math.random() * 0.9);
      const lRadius = 20 + Math.random() * 50;
      const lGrad = ctx.createRadialGradient(lx, ly, 2, lx, ly, lRadius);
      lGrad.addColorStop(0, 'rgba(145, 155, 120, 0.22)');
      lGrad.addColorStop(0.7, 'rgba(100, 115, 90, 0.12)');
      lGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.arc(lx, ly, lRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Draw Ancient Chiseled Glyphs with Raking Light & Erosion
  // Raking light calculates shadow and highlight offsets
  const rad = (rakingLightAngle * Math.PI) / 180;
  const shadowDist = 2.5 + (1 - erosionLevel / 100) * 2.0;
  const shadowX = Math.cos(rad) * shadowDist;
  const shadowY = Math.sin(rad) * shadowDist;

  const highlightX = -shadowX * 0.7;
  const highlightY = -shadowY * 0.7;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ancientCharacters.forEach((item) => {
    const x = item.xRatio * width;
    const y = item.yRatio * height;
    const fontSize = item.size || 34;

    ctx.font = `600 ${fontSize}px 'Noto Serif Tamil', 'Cinzel', serif`;

    // A. Sunlit relief highlight on upper chisel ridge
    ctx.fillStyle = 'rgba(230, 220, 195, 0.45)';
    ctx.fillText(item.char, x + highlightX, y + highlightY);

    // B. Deep Chisel Groove Shadow (V-cut incision)
    ctx.fillStyle = 'rgba(12, 10, 8, 0.88)';
    ctx.fillText(item.char, x + shadowX, y + shadowY);

    // C. Core glyph color
    const erosionFade = 0.55 + (1 - erosionLevel / 100) * 0.35;
    ctx.fillStyle = `rgba(28, 25, 22, ${erosionFade})`;
    ctx.fillText(item.char, x, y);

    // D. Weathering erosion stippling inside grooves
    if (erosionLevel > 30) {
      ctx.fillStyle = 'rgba(180, 165, 140, 0.15)';
      for (let p = 0; p < Math.floor(erosionLevel / 6); p++) {
        const ox = (Math.random() - 0.5) * (fontSize * 0.7);
        const oy = (Math.random() - 0.5) * (fontSize * 0.7);
        ctx.fillRect(x + ox, y + oy, 2, 2);
      }
    }
  });

  // 7. Stone Border Bevel / Vignette
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.7
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
