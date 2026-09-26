import React, { useState } from 'react';
import { BookOpen, Search, Filter, Info, ArrowRight } from 'lucide-react';
import { PALAEOGRAPHY_EVOLUTION, GlyphEvolution } from '../data/palaeography';

export const PalaeographyLexicon: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphEvolution | null>(
    PALAEOGRAPHY_EVOLUTION[0]
  );

  const categories = ['All', 'Vowel', 'Consonant', 'Special Dravidian'];

  const filteredGlyphs = PALAEOGRAPHY_EVOLUTION.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.modernChar.includes(searchQuery) ||
      item.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ipa.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                1500-YEAR EVOLUTION
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs text-stone-300">
                Palaeographic Transition
              </span>
            </div>
            <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
              Epigraphical Glyph & Palaeography Lexicon
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Compare letterform evolution from 3rd Century BCE Tamil-Brahmi rock incisions to 7th Century Vatteluttu,
              Pallava Grantha, 11th Century Chola epigraphs, and Modern Tamil.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search letter (e.g. க, ka, ழ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950/90 pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-stone-800/80">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-stone-950 font-bold'
                  : 'bg-stone-800/70 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Glyph Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Evolutionary Table (8 Cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-stone-800 bg-stone-900/40 p-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-800 bg-stone-950/80 font-mono-code text-[11px] text-stone-400">
                <tr>
                  <th className="p-3">Modern</th>
                  <th className="p-3">Tamil-Brahmi (3rd c. BCE)</th>
                  <th className="p-3">Vatteluttu (7th c. CE)</th>
                  <th className="p-3">Grantha (8th c. CE)</th>
                  <th className="p-3">Chola (11th c. CE)</th>
                  <th className="p-3 text-right">IPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-tamil">
                {filteredGlyphs.map((item) => (
                  <tr
                    key={item.modernChar}
                    onClick={() => setSelectedGlyph(item)}
                    className={`cursor-pointer transition-colors ${
                      selectedGlyph?.modernChar === item.modernChar
                        ? 'bg-amber-950/50 text-white'
                        : 'hover:bg-stone-800/40 text-stone-300'
                    }`}
                  >
                    <td className="p-3 font-bold text-base text-amber-400">
                      {item.modernChar}
                      <span className="ml-1 text-[11px] font-mono-code font-normal text-stone-400">
                        ({item.transliteration})
                      </span>
                    </td>
                    <td className="p-3 text-lg font-serif">{item.tamilBrahmiGlyph}</td>
                    <td className="p-3 text-sm">{item.vatteluttuGlyph}</td>
                    <td className="p-3 text-lg font-serif">{item.granthaGlyph}</td>
                    <td className="p-3 text-sm">{item.cholaGlyph}</td>
                    <td className="p-3 text-right font-mono-code text-stone-400">{item.ipa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Deep Inscription Detail Inspector (4 Cols) */}
        <div className="lg:col-span-4">
          {selectedGlyph ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-950 border border-amber-800 text-2xl font-tamil font-bold text-amber-300">
                    {selectedGlyph.modernChar}
                  </div>
                  <div>
                    <h3 className="font-serif-heading text-base font-bold text-stone-100">
                      Letter "{selectedGlyph.modernChar}" ({selectedGlyph.transliteration})
                    </h3>
                    <span className="text-[11px] font-mono-code text-stone-400">
                      IPA Phonetic: {selectedGlyph.ipa} &bull; {selectedGlyph.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Evolutionary Timeline Cards */}
              <div className="space-y-3">
                
                {/* Tamil-Brahmi */}
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-code text-amber-400 font-semibold">
                      TAMIL-BRAHMI (3rd c. BCE)
                    </span>
                    <span className="text-xl font-serif text-amber-200">{selectedGlyph.tamilBrahmiGlyph}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {selectedGlyph.brahmiDescription}
                  </p>
                </div>

                {/* Vatteluttu */}
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-code text-amber-400 font-semibold">
                      VATTELUTTU (7th c. CE)
                    </span>
                    <span className="text-base text-amber-200">{selectedGlyph.vatteluttuGlyph}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {selectedGlyph.vatteluttuDescription}
                  </p>
                </div>

                {/* Grantha */}
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-code text-amber-400 font-semibold">
                      PALLAVA GRANTHA (8th c. CE)
                    </span>
                    <span className="text-xl font-serif text-amber-200">{selectedGlyph.granthaGlyph}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {selectedGlyph.granthaDescription}
                  </p>
                </div>

                {/* Chola Inscriptional */}
                <div className="rounded-xl border border-stone-800 bg-stone-950 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono-code text-amber-400 font-semibold">
                      CHOLA INSCRIPTIONAL (11th c. CE)
                    </span>
                    <span className="text-base text-amber-200">{selectedGlyph.cholaGlyph}</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {selectedGlyph.cholaDescription}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-8 text-center text-xs text-stone-500">
              Select a letter from the table to inspect its 1500-year palaeographic evolution
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
