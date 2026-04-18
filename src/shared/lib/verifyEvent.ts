import type { NavigateFunction } from 'react-router-dom';

export const VERIFY_EVENT = 'open-verify-modal';

let verifyNavigate: NavigateFunction | null = null;

/** Enregistré par MobileLayout pour ouvrir la page hub sans passer par un hook dans chaque composant. */
export function setVerifyVideoNavigate(nav: NavigateFunction | null) {
  verifyNavigate = nav;
}

export function openVerifyModal() {
  if (verifyNavigate) {
    verifyNavigate('/verifier-ma-video');
    return;
  }
  window.dispatchEvent(new CustomEvent(VERIFY_EVENT));
}
