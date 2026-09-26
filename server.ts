import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Increase payload limit for stone photos & canvas processing
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Google GenAI with recommended header
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API: Analyze Inscription (Computer Vision OCR + Epigraphy Pipeline)
app.post('/api/analyze-inscription', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', scriptHint = 'auto', eraHint = '', siteMetadata } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured. Running in offline/fallback client mode.',
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are the core Computer Vision & Epigraphy Engine of EpigraphAI (specialized in South Asian Epigraphy: Tamil-Brahmi, Vatteluttu, Grantha, Early Chola Tamil, and Sanskrit Devanagari).
Analyze the stone/metal inscription image provided.

Context hints:
- Script hint requested: ${scriptHint}
- Era hint: ${eraHint || 'Analyze from palaeography'}
- Additional site metadata: ${JSON.stringify(siteMetadata || {})}

Execute the following 5-stage EpigraphAI pipeline analysis:
1. Script Recognition: Identify if it is Tamil-Brahmi, Vatteluttu, Pallava Grantha, Chola Tamil, or Devanagari.
2. Character Segmentation: Identify sequence of individual glyphs with bounding boxes (coordinates in normalized scale 0-1000: ymin, xmin, ymax, xmax), character value, modern Tamil or Sanskrit equivalent, and confidence score (0-100%). Identify any rock cracks or fissures that a CNN might falsely flag.
3. Transliteration: Convert ancient glyph sequence to modern Tamil and Sanskrit IAST.
4. Translation: Produce accurate historical translation into English and Modern Tamil.
5. Historical & Palaeographical Context: Dynasty (Pandya, Chola, Pallava, Chera, etc.), Century/Period, King/Ruler if identifiable, and purpose (e.g. Hero Stone / Nadukal, Kudavolai election, temple endowment, land grant, Jain rock bed).

Return strictly JSON matching this structure:
{
  "detectedScript": "Tamil-Brahmi" | "Vatteluttu" | "Grantha" | "Devanagari" | "Early Chola Tamil",
  "scriptConfidence": 95,
  "estimatedPeriod": "3rd Century BCE - Early Pandya" (or appropriate era),
  "monumentOrSite": "e.g., Mangulam / Keezhadi / Thanjavur Brihadisvara / Mahabalipuram",
  "dynasty": "e.g., Early Pandya / Imperial Chola / Pallava",
  "rawTransliteration": "Exact Romanized / IAST transliteration of the ancient characters",
  "modernTamil": "Modern Tamil script equivalent",
  "sanskritIast": "IAST Sanskrit equivalent if applicable or blank",
  "englishTranslation": "Scholarly, readable English translation of the inscription",
  "modernTamilMeaning": "Modern Tamil explanation of the meaning",
  "historicalSignificance": "Detailed 2-3 sentence archaeological and historical analysis of this inscription",
  "characters": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "ancientGlyphName": "e.g. Brahmi Ka / Vatteluttu Ra",
      "transcribedChar": "க",
      "modernChar": "க",
      "confidence": 94,
      "isCarvedGlyph": true,
      "rockNoiseType": "none" | "crack" | "erosion" | "mineral"
    }
  ],
  "palaeographicFeatures": [
    "e.g. Presence of Bhattiprolu-style Pulli",
    "Curvilinear Vatteluttu loops characteristic of 8th c. Pandya record"
  ],
  "conservationStatus": "e.g. Light weathering on upper register, legible deep incisions"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing inscription:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze inscription' });
  }
});

// API: Epigraphist Consultation Q&A
app.post('/api/epigraph-qa', async (req, res) => {
  try {
    const { question, inscriptionContext } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are an expert Chief Epigraphist and Archaeo-Computer Vision specialist for EpigraphAI.
You are assisting researchers, archaeologists, and students studying ancient Indian scripts: Tamil-Brahmi, Vatteluttu, Grantha, and Devanagari.
Answer this question with scholarly precision, citing palaeographic transitions, dynasties (Cholas, Pandyas, Pallavas, Cheras), epigraphical works (Iravatham Mahadevan, K.V. Subrahmanya Aiyer, ASI reports), or computer vision techniques (CLAHE, CRNN, YOLO contour segmentation).

Current Inscription In Focus:
${JSON.stringify(inscriptionContext || {})}

User Question: ${question}`,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in epigraph-qa:', error);
    res.status(500).json({ error: error.message || 'Failed to answer question' });
  }
});

// API: Synthetic Training Pair Generator
app.post('/api/generate-synthetic-sample', async (req, res) => {
  try {
    const { scriptType, stoneType, textToRender } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the Synthetic Inscription Data Augmentation Engine for EpigraphAI.
Generate a realistic ground truth dataset entry for training a CRNN / YOLOv12 model on ancient ${scriptType || 'Tamil-Brahmi'} carved on ${stoneType || 'Granite'}.
Phrase to simulate: "${textToRender || 'வேந்தன் நெடுஞ்செழியன்'}"

Return JSON:
{
  "scriptType": "${scriptType || 'Tamil-Brahmi'}",
  "simulatedPeriod": "string",
  "ancientGlyphSequence": ["string array of ancient glyph IDs"],
  "groundTruthTamil": "string",
  "groundTruthEnglish": "string",
  "simulatedBoundingBoxes": [
    { "char": "string", "x": 10, "y": 20, "w": 30, "h": 40, "confidence": 98 }
  ],
  "simulatedErosionLevel": "medium",
  "palaeographicDescription": "string"
}`,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error generating synthetic sample:', error);
    res.status(500).json({ error: error.message || 'Failed to generate synthetic data' });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`EpigraphAI Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
