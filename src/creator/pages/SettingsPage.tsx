import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Check, Mail, Phone, Lock, ChevronLeft, LogOut } from 'lucide-react';
import stripeIcon from '@/shared/assets/stripe-settings-icon.jpeg';
import Sidebar from '../components/Sidebar';
import { supabase } from '@/shared/infrastructure/supabase';

const glassCard = {
  background: 'rgba(255,255,255,0.055)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: '0 8px 48px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.13), inset 0 -1px 0 rgba(0,0,0,0.5)',
};

export default function SettingsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [email, setEmail] = useState('contact@monentreprise.com');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [phone, setPhone] = useState('+33 6 12 34 56 78');
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [stripeConnected, setStripeConnected] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/connexion');
  }

  function saveEmail() {
    if (newEmail.trim()) setEmail(newEmail.trim());
    setEditingEmail(false);
  }

  function savePhone() {
    if (newPhone.trim()) setPhone(newPhone.trim());
    setEditingPhone(false);
  }

  function savePassword() {
    setEditingPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ background: '#050404' }}>
      <Sidebar
        activePage="parametres"
        onOpenSearch={() => {}}
      />

      <main className="flex-1 overflow-y-auto" style={{ background: '#050404' }}>

        <div className="flex items-center gap-3 px-4 pt-4 pb-2 lg:hidden">
          <button
            onClick={() => navigate('/profil')}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>
        </div>

        <div className="p-4 lg:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8">

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white mb-1">Parametres</h1>
          <p className="text-sm text-white font-medium mb-8">Parametres confidentiel</p>

          <div className="rounded-xl p-6 mb-6" style={glassCard}>
            <div className="space-y-0">

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Mail className="w-4 h-4 text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Adresse e-mail</p>
                      {editingEmail ? (
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 transition-colors mt-1 w-full lg:w-64"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                        />
                      ) : (
                        <p className="text-sm text-white mt-0.5">{email}</p>
                      )}
                    </div>
                  </div>
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <button onClick={saveEmail} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]" style={{ background: '#fff' }}>
                        <Check className="w-4 h-4 text-black" />
                      </button>
                      <button onClick={() => setEditingEmail(false)} className="text-xs text-white/40 hover:text-white/70 transition-colors">Annuler</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setNewEmail(email); setEditingEmail(true); }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', paddingBottom: '20px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Phone className="w-4 h-4 text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Numero de telephone</p>
                      {editingPhone ? (
                        <input
                          type="tel"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 transition-colors mt-1 w-full lg:w-64"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === 'Enter') savePhone(); if (e.key === 'Escape') setEditingPhone(false); }}
                        />
                      ) : (
                        <p className="text-sm text-white mt-0.5">{phone}</p>
                      )}
                    </div>
                  </div>
                  {editingPhone ? (
                    <div className="flex items-center gap-2">
                      <button onClick={savePhone} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 hover:brightness-110 active:scale-[0.96]" style={{ background: '#fff' }}>
                        <Check className="w-4 h-4 text-black" />
                      </button>
                      <button onClick={() => setEditingPhone(false)} className="text-xs text-white/40 hover:text-white/70 transition-colors">Annuler</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setNewPhone(phone); setEditingPhone(true); }}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              <div style={{ paddingTop: '20px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Lock className="w-4 h-4 text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Mot de passe</p>
                      {!editingPassword && <p className="text-sm text-white/30 mt-0.5">••••••••</p>}
                    </div>
                  </div>
                  {!editingPassword && (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      Modifier
                    </button>
                  )}
                </div>
                {editingPassword && (
                  <div className="mt-4 ml-12 space-y-3">
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 transition-colors pr-8 pb-1"
                          autoFocus
                        />
                        <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-0 top-0 text-white/30 hover:text-white/60 transition-colors">
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Nouveau mot de passe</label>
                      <div className="relative">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 transition-colors pr-8 pb-1"
                        />
                        <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-0 top-0 text-white/30 hover:text-white/60 transition-colors">
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/40 mb-1 block">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-sm text-white bg-transparent outline-none border-b border-white/20 focus:border-white/50 transition-colors pb-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button onClick={savePassword} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: '#fff', color: '#000' }}>
                        <Check className="w-3 h-3" />
                        Enregistrer
                      </button>
                      <button onClick={() => { setEditingPassword(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="text-xs text-white/40 hover:text-white/70 transition-colors">
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6" style={glassCard}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={stripeIcon} alt="Stripe" className="w-9 h-9 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Compte Stripe</p>
                  <p className="text-sm text-white/50 mt-0.5">
                    {stripeConnected ? 'Connecté' : 'Non connecté'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setStripeConnected(!stripeConnected)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={stripeConnected
                  ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }
                  : { background: '#ffffff', color: '#000' }
                }
              >
                {stripeConnected ? 'Changer le compte' : 'Connecter Stripe'}
              </button>
            </div>
          </div>

        </div>


        </div>

        <div className="flex justify-center py-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.97]"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-red-500">Se déconnecter</span>
          </button>
        </div>
      </main>
    </div>
  );
}

