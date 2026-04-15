import { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Globe, ChevronDown, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/shared/infrastructure/supabase';

const countries = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola',
  'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
  'Bangladesh', 'Belgique', 'Bénin', 'Biélorussie', 'Bolivie', 'Bosnie-Herzégovine', 'Brésil',
  'Bulgarie', 'Cambodge', 'Cameroun', 'Canada', 'Chili', 'Chine', 'Colombie', 'Côte d\'Ivoire',
  'Croatie', 'Danemark', 'Égypte', 'Émirats arabes unis', 'Espagne', 'Estonie', 'États-Unis',
  'Éthiopie', 'Finlande', 'France', 'Ghana', 'Grèce', 'Guatemala', 'Hongrie', 'Inde',
  'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon',
  'Kazakhstan', 'Kenya', 'Koweït', 'Lettonie', 'Liban', 'Lituanie', 'Luxembourg',
  'Madagascar', 'Malaisie', 'Malte', 'Maroc', 'Mexique', 'Moldavie', 'Monaco', 'Mongolie',
  'Maroc', 'Mauritanie', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal',
  'Qatar', 'République tchèque', 'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
  'Sénégal', 'Serbie', 'Singapour', 'Slovaquie', 'Slovénie', 'Suède', 'Suisse',
  'Tanzanie', 'Thaïlande', 'Tunisie', 'Turquie', 'Ukraine', 'Uruguay', 'Venezuela',
  'Vietnam', 'Zambie', 'Zimbabwe',
];

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
};

