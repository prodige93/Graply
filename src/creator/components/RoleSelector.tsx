import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import grapeYellowImg from '@/shared/assets/grape-yellow.png';
import CreatorSignupForm from './CreatorSignupForm';
import EnterpriseSignupForm from './EnterpriseSignupForm';
import { supabase } from '@/shared/infrastructure/supabase';

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

function RoleSelectionView({ onBack, onSelectCreator, onSelectEnterprise }: { onBack: () => void; onSelectCreator: () => void; onSelectEnterprise: () => void }) {
  const [hovered, setHovered] = useState<'creator' | 'enterprise' | null>(null);

  return (
    <div style={{
      width: '100%',
      maxWidth: 420,
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 400,
        color: '#fff',
        letterSpacing: '-0.02em',
        marginBottom: 40,
        textAlign: 'center',
      }}>
        S'inscrire en tant que
      </h1>

      <div style={{
        display: 'flex',
        gap: 20,
        width: '100%',
        justifyContent: 'center',
      }}>
        <div
          style={{
            flex: 1,
            maxWidth: 180,
            aspectRatio: '1',
            borderRadius: 20,
            background: hovered === 'creator'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: hovered === 'creator'
              ? '1px solid rgba(255,166,114,0.4)'
              : '1px solid rgba(255,255,255,0.13)',
            boxShadow: hovered === 'creator'
              ? '0 8px 32px rgba(255,166,114,0.15), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 2px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 20,
            transform: hovered === 'creator' ? 'translateY(-4px)' : 'translateY(0)',
          }}
          onClick={onSelectCreator}
          onMouseEnter={() => setHovered('creator')}
          onMouseLeave={() => setHovered(null)}
        >
          <img
            src={grapeYellowImg}
            alt="Créateur"
            style={{
              width: 72,
              height: 72,
              objectFit: 'contain',
            }}
          />
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Créateur
          </span>
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: 180,
            aspectRatio: '1',
            borderRadius: 20,
            background: hovered === 'enterprise'
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px) saturate(180%)',
            WebkitBackdropFilter: 'blur(32px) saturate(180%)',
            border: hovered === 'enterprise'
              ? '1px solid rgba(161,94,255,0.4)'
              : '1px solid rgba(255,255,255,0.13)',
            boxShadow: hovered === 'enterprise'
              ? '0 8px 32px rgba(161,94,255,0.15), inset 0 1px 0 rgba(255,255,255,0.12)'
              : '0 2px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 20,
            transform: hovered === 'enterprise' ? 'translateY(-4px)' : 'translateY(0)',
          }}
          onClick={onSelectEnterprise}
          onMouseEnter={() => setHovered('enterprise')}
          onMouseLeave={() => setHovered(null)}
        >
          <img
            src="/vraisin.png"
            alt="Entreprise"
            style={{
              width: 72,
              height: 72,
              objectFit: 'contain',
            }}
          />
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            letterSpacing: '-0.01em',
          }}>
            Entreprise
          </span>
        </div>
      </div>

      <button
        onClick={onBack}
        style={{
          marginTop: 32,
          fontSize: 14,
          color: 'rgba(255,255,255,0.45)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
      >
        Retour à la connexion
      </button>
    </div>
  );
}

