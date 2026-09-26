import React, { useState } from 'react';
import { MapPin, Search, Filter, Compass, Calendar, Download, Eye, ExternalLink } from 'lucide-react';
import { CURATED_INSCRIPTIONS, InscriptionRecord } from '../data/inscriptions';
import { exportToGeoJson, downloadFile } from '../utils/exportFormats';

interface HeritageArchiveMapProps {
  onSelectInscription: (record: InscriptionRecord) => void;
}

export const HeritageArchiveMap: React.FC<HeritageArchiveMapProps> = ({ onSelectInscription }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScript, setSelectedScript] = useState<string>('All');
  const [selectedDynasty, setSelectedDynasty] = useState<string>('All');

  const scripts = ['All', 'Tamil-Brahmi', 'Vatteluttu', 'Grantha', 'Chola Inscriptional Tamil'];
  const dynasties = ['All', 'Early Pandya Dynasty', 'Imperial Chola Dynasty', 'Pallava Dynasty', 'Early Sangam Cavern Era'];

  const filtered = CURATED_INSCRIPTIONS.filter((item) => {
    const matchesScript = selectedScript === 'All' || item.scriptType === selectedScript;
    const matchesDynasty = selectedDynasty === 'All' || item.dynasty === selectedDynasty;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.englishTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.modernTamilText.includes(searchQuery);
    return matchesScript && matchesDynasty && matchesSearch;
  });

  const handleExportAllGeoJson = () => {
    const featureCollection = {
      type: 'FeatureCollection',
      features: CURATED_INSCRIPTIONS.map((rec) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [rec.gps.lng, rec.gps.lat],
        },
        properties: {
          id: rec.id,
          title: rec.title,
          script: rec.scriptType,
          dynasty: rec.dynasty,
          period: rec.period,
          site: rec.siteName,
          location: rec.location,
          modernTamil: rec.modernTamilText,
          englishTranslation: rec.englishTranslation,
          confidence: rec.confidenceScore,
        },
      })),
    };

    downloadFile(
      'epigraphai_heritage_corpus.geojson',
      JSON.stringify(featureCollection, null, 2),
      'application/json'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-xs font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                ASI & TN ARCHAEOLOGY DIGITIZED REPOSITORY
              </span>
              <span className="rounded-md bg-stone-800 px-2.5 py-0.5 text-xs text-stone-300">
                Geo-Tagged Corpus
              </span>
            </div>
            <h1 className="font-serif-heading text-xl sm:text-2xl font-bold text-stone-100">
              Heritage GIS & Inscription Database
            </h1>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl">
              Searchable epigraphical records with GPS coordinates, palaeographic classifications, and digitized
              transliterations. Click any record to load into the Vision Pipeline.
            </p>
          </div>

          <button
            onClick={handleExportAllGeoJson}
            className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 text-xs shadow-lg transition-colors whitespace-nowrap"
          >
            <Download className="h-4 w-4" />
            <span>Export Full Corpus GeoJSON</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search site, king, keyword (e.g., Kudavolai, Rajaraja)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-950/90 pl-9 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Script Filter */}
          <select
            value={selectedScript}
            onChange={(e) => setSelectedScript(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950/90 px-3 py-1.5 text-xs text-stone-300 focus:border-amber-500 focus:outline-none"
          >
            {scripts.map((s) => (
              <option key={s} value={s}>
                Script: {s}
              </option>
            ))}
          </select>

          {/* Dynasty Filter */}
          <select
            value={selectedDynasty}
            onChange={(e) => setSelectedDynasty(e.target.value)}
            className="rounded-xl border border-stone-700 bg-stone-950/90 px-3 py-1.5 text-xs text-stone-300 focus:border-amber-500 focus:outline-none"
          >
            {dynasties.map((d) => (
              <option key={d} value={d}>
                Dynasty: {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((record) => (
          <div
            key={record.id}
            className="rounded-2xl border border-stone-800 bg-stone-900/40 hover:border-amber-500/60 p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-amber-950/10 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-950/80 px-2.5 py-0.5 text-[10px] font-mono-code font-bold tracking-wide text-amber-300 border border-amber-800">
                  {record.scriptType}
                </span>
                <span className="text-[11px] font-mono-code text-emerald-400 font-bold">
                  Conf: {record.confidenceScore}%
                </span>
              </div>

              <h3 className="font-serif-heading text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                {record.title}
              </h3>

              <div className="space-y-1 text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{record.siteName}, {record.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>{record.dynasty} &bull; {record.approxDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-stone-500">
                  <MapPin className="h-3.5 w-3.5 text-stone-600 shrink-0" />
                  <span>GPS: {record.gps.lat}° N, {record.gps.lng}° E</span>
                </div>
              </div>

              {/* Inscription excerpt */}
              <div className="rounded-xl border border-stone-800/80 bg-stone-950 p-3 space-y-1">
                <div className="font-tamil text-xs font-semibold text-amber-200 line-clamp-1">
                  {record.modernTamilText}
                </div>
                <div className="text-[11px] text-stone-400 italic line-clamp-2">
                  "{record.englishTranslation}"
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-[10px] text-stone-500 font-mono-code uppercase">
                {record.substrate.split(' ')[0]}
              </span>
              <button
                onClick={() => onSelectInscription(record)}
                className="flex items-center gap-1.5 rounded-lg bg-amber-600/90 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 text-xs transition-colors"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Open in Workbench</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
