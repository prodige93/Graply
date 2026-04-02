import type { AuthError } from '@supabase/supabase-js';

/** Format e-mail minimal (un compte Graply = une adresse e-mail côté Supabase Auth). */
export function isValidSignupEmail(raw: string): boolean {
  const s = raw.trim();
  if (!s || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export const SIGNUP_EMAIL_INVALID_MESSAGE =
  'Un seul compte est autorisé par adresse e-mail. Saisis une adresse e-mail valide.';

export const SIGNUP_EMAIL_ALREADY_USED_MESSAGE =
  'Un compte existe déjà avec cette adresse e-mail. Connecte-toi ou utilise « Mot de passe oublié ».';

/** Interprète les réponses Supabase quand l’e-mail existe déjà (formulations variables selon versions). */
export function mapSignUpAuthError(err: AuthError): string {
  const m = (err.message || '').toLowerCase();
  if (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already registered') ||
    m.includes('email address is already') ||
    m.includes('email already') ||
    (m.includes('already exists') && (m.includes('user') || m.includes('email') || m.includes('account')))
  ) {
    return SIGNUP_EMAIL_ALREADY_USED_MESSAGE;
  }
  return err.message || 'Inscription impossible. Réessaie plus tard.';
}