export default function RoleSelector() {
  const [view, setView] = useState<'login' | 'role' | 'creatorSignup' | 'enterpriseSignup' | 'forgotPassword'>('login');
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailFocused, setResetEmailFocused] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleResetPassword() {
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetError('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/connexion`,
    });
    setResetLoading(false);
    if (error) {
      setResetError('Une erreur est survenue. Verifie ton adresse e-mail.');
    } else {
      setResetSent(true);
    }
  }

  useEffect(() => {
    const state = location.state as { openSignup?: string } | null;
    if (state?.openSignup === 'creator') setView('creatorSignup');
    else if (state?.openSignup === 'enterprise') setView('enterpriseSignup');
  }, [location.state]);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setLoginError('Email ou mot de passe incorrect.');
    } else {
      navigate('/home');
    }
  }

  return (
    <div className="role-selector-container" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 48px',
      background: 'rgba(10,10,12,0.6)',
      backdropFilter: 'blur(40px)',
      WebkitBackdropFilter: 'blur(40px)',
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      minHeight: '100%',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(255,120,42,0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      {view === 'enterpriseSignup' ? (
        <EnterpriseSignupForm onBack={() => setView('role')} />
      ) : view === 'creatorSignup' ? (
        <CreatorSignupForm onBack={() => setView('role')} />
      ) : view === 'forgotPassword' ? (
        <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
          {!resetSent ? (
            <>
              <button
                onClick={() => { setView('login'); setResetEmail(''); setResetError(''); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 28,
                  padding: 0, transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Retour
              </button>
              <h1 style={{ fontSize: 26, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>
                Mot de passe oublié
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.6 }}>
                Saisis ton adresse e-mail et on t'enverra un lien pour reinitialiser ton mot de passe.
              </p>
              <input
                type="email"
                placeholder="Adresse e-mail"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                onFocus={() => setResetEmailFocused(true)}
                onBlur={() => setResetEmailFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter') handleResetPassword(); }}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: 14,
                  fontSize: 15,
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                  marginBottom: resetError ? 8 : 16,
                  ...(resetEmailFocused ? glassFocus : glass),
                }}
              />
              {resetError && (
                <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{resetError}</p>
              )}
              <button
                onClick={handleResetPassword}
                disabled={resetLoading || !resetEmail.trim()}
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  cursor: resetLoading || !resetEmail.trim() ? 'not-allowed' : 'pointer',
                  opacity: resetLoading || !resetEmail.trim() ? 0.6 : 1,
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 56, height: 56,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', marginBottom: 10 }}>
                Vérifie ta boite mail
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28, lineHeight: 1.6 }}>
                Un lien de réinitialisation a été envoyé à <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{resetEmail}</span>.
                Vérifie tes spams si tu ne le vois pas.
              </p>
              <button
                onClick={() => { setView('login'); setResetEmail(''); setResetSent(false); setResetError(''); }}
                style={{
                  width: '100%',
                  padding: '15px 18px',
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#000',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                Retour à la connexion
              </button>
              <button
                onClick={() => { setResetSent(false); setResetError(''); }}
                style={{
                  width: '100%',
                  marginTop: 10,
                  padding: '14px 18px',
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.5)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                Renvoyer le lien
              </button>
            </>
          )}
        </div>
      ) : view === 'role' ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
          <RoleSelectionView onBack={() => setView('login')} onSelectCreator={() => setView('creatorSignup')} onSelectEnterprise={() => setView('enterpriseSignup')} />
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
          <h1 className="login-title" style={{
            fontSize: 28,
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: 32,
          }}>
            Se connecter à <span style={{ color: '#ffffff' }}>Graply</span>
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              placeholder="Adresse e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 14,
                fontSize: 15,
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s ease',
                ...(emailFocused ? glassFocus : glass),
                boxSizing: 'border-box',
              }}
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
              style={{
                width: '100%',
                padding: '16px 18px',
                borderRadius: 14,
                fontSize: 15,
                color: '#fff',
                outline: 'none',
                transition: 'all 0.2s ease',
                ...(passwordFocused ? glassFocus : glass),
                boxSizing: 'border-box',
              }}
            />
          </div>

          {loginError && (
            <p style={{ color: '#ef4444', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{loginError}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 14,
              marginTop: 16,
              fontSize: 15,
              fontWeight: 600,
              color: '#000',
              background: '#fff',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 24px rgba(255,255,255,0.15)',
              transition: 'all 0.2s ease',
            }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <p
            onClick={() => { setResetEmail(email); setView('forgotPassword'); }}
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontSize: 14,
              color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            Mot de passe oublié ?
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '28px 0',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 500, letterSpacing: '0.05em' }}>OU</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <button style={{
            width: '100%',
            padding: '15px 18px',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 500,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            ...glass,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

          <button
            onClick={() => setView('role')}
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 14,
              marginTop: 10,
              fontSize: 15,
              fontWeight: 500,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: 'transparent',
              border: '1px solid #fff',
            }}
          >
            Créer un nouveau compte
          </button>

        </div>
      )}

      <div className="mobile-stats" style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        marginTop: 'auto',
        paddingTop: 40,
        position: 'relative',
        zIndex: 1,
      }}>
        {[
          { label: 'Createurs actifs', value: '13K', plusColor: '#A15EFF', plusGlow: '0 0 8px rgba(161,94,255,0.8), 0 0 20px rgba(161,94,255,0.4)' },
          { label: 'Campagnes actives', value: '1000', plusColor: '#FFFFFF', plusGlow: '0 0 8px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.4)' },
          { label: 'Verses aux createurs', value: '2M€', plusColor: '#FFA672', plusGlow: '0 0 8px rgba(255,166,114,0.8), 0 0 20px rgba(255,166,114,0.4)' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' as const }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: stat.plusColor, textShadow: stat.plusGlow, lineHeight: 1 }}>+</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
