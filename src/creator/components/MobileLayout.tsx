import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Video, Clock } from 'lucide-react'
import chCircleIcon from '@/shared/assets/creator-hub-mark.svg'
import MobileNav from './MobileNav'
import { getSubmittedVideos } from '@/shared/lib/useCreatorCampaigns'
import { VERIFY_EVENT, openVerifyModal } from '@/shared/lib/verifyEvent'
import VerifyVideoModal from './VerifyVideoModal'

export default function MobileLayout() {
  const navigate = useNavigate()
  const [verifyChoiceOpen, setVerifyChoiceOpen] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)

  useEffect(() => {
    const handler = () => setVerifyModalOpen(true)
    window.addEventListener(VERIFY_EVENT, handler)
    return () => window.removeEventListener(VERIFY_EVENT, handler)
  }, [])

  const pendingVideosCount = getSubmittedVideos().filter((v) => v.status === 'in_review').length

  const handleMobileVerifyClick = () => {
    if (window.innerWidth < 1024) {
      setVerifyChoiceOpen(true)
    } else {
      openVerifyModal()
    }
  }

  return (
    <>
      <Outlet context={{ onVerifyClick: openVerifyModal }} />

      <MobileNav onVerifyClick={handleMobileVerifyClick} />

      {verifyChoiceOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center lg:hidden"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setVerifyChoiceOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl overflow-hidden animate-slide-up"
            style={{
              background: 'rgba(18,17,17,0.98)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 -8px 60px rgba(0,0,0,0.8)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <div className="px-4 pb-6 pt-2">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setVerifyChoiceOpen(false)
                    openVerifyModal()
                  }}
                  className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <img src={chCircleIcon} alt="" className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">Verifier ma video</p>
                    <p className="text-[10px] text-white/35 mt-1">Soumettre une video</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setVerifyChoiceOpen(false)
                    navigate('/validation-videos')
                  }}
                  className="flex-1 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      <Clock className="w-5 h-5 text-white/60" />
                    </div>
                    {pendingVideosCount > 0 && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[9px] font-bold text-white px-1"
                        style={{ background: '#FFA672', boxShadow: '0 2px 8px rgba(255,166,114,0.4)' }}
                      >
                        {pendingVideosCount}
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">En attente</p>
                    <p className="text-[10px] text-white/35 mt-1">Suivi des validations</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {verifyModalOpen && (
        <VerifyVideoModal onClose={() => setVerifyModalOpen(false)} hidePendingBadges />
      )}
    </>
  )
}
