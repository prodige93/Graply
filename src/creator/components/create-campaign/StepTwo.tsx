import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import instagramIcon from '@/shared/assets/instagram-card.svg';
import youtubeIcon from '@/shared/assets/youtube.svg';
import tiktokIcon from '@/shared/assets/tiktok.svg';

const CONTENT_TYPES = ['UGC', 'Clipping'];
const CATEGORIES = ['Crypto', 'Gaming', 'Fitness', 'Produit', 'Entertainment', 'Tech', 'Mode', 'Food', 'Beaute', 'Lifestyle', 'Finance', 'Education'];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: instagramIcon },
  { id: 'youtube', label: 'YouTube', icon: youtubeIcon },
  { id: 'tiktok', label: 'TikTok', icon: tiktokIcon },
] as const;

interface StepTwoProps {
  budget: string;
  setBudget: (v: string) => void;
  contentType: string;
  setContentType: (v: string) => void;
  categories: string[];
  setCategories: (v: string[]) => void;
  platforms: string[];
  setPlatforms: (v: string[]) => void;
  isEditMode?: boolean;
  originalPlatforms?: string[];
}

function Dropdown({ label, value, options, onChange, disabled }: { label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-all duration-200"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: open ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <span style={{ color: value ? '#fff' : 'rgba(255,255,255,0.25)' }}>
          {value || label}
        </span>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-200"
          style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && !disabled && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 rounded-xl overflow-hidden py-1 animate-fadeIn max-h-56 overflow-y-auto dropdown-glass"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{
                color: value === opt ? '#fff' : 'rgba(255,255,255,0.5)',
                backgroundColor: value === opt ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiDropdown({ label, values, options, onChange, disabled }: { label: string; values: string[]; options: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('pointerdown', handler);
      return () => document.removeEventListener('pointerdown', handler);
    }
  }, [open]);

  const toggle = (opt: string) => {
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);
    setOpen(false);
  };

  const remove = (opt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== opt));
  };

  return (
    <div ref={containerRef} className={`relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-200 min-h-[50px]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.06)',
          border: open ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex flex-wrap gap-1.5 flex-1 mr-2">
          {values.length > 0 ? values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              {v}
              {!disabled && <X className="w-3 h-3 text-white/40 hover:text-white/70 cursor-pointer" onClick={(e) => remove(v, e)} />}
            </span>
          )) : (
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
          )}
        </div>
        {!disabled && (
          <ChevronDown
            className="w-4 h-4 shrink-0 transition-transform duration-200"
            style={{ color: 'rgba(255,255,255,0.3)', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        )}
      </button>
      {open && !disabled && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 rounded-xl overflow-hidden py-1 animate-fadeIn max-h-56 overflow-y-auto dropdown-glass"
        >
          {options.map((opt) => {
            const selected = values.includes(opt);
            return (
              <button
                key={opt}
                onPointerDown={(e) => { e.preventDefault(); toggle(opt); }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center justify-between"
                style={{
                  color: selected ? '#fff' : 'rgba(255,255,255,0.5)',
                  backgroundColor: selected ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {opt}
                {selected && (
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#42A5F5' }}>
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white fill-current">
                      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StepTwo({ budget, setBudget, contentType, setContentType, categories, setCategories, platforms, setPlatforms, isEditMode, originalPlatforms = [] }: StepTwoProps) {
  const togglePlatform = (p: string) => {
    if (isEditMode && originalPlatforms.includes(p)) return;
    setPlatforms(platforms.includes(p) ? platforms.filter(x => x !== p) : [...platforms, p]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className={isEditMode ? 'opacity-40 pointer-events-none' : ''}>
        <label className="block text-sm font-semibold text-white mb-2">
          Budget <span style={{ color: '#F97316' }}>*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">EUR</span>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^0-9.,]/g, ''))}
            placeholder="10 000"
            disabled={isEditMode}
            className="w-full pl-14 pr-4 py-3.5 rounded-xl text-white text-sm placeholder-white/25 outline-none transition-all duration-200 focus:ring-2 focus:ring-white/20"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: budget && parseFloat(budget.replace(/[^0-9.]/g, '')) < 500
                ? '1px solid rgba(239,68,68,0.5)'
                : '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
        {budget && parseFloat(budget.replace(/[^0-9.]/g, '')) < 500 && (
          <p className="mt-2 text-xs" style={{ color: '#fca5a5' }}>
            Le budget minimum est de <span className="font-bold text-white">500 EUR</span>.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={isEditMode ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-semibold text-white mb-2">
            Type de contenu <span style={{ color: '#F97316' }}>*</span>
          </label>
          <Dropdown
            label="Selectionner un type"
            value={contentType}
            options={CONTENT_TYPES}
            onChange={setContentType}
            disabled={isEditMode}
          />
        </div>

        <div className={isEditMode ? 'opacity-40 pointer-events-none' : ''}>
          <label className="block text-sm font-semibold text-white mb-2">
            Categories <span style={{ color: '#F97316' }}>*</span>
          </label>
          <MultiDropdown
            label="Selectionner"
            values={categories}
            options={CATEGORIES}
            onChange={setCategories}
            disabled={isEditMode}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-white mb-3">
          Plateformes <span style={{ color: '#F97316' }}>*</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {PLATFORMS.map((p) => {
            const isSelected = platforms.includes(p.id);
            const isLocked = isEditMode && originalPlatforms.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <img src={p.icon} alt={p.label} className="w-5 h-5 social-icon" />
                <span
                  className="text-sm font-medium transition-colors"
                  style={{ color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)' }}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