async function uploadDoc(file: File, userId: string, label: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'pdf';
  const path = `${userId}/${label}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('enterprise-docs').upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) { console.error(error); return null; }
  const { data } = supabase.storage.from('enterprise-docs').getPublicUrl(path);
  return data.publicUrl;
}

const inputCls =
  'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30 bg-white/[0.04] border border-white/10 focus:border-white/25';

export default function EnterpriseRegistrationModal({ open, onClose, onSuccess, userId }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const kbisRef = useRef<HTMLInputElement>(null);
  const idRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  const [legalName, setLegalName] = useState('');
  const [siret, setSiret] = useState('');
  const [country, setCountry] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const [repName, setRepName] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [website, setWebsite] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const canSave =
    legalName.trim() && siret.trim() && country && kbisFile && repName.trim() && idFile;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
        setCountrySearch('');
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    if (countryOpen) countrySearchRef.current?.focus();
  }, [countryOpen]);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError('');
    const kbisUrl = await uploadDoc(kbisFile!, userId, 'kbis');
    const idUrl = await uploadDoc(idFile!, userId, 'identity');
    if (!kbisUrl || !idUrl) {
      setError('Erreur lors de l\'upload des documents. Réessaie.');
      setSaving(false);
      return;
    }
    const { error: dbError } = await supabase.from('profiles').update({
      company_legal_name: legalName.trim(),
      company_siret: siret.trim(),
      company_country: country,
      company_kbis_url: kbisUrl,
      company_rep_name: repName.trim(),
      company_id_doc_url: idUrl,
      company_website: website.trim(),
      company_registration_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);
    setSaving(false);
    if (dbError) {
      setError(`Erreur : ${dbError.message}`);
      return;
    }
    onSuccess();
    onClose();
  }

  if (!open) return null;

  const FileRow = ({
    file,
    onClear,
    onPick,
    label,
  }: {
    file: File | null;
    onClear: () => void;
    onPick: () => void;
    label: string;
  }) =>
    file ? (
      <div
        className="w-full px-4 py-3 rounded-xl flex items-center justify-between"
        style={{ background: 'rgba(100,250,81,0.04)', border: '1px solid rgba(100,250,81,0.2)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(100,250,81,0.1)' }}>
            <Check className="w-3.5 h-3.5" style={{ color: '#64FA51' }} />
          </div>
          <span className="text-sm text-white truncate">{file.name}</span>
        </div>
        <button onClick={onClear} className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors ml-2">
          <X className="w-4 h-4 text-white/40" />
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={onPick}
        className="w-full px-4 py-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)' }}
      >
        <Upload className="w-5 h-5 text-white/30" />
        <span className="text-sm text-white/40">{label}</span>
        <span className="text-xs text-white/20">PDF, JPG, PNG</span>
      </button>
    );

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1300] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#0d0d0f', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div>
            <h2 className="text-base font-bold text-white">Enregistrement de l'entreprise</h2>
            <p className="text-xs text-white/40 mt-0.5">Ces informations sont requises pour accéder à l'espace entreprise.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1" style={{ padding: '20px 24px' }}>
          <input ref={kbisRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setKbisFile(f); e.target.value = ''; }} />
          <input ref={idRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setIdFile(f); e.target.value = ''; }} />

          <div className="space-y-5">
            {/* Nom légal */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Nom légal de l'entreprise <span className="text-yellow-400">*</span>
              </label>
              <input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} placeholder="Ex: Acme Corporation SAS" className={inputCls} />
            </div>

            {/* SIRET */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Numéro SIRET <span className="text-yellow-400">*</span>
              </label>
              <input type="text" value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="14 chiffres" maxLength={14} className={inputCls} />
            </div>

            {/* Pays */}
            <div className="relative" ref={countryRef}>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Pays d'enregistrement <span className="text-yellow-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="w-full px-4 py-3 rounded-xl text-sm text-left flex items-center justify-between outline-none transition-all"
                style={{ background: countryOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: countryOpen ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.1)', color: country ? '#fff' : 'rgba(255,255,255,0.25)' }}
              >
                <span>{country || 'Sélectionner un pays'}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${countryOpen ? 'rotate-180' : ''}`} />
              </button>
              {countryOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-hidden" style={{ background: '#141212', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 40px rgba(0,0,0,0.8)' }}>
                  <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input ref={countrySearchRef} type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="Rechercher un pays..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }} />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1.5">
                    {filteredCountries.length === 0 ? (
                      <p className="px-4 py-4 text-center text-sm text-white/30">Aucun pays trouvé</p>
                    ) : (
                      filteredCountries.map((c) => {
                        const sel = country === c;
                        return (
                          <button key={c} type="button" onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(''); }} className="w-full px-4 py-2.5 text-left flex items-center justify-between text-sm transition-colors hover:bg-white/[0.06]" style={{ color: sel ? '#fff' : 'rgba(255,255,255,0.65)', fontWeight: sel ? 600 : 400 }}>
                            <span>{c}</span>
                            {sel && <Check className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kbis */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Extrait Kbis ou document équivalent <span className="text-yellow-400">*</span>
              </label>
              <FileRow file={kbisFile} onClear={() => setKbisFile(null)} onPick={() => kbisRef.current?.click()} label="Cliquer pour déposer un fichier" />
            </div>

            {/* Représentant */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Nom et prénom du représentant légal <span className="text-yellow-400">*</span>
              </label>
              <input type="text" value={repName} onChange={(e) => setRepName(e.target.value)} placeholder="Ex: Jean Dupont" className={inputCls} />
            </div>

            {/* Pièce d'identité */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Pièce d'identité du représentant légal <span className="text-yellow-400">*</span>
              </label>
              <FileRow file={idFile} onClear={() => setIdFile(null)} onPick={() => idRef.current?.click()} label="Cliquer pour déposer un fichier" />
            </div>

            {/* Site web */}
            <div>
              <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-2">
                Site web <span className="text-white/30 font-normal normal-case tracking-normal">(optionnel)</span>
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votreentreprise.com" className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all bg-white/[0.04] border border-white/10 focus:border-white/25" />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <p className="text-xs text-white/45 leading-relaxed">
            En continuant, vous confirmez que les informations fournies sont exactes et acceptez leur utilisation pour la vérification de votre entreprise, conformément à notre politique de confidentialité.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Plus tard
            </button>
            <button
              type="button"
              disabled={!canSave || saving}
              onClick={handleSave}
              className="flex-[2] py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: canSave && !saving ? '#fff' : 'rgba(255,255,255,0.1)', color: canSave && !saving ? '#000' : 'rgba(255,255,255,0.3)' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Enregistrer & continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
