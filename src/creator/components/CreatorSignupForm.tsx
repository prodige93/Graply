import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import CguModal from './CguModal';

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.13)',
  boxShadow: '0 2px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
};

const glassFocus = {
  background: 'rgba(255,255,255,0.07)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.28)',
  boxShadow: '0 2px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.12)',
};

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  borderRadius: 14,
  fontSize: 15,
  color: '#fff',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxSizing: 'border-box',
};

interface Props {
  onBack: () => void;
}

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

function BirthDropdown({
  label,
  value,
  options,
  renderOption,
  onChange,
}: {
  label: string;
  value: string | number | null;
  options: (string | number)[];
  renderOption: (opt: string | number) => string;
  onChange: (val: string | number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <div
        onClick={() => setOpen(prev => !prev)}
        style={{
          ...inputBase,
          ...(open ? glassFocus : glass),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: selected !== null ? '#fff' : 'rgba(255,255,255,0.4)',
          padding: '16px 12px',
          fontSize: 14,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected !== null ? renderOption(selected) : label}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: 'rgba(255,255,255,0.4)',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
            marginLeft: 4,
          }}
        />
      </div>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          maxHeight: 200,
          overflowY: 'auto',
          borderRadius: 14,
          background: 'rgba(20,20,24,0.95)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.13)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          zIndex: 10,
          padding: '6px 0',
        }}>
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '10px 14px',
                fontSize: 13,
                color: selected === opt ? '#fff' : 'rgba(255,255,255,0.6)',
                background: selected === opt ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = selected === opt ? 'rgba(255,255,255,0.08)' : 'transparent'; }}
            >
              {renderOption(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CreatorSignupForm({ onBack }: Props) {
  const [focused, setFocused] = useState<string | null>(null);
  const [birthDay, setBirthDay] = useState<number | null>(null);
  const [birthMonth, setBirthMonth] = useState<number | null>(null);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [cguOpen, setCguOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    phoneOrEmail: '',
    password: '',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const fieldsTop = [
    { key: 'username', placeholder: "Nom d'utilisateur", type: 'text' },
    { key: 'lastName', placeholder: 'Nom', type: 'text' },
    { key: 'firstName', placeholder: 'Prénom', type: 'text' },
    { key: 'phoneOrEmail', placeholder: 'Numéro de téléphone ou adresse e-mail', type: 'text' },
  ];

  const fieldsBottom = [
    { key: 'password', placeholder: 'Mot de passe', type: 'password' },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: 380,
      position: 'relative',
      zIndex: 1,
    }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 14,
          cursor: 'pointer',
          marginBottom: 28,
          padding: 0,
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
      >
        <ArrowLeft size={16} />
        Retour
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 400,
          color: '#fff',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          Créer un compte Créateur
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fieldsTop.map(({ key, placeholder, type }) => (
          <input
            key={key}
            type={type}
            placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={e => update(key, e.target.value)}
            onFocus={() => setFocused(key)}
            onBlur={() => setFocused(null)}
            style={{
              ...inputBase,
              ...(focused === key ? glassFocus : glass),
            }}
          />
        ))}

        <div>
          <p style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.45)',
            margin: '4px 0 8px 2px',
          }}>
            Date de naissance
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <BirthDropdown
              label="Jour"
              value={birthDay}
              options={days}
              renderOption={(d) => String(d)}
              onChange={(v) => setBirthDay(v as number)}
            />
            <BirthDropdown
              label="Mois"
              value={birthMonth}
              options={months.map((_, i) => i)}
              renderOption={(m) => months[m as number]}
              onChange={(v) => setBirthMonth(v as number)}
            />
            <BirthDropdown
              label="Année"
              value={birthYear}
              options={years}
              renderOption={(y) => String(y)}
              onChange={(v) => setBirthYear(v as number)}
            />
          </div>
        </div>

        {fieldsBottom.map(({ key, placeholder, type }) => (
          <input
            key={key}
            type={type}
            placeholder={placeholder}
            value={form[key as keyof typeof form]}
            onChange={e => update(key, e.target.value)}
            onFocus={() => setFocused(key)}
            onBlur={() => setFocused(null)}
            style={{
              ...inputBase,
              ...(focused === key ? glassFocus : glass),
            }}
          />
        ))}

        <div
          style={{
            ...glass,
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div
            onClick={() => setCguAccepted(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div style={{
              width: 20,
              height: 20,
              minWidth: 20,
              borderRadius: 6,
              border: cguAccepted ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
              background: cguAccepted ? '#F97316' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              marginTop: 1,
            }}>
              {cguAccepted && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.5,
            }}>
              J'accepte les{' '}
              <span style={{ color: '#F97316', fontWeight: 500 }}>
                Conditions Générales d'Utilisation
              </span>
              {' '}de Graply et certifie avoir au moins 18 ans.
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
              onClick={e => { e.stopPropagation(); setCguOpen(true); }}
            >
              Lire les CGU
            </span>
          </div>
        </div>
      </div>

      <button style={{
        width: '100%',
        padding: '15px 18px',
        borderRadius: 14,
        marginTop: 20,
        fontSize: 15,
        fontWeight: 600,
        color: '#000',
        background: '#fff',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
        transition: 'all 0.2s ease',
      }}>
        S'inscrire
      </button>

      <CguModal open={cguOpen} onClose={() => setCguOpen(false)} />
    </div>
  );
}
