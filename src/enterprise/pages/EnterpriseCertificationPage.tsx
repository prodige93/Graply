import { useState, useRef, useEffect } from 'react';
import { useEnterpriseNavigate } from '@/enterprise/lib/useEnterpriseNavigate';
import { ArrowLeft, Upload, X, Check, Globe, ChevronDown, Search } from 'lucide-react';
import jentrepriseIcon from '@/shared/assets/badge-enterprise-verified.png';
import certificationBtn from '@/shared/assets/certification-button-bg.svg';

const countries = [
  'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda',
  'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan', 'Bahamas', 'Bahreïn',
  'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 'Biélorussie', 'Birmanie', 'Bolivie',
  'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi', 'Cambodge',
  'Cameroun', 'Canada', 'Cap-Vert', 'Centrafrique', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores',
  'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba', 'Danemark', 'Djibouti',
  'Dominique', 'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'Eswatini',
  'États-Unis', 'Éthiopie', 'Fidji', 'Finlande', 'France', 'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce',
  'Grenade', 'Guatemala', 'Guinée', 'Guinée équatoriale', 'Guinée-Bissau', 'Guyana', 'Haïti', 'Honduras',
  'Hongrie', 'Inde', 'Indonésie', 'Irak', 'Iran', 'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque',
  'Japon', 'Jordanie', 'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït', 'Laos', 'Lesotho',
  'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg', 'Macédoine du Nord',
  'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Maurice', 'Mauritanie', 'Mexique',
  'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique', 'Namibie', 'Nauru', 'Népal',
  'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande', 'Oman', 'Ouganda', 'Ouzbékistan', 'Pakistan',
  'Palaos', 'Palestine', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines',
  'Pologne', 'Portugal', 'Qatar', 'République dominicaine', 'République tchèque', 'Roumanie', 'Royaume-Uni',
  'Russie', 'Rwanda', 'Saint-Kitts-et-Nevis', 'Saint-Vincent-et-les-Grenadines', 'Sainte-Lucie', 'Salomon',
  'Salvador', 'Samoa', 'Sao Tomé-et-Príncipe', 'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour',
  'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Soudan du Sud', 'Sri Lanka', 'Suède', 'Suisse', 'Suriname',
  'Syrie', 'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Timor oriental', 'Togo', 'Tonga', 'Trinité-et-Tobago',
  'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu', 'Ukraine', 'Uruguay', 'Vanuatu', 'Vatican', 'Venezuela',
  'Vietnam', 'Yémen', 'Zambie', 'Zimbabwe'
];

