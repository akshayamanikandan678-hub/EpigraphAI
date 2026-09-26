export interface GlyphEvolution {
  modernChar: string;
  transliteration: string;
  ipa: string;
  tamilBrahmiGlyph: string;
  brahmiDescription: string;
  vatteluttuGlyph: string;
  vatteluttuDescription: string;
  granthaGlyph: string;
  granthaDescription: string;
  cholaGlyph: string;
  cholaDescription: string;
  category: 'Vowel' | 'Consonant' | 'Special Dravidian' | 'Ligature';
}

export const PALAEOGRAPHY_EVOLUTION: GlyphEvolution[] = [
  {
    modernChar: 'அ',
    transliteration: 'a',
    ipa: '/ʌ/',
    tamilBrahmiGlyph: '𑀅',
    brahmiDescription: 'Inverted chevron with a vertical stem line on the left, resembles an angled "K" reversed.',
    vatteluttuGlyph: 'அ (வட்டெழுத்து)',
    vatteluttuDescription: 'Softened round loop with continuous cursive upward flick.',
    granthaGlyph: '𑌅',
    granthaDescription: 'Florid serpentine curve with a top head-stroke.',
    cholaGlyph: 'அ (சோழர்)',
    cholaDescription: 'Distinct right loop with horizontal base line approaching modern form.',
    category: 'Vowel'
  },
  {
    modernChar: 'ஆ',
    transliteration: 'ā',
    ipa: '/ɑː/',
    tamilBrahmiGlyph: '𑀆',
    brahmiDescription: 'Short "a" glyph with an auxiliary horizontal vowel mark extending to the right at the midpoint.',
    vatteluttuGlyph: 'ஆ (வட்டெழுத்து)',
    vatteluttuDescription: 'Terminal loop curled inward at the bottom right corner.',
    granthaGlyph: '𑌆',
    granthaDescription: 'Extended downward loop with ornamental serif flourish.',
    cholaGlyph: 'ஆ (சோழர்)',
    cholaDescription: 'Loop with a descending curved hook at the right foot.',
    category: 'Vowel'
  },
  {
    modernChar: 'இ',
    transliteration: 'i',
    ipa: '/i/',
    tamilBrahmiGlyph: '𑀇',
    brahmiDescription: 'Three distinct geometric dots arranged as a triangular constellation ∴ or three dashes.',
    vatteluttuGlyph: 'இ (வட்டெழுத்து)',
    vatteluttuDescription: 'Dots connected by cursive swoops into two adjacent tear shapes.',
    granthaGlyph: '𑌇',
    granthaDescription: 'Upper horizontal serif bar with two subjoined pendant loops.',
    cholaGlyph: 'இ (சோழர்)',
    cholaDescription: 'Two loops joined by an upper arch, virtually identical to early print.',
    category: 'Vowel'
  },
  {
    modernChar: 'க',
    transliteration: 'ka',
    ipa: '/k/',
    tamilBrahmiGlyph: '𑀓',
    brahmiDescription: 'Pure symmetrical Greek cross (+), the primary anchor glyph of early Brahmi inscriptions.',
    vatteluttuGlyph: 'க (வட்டெழுத்து)',
    vatteluttuDescription: 'Bottom arm curves inward, crossbar becomes curved into a circular loop.',
    granthaGlyph: '𑌕',
    granthaDescription: 'Top horizontal header bar, central vertical stalk, loop on left side.',
    cholaGlyph: 'க (சோழர்)',
    cholaDescription: 'Square left shoulder with open bottom hook, beginning modern angularity.',
    category: 'Consonant'
  },
  {
    modernChar: 'த',
    transliteration: 'ta',
    ipa: '/t̪/',
    tamilBrahmiGlyph: '𑀤',
    brahmiDescription: 'Semicircular arch or crescent opening to the right or left with vertical extensions.',
    vatteluttuGlyph: 'த (வட்டெழுத்து)',
    vatteluttuDescription: 'Continuous clockwise spiral with lower descending foot.',
    granthaGlyph: '𑌤',
    granthaDescription: 'Top serif bar, downward sweep with right-angled kick.',
    cholaGlyph: 'த (சோழர்)',
    cholaDescription: 'Standardized loop with descending diagonal terminal tail.',
    category: 'Consonant'
  },
  {
    modernChar: 'ம',
    transliteration: 'ma',
    ipa: '/m/',
    tamilBrahmiGlyph: '𑀫',
    brahmiDescription: 'Circle surmounted by an open semicircular cup (like a goblet on a base).',
    vatteluttuGlyph: 'ம (வட்டெழுத்து)',
    vatteluttuDescription: 'Circular loop flattened horizontally with right upward hook.',
    granthaGlyph: '𑌮',
    granthaDescription: 'Loop at bottom-left corner with top head-stroke.',
    cholaGlyph: 'ம (சோழர்)',
    cholaDescription: 'Square bottom loop with vertical right arm, exact prototype of modern Ma.',
    category: 'Consonant'
  },
  {
    modernChar: 'ர',
    transliteration: 'ra',
    ipa: '/ɾ/',
    tamilBrahmiGlyph: '𑀭',
    brahmiDescription: 'Single vertical wavy or straight line (corkscrew/serpentine in archaic forms).',
    vatteluttuGlyph: 'ர (வட்டெழுத்து)',
    vatteluttuDescription: 'Curved downward loop with sweeping tail.',
    granthaGlyph: '𑌰',
    granthaDescription: 'Vertical stem with leftward barb at the head.',
    cholaGlyph: 'ர (சோழர்)',
    cholaDescription: 'Straight vertical stroke with top horizontal serif.',
    category: 'Consonant'
  },
  {
    modernChar: 'ழ',
    transliteration: 'ḻa (zha)',
    ipa: '/ɻ/',
    tamilBrahmiGlyph: '𑀵',
    brahmiDescription: 'Unique Tamil-Brahmi innovation not found in Ashokan Brahmi: vertical bar with an oval loop on the left.',
    vatteluttuGlyph: 'ழ (வட்டெழுத்து)',
    vatteluttuDescription: 'Double circular loop with lower open knot, preserving retroflex acoustic identity.',
    granthaGlyph: '𑌴',
    granthaDescription: 'Rare in pure Sanskrit Grantha, borrowed from Tamil epigraphs with ornate loop.',
    cholaGlyph: 'ழ (சோழர்)',
    cholaDescription: 'Triple-curved cursive stroke that directly yielded modern ழ.',
    category: 'Special Dravidian'
  },
  {
    modernChar: 'ள',
    transliteration: 'ḷa',
    ipa: '/ɭ/',
    tamilBrahmiGlyph: '𑀴',
    brahmiDescription: 'Horseshoe arch with inverted central tongue or hook.',
    vatteluttuGlyph: 'ள (வட்டெழுத்து)',
    vatteluttuDescription: 'Circular loop with high sweeping upper counter.',
    granthaGlyph: '𑌳',
    granthaDescription: 'Double bell shaped loop with top horizontal serif.',
    cholaGlyph: 'ள (சோழர்)',
    cholaDescription: 'Curled tail with distinct lower basin.',
    category: 'Special Dravidian'
  },
  {
    modernChar: 'ற',
    transliteration: 'ṟa',
    ipa: '/r/',
    tamilBrahmiGlyph: '𑀶',
    brahmiDescription: 'Vertical line crossed by two short horizontal parallel bars (ladder/zigzag).',
    vatteluttuGlyph: 'ற (வட்டெழுத்து)',
    vatteluttuDescription: 'Angular zigzag smoothed into an S-curve.',
    granthaGlyph: '—',
    granthaDescription: 'Absent in Vedic Sanskrit; used only in Tamil-Grantha hybrid records.',
    cholaGlyph: 'ற (சோழர்)',
    cholaDescription: 'High angled peak with sharp descent, ancestor of modern ற.',
    category: 'Special Dravidian'
  },
  {
    modernChar: 'ன',
    transliteration: 'ṉa',
    ipa: '/n/',
    tamilBrahmiGlyph: '𑀷',
    brahmiDescription: 'Horizontal bar with two vertical ascenders (H-like or U-like form).',
    vatteluttuGlyph: 'ன (வட்டெழுத்து)',
    vatteluttuDescription: 'Two rounded conjoined loops.',
    granthaGlyph: '—',
    granthaDescription: 'Absent in Sanskrit; specific to Dravidian alveolar nasal.',
    cholaGlyph: 'ன (சோழர்)',
    cholaDescription: 'Double loop with right descending leg, matching modern ன.',
    category: 'Special Dravidian'
  }
];
