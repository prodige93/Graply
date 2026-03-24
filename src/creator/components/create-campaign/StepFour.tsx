import { Plus, X, Upload, FileText } from 'lucide-react';

interface StepFourProps {
  information: string;
  setInformation: (v: string) => void;
  rules: string[];
  setRules: (v: string[]) => void;
  documents: File[];
  setDocuments: (v: File[]) => void;
  isEditMode?: boolean;
}

export default function StepFour({ information, setInformation, rules, setRules, documents, setDocuments, isEditMode }: StepFourProps) {
  const addRule = () => {
    setRules([...rules, '']);
  };

  const updateRule = (index: number, value: string) => {
    const updated = [...rules];
    updated[index] = value;
    setRules(updated);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments([...documents, ...Array.from(files)]);
    }
    e.target.value = '';
  };

  const removeDoc = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={isEditMode ? 'opacity-40 pointer-events-none' : ''}>
        <label className="block text-sm font-semibold text-white mb-2">
          Information <span style={{ color: '#F97316' }}>*</span>
        </label>
        <textarea
          value={information}
          onChange={(e) => setInformation(e.target.value)}
          placeholder="Informations supplémentaires pour les créateurs..."
          rows={4}
          disabled={isEditMode}
          className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Regles <span style={{ color: '#F97316' }}>*</span>
        </label>
        <div className="space-y-2">
          {rules.map((rule, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid #fff' }}
              >
                <span className="text-[10px] font-bold text-white">{i + 1}</span>
              </div>
              <input
                type="text"
                value={rule}
                onChange={(e) => updateRule(i, e.target.value)}
                placeholder="Ajouter une regle..."
                className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={() => removeRule(i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white/30" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addRule}
          className="mt-3 flex items-center gap-2 text-sm font-medium text-white/40 hover:text-white/60 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une regle
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Documents <span style={{ color: '#F97316' }}>*</span>
        </label>

        {documents.length > 0 && (
          <div className="space-y-2 mb-3">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(66,165,245,0.1)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#42A5F5' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{doc.name}</p>
                    <p className="text-xs text-white/30">{formatSize(doc.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeDoc(i)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-white/30" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label
          className="flex flex-col items-center justify-center w-full py-8 rounded-xl cursor-pointer transition-all duration-200 hover:brightness-125"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.1)' }}
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-5 h-5 text-white/30" />
            <p className="text-sm text-white/40">Importer un document</p>
            <p className="text-xs text-white/20">PDF, ZIP, MP3, etc.</p>
          </div>
          <input type="file" multiple onChange={handleDocUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}