export default function EnterpriseCertificationPage() {
  const navigate = useEnterpriseNavigate();

  const [legalName, setLegalName] = useState('');
  const [siret, setSiret] = useState('');
  const [country, setCountry] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [kbisFile, setKbisFile] = useState<File | null>(null);
  const [repName, setRepName] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [website, setWebsite] = useState('');
  const [agreed, setAgreed] = useState(false);

  const kbisInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countrySearchInputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (countryDropdownOpen && countrySearchInputRef.current) {
      countrySearchInputRef.current.focus();
    }
  }, [countryDropdownOpen]);

  function handleKbisChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setKbisFile(file);
    e.target.value = '';
  }

  function handleIdChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setIdFile(file);
    e.target.value = '';
  }

  const canSubmit = legalName.trim() && siret.trim() && country.trim() && kbisFile && repName.trim() && idFile && agreed;

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#050404' }}>
      <input ref={kbisInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleKbisChange} />
      <input ref={idInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleIdChange} />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate('/mon-compte')}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-white/10 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2.5">
            <img src={jentrepriseIcon} alt="" className="w-[34px] h-[34px]" />
            <h1 className="text-xl font-bold tracking-tight">Certification entreprise</h1>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white leading-snug mb-6">
            Vérifiez votre entreprise pour collaborer en toute confiance avec les créateurs de la plateforme.
          </h2>

          <div className="mb-6">
            <p className="text-base font-bold text-white mb-1">Pourquoi se certifier ?</p>
            <p className="text-sm text-white/50 leading-relaxed">
              Obtenez un badge officiel qui confirme que votre entreprise est légitime et fiable.
            </p>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <p className="text-sm font-bold text-white mb-3">Les avantages</p>
            <ul className="space-y-2">
              {[
                'Badge entreprise certifiée',
                'Frais de campagne passant à 5% au lieu de 8%',
                'Meilleure visibilité pour vos campagnes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(100,250,81,0.12)', border: '1px solid rgba(100,250,81,0.3)' }}>
                    <Check className="w-2.5 h-2.5" style={{ color: '#64FA51' }} />
                  </div>
                  <span className="text-sm text-white/70">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px' }}>
          <h2 className="text-xl font-bold text-white mb-8">Étape de certification</h2>

          <div
            className="rounded-2xl p-6 space-y-5"
            style={{
              background: 'rgba(255,255,255,0.055)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
            }}
          >
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Nom légal de l'entreprise <span style={{ color: '#FACC15' }}>*</span>
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Ex: Acme Corporation SAS"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Numéro SIRET <span style={{ color: '#FACC15' }}>*</span>
              </label>
              <input
                type="text"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="14 chiffres"
                maxLength={14}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div className="relative" ref={countryDropdownRef}>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Pays d'enregistrement <span style={{ color: '#FACC15' }}>*</span>
              </label>
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="w-full px-4 py-3 rounded-xl text-sm text-left flex items-center justify-between outline-none transition-all duration-200"
                style={{
                  background: countryDropdownOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                  border: countryDropdownOpen ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
                  color: country ? '#fff' : 'rgba(255,255,255,0.25)',
                }}
              >
                <span>{country || 'Sélectionner un pays'}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {countryDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-hidden"
                  style={{
                    background: '#141212',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        ref={countrySearchInputRef}
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Rechercher un pays..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto py-1.5 custom-scrollbar">
                    {filteredCountries.length === 0 ? (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-white/30">Aucun pays trouvé</p>
                      </div>
                    ) : (
                      filteredCountries.map((c) => {
                        const isSelected = country === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCountry(c);
                              setCountryDropdownOpen(false);
                              setCountrySearch('');
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-all duration-150"
                            style={{
                              color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                              background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <span className="font-medium">{c}</span>
                            {isSelected && <Check className="w-4 h-4 text-white" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Extrait Kbis ou document équivalent <span style={{ color: '#FACC15' }}>*</span>
              </label>
              {kbisFile ? (
                <div
                  className="w-full px-4 py-3 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(100,250,81,0.04)', border: '1px solid rgba(100,250,81,0.2)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(100,250,81,0.1)' }}>
                      <Check className="w-3.5 h-3.5" style={{ color: '#64FA51' }} />
                    </div>
                    <span className="text-sm text-white truncate">{kbisFile.name}</span>
                  </div>
                  <button onClick={() => setKbisFile(null)} className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors ml-2">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => kbisInputRef.current?.click()}
                  className="w-full px-4 py-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)' }}
                >
                  <Upload className="w-5 h-5 text-white/30" />
                  <span className="text-sm text-white/40">Cliquer pour déposer un fichier</span>
                  <span className="text-xs text-white/20">PDF, JPG, PNG</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Nom et prénom du représentant légal <span style={{ color: '#FACC15' }}>*</span>
              </label>
              <input
                type="text"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Pièce d'identité du représentant légal <span style={{ color: '#FACC15' }}>*</span>
              </label>
              {idFile ? (
                <div
                  className="w-full px-4 py-3 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(100,250,81,0.04)', border: '1px solid rgba(100,250,81,0.2)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(100,250,81,0.1)' }}>
                      <Check className="w-3.5 h-3.5" style={{ color: '#64FA51' }} />
                    </div>
                    <span className="text-sm text-white truncate">{idFile.name}</span>
                  </div>
                  <button onClick={() => setIdFile(null)} className="shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors ml-2">
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => idInputRef.current?.click()}
                  className="w-full px-4 py-6 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.03]"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)' }}
                >
                  <Upload className="w-5 h-5 text-white/30" />
                  <span className="text-sm text-white/40">Cliquer pour déposer un fichier</span>
                  <span className="text-xs text-white/20">PDF, JPG, PNG</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-widest mb-2">
                Site web
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://votreentreprise.com"
                  className="w-full pr-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200 focus:border-white/30"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div
              className="flex items-start gap-3 p-4 rounded-xl cursor-pointer select-none"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${agreed ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}` }}
              onClick={() => setAgreed(!agreed)}
            >
              <div
                className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
                style={{
                  background: agreed ? '#fff' : 'rgba(255,255,255,0.05)',
                  border: agreed ? 'none' : '1px solid rgba(255,255,255,0.2)',
                }}
              >
                {agreed && <Check className="w-3 h-3 text-black" />}
              </div>
              <p className="text-xs text-white leading-relaxed">
                En continuant, vous confirmez que les informations fournies sont exactes et acceptez leur utilisation pour la vérification de votre entreprise, conformément à notre politique de confidentialité.
              </p>
            </div>

            <div className="pt-4 pb-8 flex justify-center">
              <button
                disabled={!canSubmit}
                className="relative flex items-center justify-center transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] overflow-hidden"
                style={{
                  borderRadius: '12px',
                  padding: 0,
                  background: 'none',
                  border: 'none',
                  opacity: canSubmit ? 1 : 0.45,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                <img src={certificationBtn} alt="Devenir certifié" className="rounded-xl" style={{ height: '42px', width: '200px', display: 'block' }} />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold" style={{ color: '#ffffff' }}>Devenir certifié</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
