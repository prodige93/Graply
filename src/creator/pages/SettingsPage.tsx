import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Check, Mail, Phone, Lock, ChevronLeft, LogOut, ExternalLink, Unlink } from 'lucide-react';
import DeleteAccountModal from '@/shared/components/DeleteAccountModal';
import SettingsSecurityPrivacySection from '@/shared/components/SettingsSecurityPrivacySection';
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
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [email, setEmail] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [phone, setPhone] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [stripeAccountId, setStripeAccountId] = useState('');
  const [stripeLoading, setStripeLoading] = useState(true);
  const [disconnectingStripe, setDisconnectingStripe] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadStripeStatus() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');
      const { data } = await supabase
        .from('profiles')
        .select('stripe_account_id, phone')
        .eq('id', user.id)
        .maybeSingle();
      if (data?.stripe_account_id) {
        setStripeAccountId(data.stripe_account_id);
      }
      if (data?.phone != null && data.phone !== '') {
        setPhone(data.phone);
      }
      setStripeLoading(false);
    }
    loadStripeStatus();

    const state = location.state as { stripeConnected?: boolean; stripeAccountId?: string } | null;
    if (state?.stripeConnected && state?.stripeAccountId) {
      setStripeAccountId(state.stripeAccountId);
    }
  }, [location.state]);

  function handleConnectStripe() {
    const clientId = import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID;
    if (!clientId) {
      alert('VITE_STRIPE_CONNECT_CLIENT_ID non configuré dans .env');
      return;
    }
    const redirectUri = `${window.location.origin}/stripe-callback`;
    const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${clientId}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}`;
    window.location.href = url;
  }

  async function handleDisconnectStripe() {
    setDisconnectingStripe(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').update({ stripe_account_id: '', updated_at: new Date().toISOString() }).eq('id', user.id);
    }
    setStripeAccountId('');
    setDisconnectingStripe(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/connexion');
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  async function doDeleteAccount() {
    setDeletingAccount(true);
    const { error } = await supabase.rpc('delete_my_account');
    setDeletingAccount(false);
    if (error) {
      alert(`Impossible de supprimer le compte : ${error.message}`);
      return;
    }
    await supabase.auth.signOut();
    navigate('/');
  }

  async function saveEmail() {
    const next = newEmail.trim();
    if (!next) {
      setEditingEmail(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) {
      alert(`Impossible de mettre à jour l’e-mail : ${error.message}`);
      return;
    }
    setEmail(next);
    setEditingEmail(false);
    alert('Si l’adresse change, confirme-la depuis le message envoyé par e-mail.');
  }

  async function savePhone() {
    const next = newPhone.trim();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ phone: next, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      alert(`Impossible d’enregistrer le téléphone : ${error.message}`);
      return;
    }
    setPhone(next);
    setEditingPhone(false);
  }

  async function savePassword() {
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    if (newPassword.length < 8) {
      alert('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const em = user?.email;
    if (!em) {
      alert('Session invalide.');
      return;
    }
    const { error: signErr } = await supabase.auth.signInWithPassword({ email: em, password: currentPassword });
    if (signErr) {
      alert('Mot de passe actuel incorrect.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      alert(`Impossible de mettre à jour le mot de passe : ${error.message}`);
      return;
    }
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

          <div className="rounded-xl p-6 mb-3" style={glassCard}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={stripeIcon} alt="Stripe" className="w-9 h-9 rounded-lg object-cover" />
                <div>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Compte Stripe</p>
                  {stripeLoading ? (
                    <p className="text-sm text-white/30 mt-0.5">Chargement...</p>
                  ) : stripeAccountId ? (
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(34,197,94,0.9)' }}>
                      Connecté <span className="text-white/30 text-xs ml-1">({stripeAccountId})</span>
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 mt-0.5">Non connecté</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stripeAccountId ? (
                  <>
                    <a
                      href={`https://dashboard.stripe.com/${stripeAccountId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-white/10 active:scale-95"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Dashboard
                    </a>
                    <button
                      onClick={handleDisconnectStripe}
                      disabled={disconnectingStripe}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:bg-red-500/10 active:scale-95"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}
                    >
                      <Unlink className="w-3 h-3" />
                      {disconnectingStripe ? '...' : 'Déconnecter'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectStripe}
                    disabled={stripeLoading}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: '#ffffff', color: '#000' }}
                  >
                    Connecter Stripe
                  </button>
                )}
              </div>
            </div>
          </div>

          <SettingsSecurityPrivacySection
            navigate={(path) => navigate(path)}
            onDeleteAccount={() => setDeleteConfirmOpen(true)}
            deletingAccount={deletingAccount}
          />

        </div>


        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-10 px-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={deletingAccount}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.97] disabled:opacity-40 w-full sm:w-auto justify-center"
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

        <DeleteAccountModal
          open={deleteConfirmOpen}
          loading={deletingAccount}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={doDeleteAccount}
        />
      </main>
    </div>
  );
}

