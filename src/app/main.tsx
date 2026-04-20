import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/creator/pages/LandingPage.tsx';
import LoginPage from '@/creator/pages/LoginPage.tsx';
import AuthGuard from '@/creator/components/AuthGuard.tsx';
import { SavedCampaignsProvider } from '@/creator/contexts/SavedCampaignsContext';
import { MyCampaignsProvider } from '@/creator/contexts/MyCampaignsContext';
import { CampaignTabProvider } from '@/creator/contexts/CampaignTabContext';
import AppShellFallback from '@/shared/components/AppShellFallback';
import './index.css';

const MobileLayout = lazy(() => import('@/creator/components/MobileLayout.tsx'));
const CampaignsPage = lazy(() => import('@/creator/pages/CampaignsPage.tsx'));
const CampaignDetailPage = lazy(() => import('@/creator/pages/CampaignDetailPage.tsx'));
const CreateCampaignPage = lazy(() => import('@/creator/pages/CreateCampaignPage.tsx'));
const VideoVerificationPage = lazy(() => import('@/creator/pages/VideoVerificationPage.tsx'));
const MyCampaignsPage = lazy(() => import('@/creator/pages/MyCampaignsPage.tsx'));
const MyCampaignDetailPage = lazy(() => import('@/creator/pages/MyCampaignDetailPage.tsx'));
const CreatorVerificationsPage = lazy(() => import('@/creator/pages/CreatorVerificationsPage.tsx'));
const CreatorAccessValidationPage = lazy(() => import('@/creator/pages/CreatorAccessValidationPage.tsx'));
const ValidationVideosPage = lazy(() => import('@/creator/pages/ValidationVideosPage.tsx'));
const MyVideosPage = lazy(() => import('@/creator/pages/MyVideosPage.tsx'));
const MyApplicationsPage = lazy(() => import('@/creator/pages/MyApplicationsPage.tsx'));
const DashboardPage = lazy(() => import('@/creator/pages/DashboardPage.tsx'));
const NotificationsPage = lazy(() => import('@/creator/pages/NotificationsPage.tsx'));
const MessagingPage = lazy(() => import('@/creator/pages/MessagingPage.tsx'));
const CreatorSearchPage = lazy(() => import('@/creator/pages/CreatorSearchPage.tsx'));
const ProfilePage = lazy(() => import('@/creator/pages/ProfilePage.tsx'));
const EnterprisePage = lazy(() => import('@/creator/pages/EnterprisePage.tsx'));
const CreatorDetailPage = lazy(() => import('@/creator/pages/CreatorDetailPage.tsx'));
const UserProfilePage = lazy(() => import('@/creator/pages/UserProfilePage.tsx'));
const MyAccountPage = lazy(() => import('@/creator/pages/MyAccountPage.tsx'));
const SettingsPage = lazy(() => import('@/creator/pages/SettingsPage.tsx'));
const SavedCampaignsPage = lazy(() => import('@/creator/pages/SavedCampaignsPage.tsx'));
const CreatorValidationsPage = lazy(() => import('@/creator/pages/CreatorValidationsPage.tsx'));
const CampaignApplicationPage = lazy(() => import('@/creator/pages/CampaignApplicationPage.tsx'));
const CreatorHomePage = lazy(() => import('@/creator/pages/CreatorHomePage.tsx'));
const EnterpriseAppPage = lazy(() => import('@/app/EnterpriseAppPage.tsx'));
const StripeCallbackPage = lazy(() => import('@/shared/pages/StripeCallbackPage.tsx'));
const SocialCallbackPage = lazy(() => import('@/shared/pages/SocialCallbackPage.tsx'));
const DataDeletionStatusPage = lazy(() => import('@/shared/pages/DataDeletionStatusPage.tsx'));

function RouteFallback() {
  return <AppShellFallback />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SavedCampaignsProvider>
      <MyCampaignsProvider>
        <CampaignTabProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/connexion" element={<LoginPage />} />
                <Route path="/lp" element={<Navigate to="/" replace />} />
                <Route path="/data-deletion-status" element={<DataDeletionStatusPage />} />
                <Route element={<AuthGuard />}>
                  <Route path="/stripe-callback" element={<StripeCallbackPage />} />
                  <Route path="/social-callback" element={<SocialCallbackPage />} />
                  <Route path="/app-entreprise/*" element={<EnterpriseAppPage />} />
                  <Route element={<MobileLayout />}>
                    <Route path="/home" element={<CreatorHomePage />} />
                    <Route path="/campagnes" element={<CampaignsPage />} />
                    <Route path="/campagne/:id" element={<CampaignDetailPage />} />
                    <Route path="/creer-campagne" element={<CreateCampaignPage />} />
                    <Route path="/modifier-campagne/:id" element={<CreateCampaignPage />} />
                    <Route path="/campagne/:id/verification" element={<VideoVerificationPage />} />
                    <Route path="/campagne/:id/candidature" element={<CampaignApplicationPage />} />
                    <Route path="/mes-campagnes" element={<MyCampaignsPage />} />
                    <Route path="/ma-campagne/:id" element={<MyCampaignDetailPage />} />
                    <Route path="/ma-campagne/:id/verifications" element={<CreatorVerificationsPage />} />
                    <Route path="/ma-campagne/:id/validation-createurs" element={<CreatorAccessValidationPage />} />
                    <Route path="/validation-videos" element={<ValidationVideosPage />} />
                    <Route path="/mes-videos" element={<MyVideosPage />} />
                    <Route path="/mes-candidatures" element={<MyApplicationsPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/messagerie" element={<MessagingPage />} />
                    <Route path="/recherche-createurs" element={<CreatorSearchPage />} />
                    <Route path="/profil" element={<ProfilePage />} />
                    <Route path="/entreprise/:id" element={<EnterprisePage />} />
                    <Route path="/createur/:id" element={<CreatorDetailPage />} />
                    <Route path="/u/:username" element={<UserProfilePage />} />
                    <Route path="/mon-compte" element={<MyAccountPage />} />
                    <Route path="/parametres" element={<SettingsPage />} />
                    <Route path="/enregistre" element={<SavedCampaignsPage />} />
                    <Route path="/mes-validations" element={<CreatorValidationsPage />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </CampaignTabProvider>
      </MyCampaignsProvider>
    </SavedCampaignsProvider>
  </StrictMode>,
);
