import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, BookOpen, HelpCircle } from 'lucide-react';
import { InscriptionRecord } from '../data/inscriptions';

interface EpigraphistConsultantProps {
  currentRecord: InscriptionRecord;
}

export const EpigraphistConsultant: React.FC<EpigraphistConsultantProps> = ({ currentRecord }) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      sender: 'assistant',
      text: `Vanakkam! I am your Senior Epigraphist & Archaeo-Vision Consultant for EpigraphAI. 
Currently, we are analyzing the "${currentRecord.title}" (${currentRecord.scriptType}, ${currentRecord.period}). 

You can ask me anything about:
• Palaeographic transitions between Tamil-Brahmi, Vatteluttu, Grantha, and Chola Tamil
• How our CLAHE + CNN contour classifier distinguishes chisel incisions from natural rock cracks
• King genealogies, regnal year astronomical dating (Prasastis), and historical significance
• Archaeological conservation of weathered granites and sandstones.`,
      time: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sampleQuestions = [
    `How does CLAHE preprocessing help detect shallow stone carvings?`,
    `Explain the difference between Tamil-Brahmi and Ashokan Brahmi orthography.`,
    `What is the historical significance of the Kudavolai election system in Uttaramerur?`,
    `Why is the Pulli (Virama dot) crucial in deciphering Tamil-Brahmi rock cavern beds?`,
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || isLoading) return;

    const userMsg = { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/epigraph-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          inscriptionContext: {
            title: currentRecord.title,
            script: currentRecord.scriptType,
            period: currentRecord.period,
            site: currentRecord.siteName,
            rawText: currentRecord.rawAncientText,
            tamil: currentRecord.modernTamilText,
            english: currentRecord.englishTranslation,
            features: currentRecord.palaeographicFeatures,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.answer || 'Consultation response generated.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Fallback response if API key is not configured or in offline mode
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: `[Offline Epigraphist Knowledge Base]:
Regarding "${q}":
In Tamil epigraphy, early inscriptions from 3rd c. BCE (Mangulam, Keezhadi) used Tamil-Brahmi adapted for Dravidian phonology by creating letters for ழ, ள, ற, ன and introducing the pulli virama. In medieval times (8th-11th c. CE), Vatteluttu flourished under the Pandyas and Cheras while Chola imperial scribes transitioned to standardized Tamil script, utilizing Grantha for Sanskrit liturgical portions. Our computer vision pipeline combines CLAHE to elevate low-contrast grooves with CRNN sequence decoding.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `[Offline Epigraphist Knowledge Base]:
Regarding "${q}":
EpigraphAI's dual approach relies on physical groove analysis: chisel marks have clean directional bevels that respond to raking light and CLAHE contrast enhancement, whereas natural cracks follow chaotic crystal planes. Feel free to inspect the bounding boxes in Step 2!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950 border border-amber-800 text-amber-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                GEMINI 3.8 FLASH EPIGRAPHY SPECIALIST
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs text-stone-300">
                Context: {currentRecord.title}
              </span>
            </div>
            <h1 className="font-serif-heading text-xl font-bold text-stone-100">
              AI Chief Epigraphist & Archaeo-Vision Consultant
            </h1>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="flex items-center gap-2 text-left p-2.5 rounded-xl border border-stone-800 bg-stone-900/40 hover:bg-stone-800 hover:border-amber-600/50 text-xs text-stone-300 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="truncate">{sq}</span>
          </button>
        ))}
      </div>

      {/* Chat History Box */}
      <div className="rounded-2xl border border-stone-800 bg-stone-950 p-5 space-y-4 max-h-[500px] overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950 border border-amber-800 text-amber-400 shrink-0">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 max-w-[85%] text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-600 text-stone-950 font-medium'
                  : 'bg-stone-900 border border-stone-800 text-stone-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div
                className={`text-[9px] mt-1 text-right font-mono-code ${
                  m.sender === 'user' ? 'text-amber-950/70' : 'text-stone-500'
                }`}
              >
                {m.time}
              </div>
            </div>
            {m.sender === 'user' && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-800 border border-stone-700 text-stone-300 shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono-code animate-pulse">
            <Bot className="h-4 w-4" />
            <span>Consulting South Indian Inscriptions corpus and epigraphical treatises...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about ancient Tamil/Sanskrit palaeography, dynasties, dating, or CV segmentation..."
          className="flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !inputQuestion.trim()}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold px-5 py-2.5 text-xs transition-colors"
        >
          <Send className="h-4 w-4" />
          <span>Ask</span>
        </button>
      </div>
    </div>
  );
};
