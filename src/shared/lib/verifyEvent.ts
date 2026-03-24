export const VERIFY_EVENT = 'open-verify-modal'

export function openVerifyModal() {
  window.dispatchEvent(new CustomEvent(VERIFY_EVENT))
}
