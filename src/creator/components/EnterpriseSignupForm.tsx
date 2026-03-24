import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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

export default function EnterpriseSignupForm({ onBack }: Props) {
  const [focused, setFocused] = useState<string | null>(null);
  const [cguAccepted, setCguAccepted] = useState(false);
  const [cguOpen, setCguOpen] = useState(false);
  const [form, setForm] = useState({
    lastName: '',
    firstName: '',
    emailOrPhone: '',
    password: '',
    companyName: '',
    website: '',
  });

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const fieldsTop = [
    { key: 'lastName', placeholder: 'Nom', type: 'text' },
    { key: 'firstName', placeholder: 'Pr\u00e9nom', type: 'text' },
    { key: 'emailOrPhone', placeholder: 'Adresse e-mail ou num\u00e9ro de t\u00e9l\u00e9phone', type: 'text' },
    { key: 'password', placeholder: 'Mot de passe', type: 'password' },
  ];

  const fieldsBottom = [
    { key: 'companyName', placeholder: "Nom de l'entreprise", type: 'text' },
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
          Créer un compte Entreprise
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
              background: cguAccepted ? '#a15eff' : 'transparent',
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
              <span style={{ color: '#a15eff', fontWeight: 500 }}>
                Conditions Générales d'Utilisation
              </span>
              {' '}de Graply et certifie être autorisé à représenter l'entreprise renseignée.
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

        <div style={{ position: 'relative' }}>
          <input
            type="url"
            placeholder="Site web"
            value={form.website}
            onChange={e => update('website', e.target.value)}
            onFocus={() => setFocused('website')}
            onBlur={() => setFocused(null)}
            style={{
              ...inputBase,
              ...(focused === 'website' ? glassFocus : glass),
            }}
          />
          <span style={{
            position: 'absolute',
            right: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 12,
            fontWeight: 500,
            color: '#a15eff',
            pointerEvents: 'none',
            letterSpacing: '0.02em',
          }}>
            optionnel
          </span>
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
