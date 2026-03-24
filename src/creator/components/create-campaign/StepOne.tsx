import { Upload } from 'lucide-react';

interface StepOneProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  photo: File | null;
  setPhoto: (f: File | null) => void;
  photoPreview: string | null;
}

export default function StepOne({ name, setName, description, setDescription, photo, setPhoto, photoPreview }: StepOneProps) {
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhoto(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Nom de la campagne <span style={{ color: '#F97316' }}>*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: iPhone 17 Launch Campaign"
          className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Decrivez votre campagne, ses objectifs et le type de contenu attendu..."
          rows={4}
          className="w-full px-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none resize-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-2">
          Photo de la campagne <span style={{ color: '#F97316' }}>*</span>
        </label>
        <label
          className="flex flex-col items-center justify-center w-full h-48 rounded-xl cursor-pointer transition-all duration-200 hover:brightness-125 overflow-hidden"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.12)' }}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <Upload className="w-5 h-5 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-sm text-white/50">Cliquez pour importer une image</p>
                <p className="text-xs text-white/25 mt-1">PNG, JPG, WEBP (max 5 MB)</p>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </label>
      </div>
    </div>
  );
}
