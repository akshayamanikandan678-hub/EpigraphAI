export interface CharacterSegment {
  id: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 scale
  ancientGlyphName: string;
  transcribedChar: string;
  modernChar: string;
  confidence: number; // 0 - 100
  isCarvedGlyph: boolean;
  rockNoiseType: 'none' | 'crack' | 'erosion' | 'mineral';
  palaeographicNotes?: string;
}

export interface InscriptionRecord {
  id: string;
  title: string;
  scriptType: 'Tamil-Brahmi' | 'Vatteluttu' | 'Grantha' | 'Chola Inscriptional Tamil' | 'Devanagari';
  dynasty: string;
  period: string;
  approxDate: string;
  siteName: string;
  location: string;
  gps: {
    lat: number;
    lng: number;
  };
  substrate: string;
  lightingCondition: string;
  conservationStatus: string;
  rawAncientText: string;
  modernTamilText: string;
  sanskritIast?: string;
  englishTranslation: string;
  tamilMeaning: string;
  historicalSignificance: string;
  confidenceScore: number;
  segments: CharacterSegment[];
  palaeographicFeatures: string[];
  thumbnailUrl?: string;
}

export const CURATED_INSCRIPTIONS: InscriptionRecord[] = [
  {
    id: 'mangulam-brahmi-01',
    title: 'Mangulam Rock Cavern Tamil-Brahmi Inscription',
    scriptType: 'Tamil-Brahmi',
    dynasty: 'Early Pandya Dynasty',
    period: 'Sangam Period (3rd – 2nd Century BCE)',
    approxDate: 'c. 220 BCE',
    siteName: 'Mangulam Meenakshipuram Cavern',
    location: 'Madurai District, Tamil Nadu',
    gps: { lat: 10.0152, lng: 78.2396 },
    substrate: 'Weathered Charnockite Granite Cave Eyebrow',
    lightingCondition: 'High contrast raking afternoon sunlight',
    conservationStatus: 'Moderately weathered, chisel grooves filled with lichen and rain patina',
    rawAncientText: '𑀓𑀡𑀺𑀬𑀦𑁆 𑀦𑀦𑁆𑀤𑀸𑀲𑀺𑀭𑀺𑀬𑀺𑀓𑁂 𑀇𑀢𑀸 𑀘𑁂𑀇𑀬 𑀧𑀮𑀺𑀬𑁆',
    modernTamilText: 'கணியன் நந்தாசிரியற்கு இத்த சேதிய பள்ளி',
    sanskritIast: 'kaṇiyan nandāsiriyike itā cheiya paliy',
    englishTranslation:
      'This monastery cave shelter was caused to be dedicated and carved for the venerable Jain ascetic teacher Kaniyan Nanta-asiriyan, gifted by the servant of King Nedunjeliyan.',
    tamilMeaning:
      'பாண்டியன் நெடுஞ்செழியன் காலத்தில், மூத்த சமணத் துறவி கணி நந்தாசிரியருக்கு கற்படுக்கை மற்றும் குகைப் பள்ளியை அமைத்துக் கொடுத்த கல்வெட்டு.',
    historicalSignificance:
      'Discovered near Madurai, this is one of the oldest deciphered epigraphic proofs of the Sangam Pandya King Nedunjeliyan. Deciphered by Iravatham Mahadevan, it establishes Tamil-Brahmi orthography and early Jain ascetic presence in Tamilakam.',
    confidenceScore: 96.4,
    palaeographicFeatures: [
      'Tamil-Brahmi System-II orthography (pure consonants marked with a Virama/Pulli dot)',
      'Special Dravidian consonants: ழ (zha), ள (la), ற (ra), ன (na) present in primitive geometric forms',
      'Horizontal bar stroke for long vowels'
    ],
    segments: [
      { id: 'm1', box_2d: [180, 110, 360, 190], ancientGlyphName: 'Brahmi Ka (𑀓)', transcribedChar: 'க', modernChar: 'க', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Cross-like shape (+) with crisp horizontal stroke' },
      { id: 'm2', box_2d: [175, 210, 365, 280], ancientGlyphName: 'Brahmi Nya/Ni (𑀡𑀺)', transcribedChar: 'ணி', modernChar: 'ணி', confidence: 94, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Retroflex N with top hook denoting short i' },
      { id: 'm3', box_2d: [185, 300, 370, 370], ancientGlyphName: 'Brahmi Ya (𑀬)', transcribedChar: 'ய', modernChar: 'ய', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Anchor/trident-like curve base' },
      { id: 'm4', box_2d: [170, 390, 360, 460], ancientGlyphName: 'Brahmi Anusvara/Na (𑀦𑁆)', transcribedChar: 'ன்', modernChar: 'ன்', confidence: 92, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Horizontal base with vertical ascender and faint virama dot' },
      { id: 'c1', box_2d: [200, 470, 320, 520], ancientGlyphName: 'Natural Rock Fissure', transcribedChar: '—', modernChar: '—', confidence: 12, isCarvedGlyph: false, rockNoiseType: 'crack', palaeographicNotes: 'Deep crystalline rock crack correctly filtered out by binary classifier' },
      { id: 'm5', box_2d: [180, 530, 365, 600], ancientGlyphName: 'Brahmi Na (𑀦)', transcribedChar: 'ந', modernChar: 'ந', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Standard dental nasal' },
      { id: 'm6', box_2d: [180, 620, 360, 690], ancientGlyphName: 'Brahmi Da (𑀤𑀸)', transcribedChar: 'தா', modernChar: 'தா', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Rightward curve with elongation marker' },
      { id: 'm7', box_2d: [185, 710, 370, 780], ancientGlyphName: 'Brahmi Sa (𑀲𑀺)', transcribedChar: 'சி', modernChar: 'சி', confidence: 93, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Open hook dental sibilant' },
      { id: 'm8', box_2d: [180, 800, 365, 870], ancientGlyphName: 'Brahmi Ra (𑀭𑀺)', transcribedChar: 'ரி', modernChar: 'ரி', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Serpentine vertical line with vowel curl' }
    ]
  },
  {
    id: 'thanjavur-brihadisvara-02',
    title: 'Thanjavur Brihadisvara South Wall Inscription',
    scriptType: 'Vatteluttu',
    dynasty: 'Imperial Chola Dynasty',
    period: 'Middle Chola Era (11th Century CE)',
    approxDate: '1010 CE (26th Regnal Year of Rajaraja I)',
    siteName: 'Brihadisvara Temple (Peruvudaiyar Kovil)',
    location: 'Thanjavur District, Tamil Nadu',
    gps: { lat: 10.7828, lng: 79.1318 },
    substrate: 'Fine-grained Hard Pink Granite Plinth Base',
    lightingCondition: 'Direct midday tropical sunlight with sharp relief shadows',
    conservationStatus: 'Superbly preserved, deep chisel relief incisions along the sacred plinth',
    rawAncientText: '𑀲𑁆𑀯𑀲𑁆𑀢𑀺 𑀰𑁆𑀭𑀻 𑀓𑁄 𑀭𑀸𑀚 𑀭𑀸𑀚𑀓𑁂𑀲𑀭𑀺 𑀯𑀭𑁆𑀫𑀭𑀸𑀦 𑀰𑁆𑀭𑀻 𑀭𑀸𑀚𑀭𑀸𑀚𑀤𑁂𑀯𑀭𑁆𑀓𑁆𑀓𑀼 𑀬𑀸𑀡𑁆𑀟𑀼 𑁨𑁬',
    modernTamilText: 'ஸ்வஸ்தி ஸ்ரீ கோ ராஜராஜ கேசரிபன்மரான ஸ்ரீ ராஜராஜதேவர்க்கு யாண்டு இருபத்தாறாவது',
    sanskritIast: 'svasti śrī ko rājarājakēsarivarmarāna śrī rājarājadēvarkku yāṇḍu 26',
    englishTranslation:
      'Hail prosperity! In the twenty-sixth regnal year of King Rajaraja Kesari-varman, alias Sri Rajarajadeva, who commanded that the gifts given by him, his elder sister Kundavai, and his queens to the sacred Sri Vimana temple be engraved on stone forever.',
    tamilMeaning:
      'ராஜராஜ சோழன் தனது 26-ஆம் ஆட்சியாண்டில், தஞ்சைப் பெரிய கோயிலுக்கு தானமாக வழங்கப்பட்ட பொன், வெள்ளி, நிலக்கொடைகள் மற்றும் அணிகலன்களை கல்லிலே வெட்டி வைக்குமாறு பிறப்பித்த கல்வெட்டு ஆணை.',
    historicalSignificance:
      'One of the pinnacle epigraphical records of world history. The South Wall records royal endowments down to fractions of gold grains (kunri and manjadi), revenue accounting, dancing girls (taliccheri pendugal), and temple administration.',
    confidenceScore: 98.1,
    palaeographicFeatures: [
      'Rounded Vatteluttu loops transmuting into imperial Chola script',
      'Grantha letters integrated for Sanskrit auspicious invocations (Svasti Sri)',
      'Standardized ligatures for pulli, ukara, and ikara markers'
    ],
    segments: [
      { id: 't1', box_2d: [150, 80, 380, 180], ancientGlyphName: 'Grantha Ligature Svasti (𑀲𑁆𑀯𑀲𑁆𑀢𑀺)', transcribedChar: 'ஸ்வஸ்தி', modernChar: 'ஸ்வஸ்தி', confidence: 99, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Pallava-Chola Grantha ornamental ligated cluster' },
      { id: 't2', box_2d: [155, 195, 375, 275], ancientGlyphName: 'Grantha Sri (𑀰𑁆𑀭𑀻)', transcribedChar: 'ஸ்ரீ', modernChar: 'ஸ்ரீ', confidence: 99, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Auspicious emblem with top loop' },
      { id: 't3', box_2d: [160, 290, 380, 370], ancientGlyphName: 'Chola Ko (𑀓𑁄)', transcribedChar: 'கோ', modernChar: 'கோ', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Distinctive combined vowel-sign flanking consonant' },
      { id: 't4', box_2d: [150, 385, 385, 465], ancientGlyphName: 'Chola Ra (𑀭𑀸)', transcribedChar: 'ரா', modernChar: 'ரா', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Elongated vertical stem with sweeping terminal' },
      { id: 't5', box_2d: [155, 480, 380, 560], ancientGlyphName: 'Chola Ja (𑀚)', transcribedChar: 'ஜ', modernChar: 'ஜ', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'E-shaped curl showing Vatteluttu influence' },
      { id: 'c2', box_2d: [190, 570, 310, 620], ancientGlyphName: 'Granite Joint Mortar', transcribedChar: '—', modernChar: '—', confidence: 8, isCarvedGlyph: false, rockNoiseType: 'erosion', palaeographicNotes: 'Weathered stone joint line filtered out' },
      { id: 't6', box_2d: [150, 635, 385, 715], ancientGlyphName: 'Chola Ra (𑀭𑀸)', transcribedChar: 'ரா', modernChar: 'ரா', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Repetition of king titular name' },
      { id: 't7', box_2d: [155, 730, 380, 810], ancientGlyphName: 'Chola Ja (𑀚)', transcribedChar: 'ஜ', modernChar: 'ஜ', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Regal title suffix' },
      { id: 't8', box_2d: [150, 825, 385, 915], ancientGlyphName: 'Chola Ke (𑀓𑁂)', transcribedChar: 'கே', modernChar: 'கே', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Left modifier kombu with central ka' }
    ]
  },
  {
    id: 'mahabalipuram-grantha-03',
    title: 'Mahabalipuram Atiranachanda Mandapa Sanskrit Inscription',
    scriptType: 'Grantha',
    dynasty: 'Pallava Dynasty',
    period: 'Early Classical Pallava (7th – 8th Century CE)',
    approxDate: 'c. 700 CE (Rajasimha / Paramesvaravarman I)',
    siteName: 'Atiranachanda Mandapa, Saluvankuppam',
    location: 'Chengalpattu District, Tamil Nadu',
    gps: { lat: 12.6582, lng: 80.2033 },
    substrate: 'Sea-Facing Granitic Gneiss Rock Cliff',
    lightingCondition: 'Diffused maritime overcast light with salt spray erosion',
    conservationStatus: 'Lower lines slightly eroded by saline wind; upper registers deeply legible',
    rawAncientText: '𑌶𑍍𑌰𑍀𑌮𑌤𑍋 ऽ𑌤𑍍𑌯𑌨𑍍𑌤𑌕𑌾𑌮𑌸𑍍𑌯 𑌦𑍍𑌵𑌿𑌷𑌦𑍍𑌦𑌰𑍍𑌪𑍍𑌪𑌪𑌹𑌾𑌰𑌿𑌣𑌃 𑌶𑍍𑌰𑍀𑌨𑌿𑌧𑍇𑌃',
    modernTamilText: 'ஸ்ரீமதோ அத்யந்தகாமஸ்ய த்விஷத்தர்ப்பபஹாரிண: ஸ்ரீநிதே:',
    sanskritIast: 'śrīmato \'tyantakāmasya dviṣaddarppapahāriṇaḥ śrīnidheḥ',
    englishTranslation:
      'Of the illustrious King Atyantakama, the suppressor of his enemies\' haughtiness, the repository of royal splendor (Srinidhi), who is passionately devoted to the lotus feet of Shiva...',
    tamilMeaning:
      'பல்லவ மன்னன் அத்யந்தகாமன் (ராஜசிம்ம பல்லவன்) சிவபெருமானுக்கு இக்குகைக் கோயிலை அர்ப்பணித்து, எதிரிகளை வென்ற தனது பெருமையை வடமொழி கிரந்த எழுத்துகளில் செதுக்கிய புகழ்மாலை.',
    historicalSignificance:
      'Carved in both Pallava Grantha and early Nagari on opposite walls of the same mandapa, proving the bilingual and cosmopolitan epigraphical literacy of the Pallava court in the 7th century CE.',
    confidenceScore: 95.8,
    palaeographicFeatures: [
      'Florid calligraphic Pallava Grantha flourishes and elongated serifs',
      'Complex multi-consonant conjunct ligatures (e.g. ndda, rppa, ntya)',
      'Sharp ornamental chiseled vertices'
    ],
    segments: [
      { id: 'g1', box_2d: [160, 100, 390, 210], ancientGlyphName: 'Grantha Sri (𑌶𑍍𑌰𑍀)', transcribedChar: 'ஸ்ரீ', modernChar: 'ஸ்ரீ', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Flamboyant loop characteristic of 7th c. Pallava royal inscriptions' },
      { id: 'g2', box_2d: [165, 220, 385, 310], ancientGlyphName: 'Grantha Ma (𑌮)', transcribedChar: 'ம', modernChar: 'ம', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Curving base loop with right upward terminal' },
      { id: 'g3', box_2d: [160, 320, 390, 410], ancientGlyphName: 'Grantha To (𑌤𑍋)', transcribedChar: 'தோ', modernChar: 'தோ', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Dental ta flanked by bilateral vowel marks' },
      { id: 'c3', box_2d: [190, 420, 330, 480], ancientGlyphName: 'Marine Salt Crust', transcribedChar: '—', modernChar: '—', confidence: 15, isCarvedGlyph: false, rockNoiseType: 'mineral', palaeographicNotes: 'Superficial mineral crystallization patch' },
      { id: 'g4', box_2d: [155, 490, 390, 590], ancientGlyphName: 'Grantha Tya (𑌤𑍍𑌯)', transcribedChar: 'த்ய', modernChar: 'த்ய', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Subjoined ya beneath dental ta' },
      { id: 'g5', box_2d: [160, 600, 385, 700], ancientGlyphName: 'Grantha Nta (𑌨𑍍𑌤)', transcribedChar: 'ந்த', modernChar: 'ந்த', confidence: 94, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Vertical ligature stack' },
      { id: 'g6', box_2d: [165, 710, 390, 800], ancientGlyphName: 'Grantha Ka (𑌕𑌾)', transcribedChar: 'கா', modernChar: 'கா', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Looping velar with right hand length flourish' },
      { id: 'g7', box_2d: [160, 810, 385, 910], ancientGlyphName: 'Grantha Ma (𑌮𑌸𑍍𑌯)', transcribedChar: 'மஸ்ய', modernChar: 'மஸ்ய', confidence: 93, isCarvedGlyph: true, rockNoiseType: 'none', palaeographicNotes: 'Genitive case terminal stack' }
    ]
  },
  {
    id: 'uttaramerur-election-04',
    title: 'Uttaramerur Democratic Election Code Inscription',
    scriptType: 'Chola Inscriptional Tamil',
    dynasty: 'Imperial Chola Dynasty',
    period: 'Early Medieval Chola (10th Century CE)',
    approxDate: '920 CE (14th Year of Parantaka Chola I)',
    siteName: 'Vaikunta Perumal Temple',
    location: 'Uttaramerur, Kanchipuram District, Tamil Nadu',
    gps: { lat: 12.6157, lng: 79.7562 },
    substrate: 'Sandstone Temple Mandapa Basement Course',
    lightingCondition: 'Warm indirect temple colonnade shadow',
    conservationStatus: 'Intact, high scholastic relief, studied universally for constitutional history',
    rawAncientText: 'குடவோலை பறித்து பொத்தகம் எழுதுவானும் வாரியஞ் செய்வானும் ஆவன',
    modernTamilText: 'குடவோலை முறைப்படி கிராம சபை உறுப்பினர்களை தேர்ந்தெடுக்கும் விதிமுறைகள்',
    sanskritIast: 'kuḍavōlai paṟittu pothakam eḻutuvāṉum vāriyañ ceyvāṉum āvaṉa',
    englishTranslation:
      'The regulation for the Kudavolai (electoral ballot drawn from an urn) system: Whosoever is elected to the executive committees (Variyams) must possess unblemished land, Vedic knowledge, be aged between 35 and 70, and submit full financial accounts; relatives of corrupt officials are permanently barred.',
    tamilMeaning:
      'முதலாம் பராந்தக சோழனின் ஆட்சியில் உத்திரமேரூர் கிராம சபைக் குழுக்களுக்கு குடவோலை முறையில் உறுப்பினர்களைத் தேர்ந்தெடுக்கும் விதிகள், தகுதிகள் மற்றும் ஊழல் கண்காணிப்பு விதிமுறைகள்.',
    historicalSignificance:
      'Renowned worldwide as an authentic 10th-century stone manual of decentralized participatory democracy, local self-governance, term limits, and anti-corruption qualifications in India.',
    confidenceScore: 97.2,
    palaeographicFeatures: [
      'Dense horizontal alignment with standardized medieval Tamil characters',
      'Clear differentiation between retroflex and dental nasals',
      'Integration of numerical fractions and grain measurements'
    ],
    segments: [
      { id: 'u1', box_2d: [160, 100, 380, 200], ancientGlyphName: 'Medieval Ku (கு)', transcribedChar: 'கு', modernChar: 'கு', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u2', box_2d: [165, 210, 385, 305], ancientGlyphName: 'Medieval Da (ட)', transcribedChar: 'ட', modernChar: 'ட', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u3', box_2d: [160, 315, 380, 420], ancientGlyphName: 'Medieval Vo (வோ)', transcribedChar: 'வோ', modernChar: 'வோ', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u4', box_2d: [165, 430, 385, 520], ancientGlyphName: 'Medieval Lai (லை)', transcribedChar: 'லை', modernChar: 'லை', confidence: 98, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u5', box_2d: [160, 530, 380, 630], ancientGlyphName: 'Medieval Pa (ப)', transcribedChar: 'ப', modernChar: 'ப', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u6', box_2d: [165, 640, 385, 735], ancientGlyphName: 'Medieval Ri (றி)', transcribedChar: 'றி', modernChar: 'றி', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 'u7', box_2d: [160, 745, 380, 840], ancientGlyphName: 'Medieval Ttu (த்து)', transcribedChar: 'த்து', modernChar: 'த்து', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none' }
    ]
  },
  {
    id: 'sittannavasal-jain-05',
    title: 'Sittannavasal Jain Cavern Archaic Tamil-Brahmi',
    scriptType: 'Tamil-Brahmi',
    dynasty: 'Early Sangam Cavern Era',
    period: '2nd Century BCE',
    approxDate: 'c. 150 BCE',
    siteName: 'Eladipattam / Arivar Koil Stone Beds',
    location: 'Pudukkottai District, Tamil Nadu',
    gps: { lat: 10.4578, lng: 78.7231 },
    substrate: 'Natural Quartzite Bedrock Cavern Floor',
    lightingCondition: 'Subdued interior cavern ambient light',
    conservationStatus: 'Carved along pillow headrest of ascetic stone beds, smoothed by millennia of touch',
    rawAncientText: '𑀏𑀭𑀼𑀫𑀺𑀦𑀸𑀟𑀼 𑀓𑀼𑀫𑀼𑀵𑀹𑀭𑁆 𑀧𑀺𑀶𑀦𑁆𑀢 𑀓𑀸𑀯𑀼𑀢𑀺',
    modernTamilText: 'எருமிநாடு குமுழூர் பிறந்த காவுதி',
    sanskritIast: 'erumināḍu kumuḻūr piṟanta kāvuti',
    englishTranslation:
      'Kavuthan Iten, born at Kumuzhur in the ancient province of Eruminadu (Mysore / Southern borders), dedicated this eternal stone ascetic seat (adhitthanam) for severe penance.',
    tamilMeaning:
      'எருமிநாட்டிலுள்ள குமுழூரில் பிறந்த காவுதி ஈதென் என்பவரின் நினைவாக இளையார் சமண முனிவர்களுக்காக வெட்டி அமைத்த தவக் கற்படுக்கை கல்வெட்டு.',
    historicalSignificance:
      'A priceless geographical link showing trade and ascetic pilgrim routes connecting ancient Karnataka/Eruminadu and Tamilakam in the 2nd century BCE.',
    confidenceScore: 94.7,
    palaeographicFeatures: [
      'Archaic Tamil-Brahmi form of Zha (𑀵)',
      'Short angled vowels without ligature caps',
      'Primitive non-cursive rock engraving'
    ],
    segments: [
      { id: 's1', box_2d: [170, 120, 370, 220], ancientGlyphName: 'Brahmi E (𑀏)', transcribedChar: 'எ', modernChar: 'எ', confidence: 97, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 's2', box_2d: [175, 230, 365, 320], ancientGlyphName: 'Brahmi Ru (𑀭𑀼)', transcribedChar: 'ரு', modernChar: 'ரு', confidence: 95, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 's3', box_2d: [170, 330, 370, 420], ancientGlyphName: 'Brahmi Mi (𑀫𑀺)', transcribedChar: 'மி', modernChar: 'மி', confidence: 94, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 's4', box_2d: [175, 430, 365, 520], ancientGlyphName: 'Brahmi Na (𑀦𑀸)', transcribedChar: 'நா', modernChar: 'நா', confidence: 96, isCarvedGlyph: true, rockNoiseType: 'none' },
      { id: 's5', box_2d: [170, 530, 370, 620], ancientGlyphName: 'Brahmi Du (𑀟𑀼)', transcribedChar: 'டு', modernChar: 'டு', confidence: 93, isCarvedGlyph: true, rockNoiseType: 'none' }
    ]
  }
];
