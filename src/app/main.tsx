import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CreatorHomePage from '@/creator/pages/CreatorHomePage.tsx';
import MobileLayout from '@/creator/components/MobileLayout.tsx';
import CampaignsPage from '@/creator/pages/CampaignsPage.tsx';
import CampaignDetailPage from '@/creator/pages/CampaignDetailPage.tsx';
import CreateCampaignPage from '@/creator/pages/CreateCampaignPage.tsx';
import VideoVerificationPage from '@/creator/pages/VideoVerificationPage.tsx';
import MyCampaignsPage from '@/creator/pages/MyCampaignsPage.tsx';
import MyCampaignDetailPage from '@/creator/pages/MyCampaignDetailPage.tsx';
import CreatorVerificationsPage from '@/creator/pages/CreatorVerificationsPage.tsx';
import CreatorAccessValidationPage from '@/creator/pages/CreatorAccessValidationPage.tsx';
import ValidationVideosPage from '@/creator/pages/ValidationVideosPage.tsx';
import MyVideosPage from '@/creator/pages/MyVideosPage.tsx';
import MyApplicationsPage from '@/creator/pages/MyApplicationsPage.tsx';
import DashboardPage from '@/creator/pages/DashboardPage.tsx';
import NotificationsPage from '@/creator/pages/NotificationsPage.tsx';
import MessagingPage from '@/creator/pages/MessagingPage.tsx';
import CreatorSearchPage from '@/creator/pages/CreatorSearchPage.tsx';
import ProfilePage from '@/creator/pages/ProfilePage.tsx';
import EnterprisePage from '@/creator/pages/EnterprisePage.tsx';
import CreatorDetailPage from '@/creator/pages/CreatorDetailPage.tsx';
import UserProfilePage from '@/creator/pages/UserProfilePage.tsx';
import MyAccountPage from '@/creator/pages/MyAccountPage.tsx';
import SettingsPage from '@/creator/pages/SettingsPage.tsx';
import SavedCampaignsPage from '@/creator/pages/SavedCampaignsPage.tsx';
import CreatorValidationsPage from '@/creator/pages/CreatorValidationsPage.tsx';
import LoginPage from '@/creator/pages/LoginPage.tsx';
import LandingPage from '@/creator/pages/LandingPage.tsx';
import EnterpriseAppPage from '@/app/EnterpriseAppPage.tsx';
import AuthGuard from '@/creator/components/AuthGuard.tsx';
import { prefetchProfile } from '@/shared/lib/useProfile';
import { SavedCampaignsProvider } from '@/creator/contexts/SavedCampaignsContext';
import { MyCampaignsProvider } from '@/creator/contexts/MyCampaignsContext';
import { CampaignTabProvider } from '@/creator/contexts/CampaignTabContext';
import './index.css';

prefetchProfile();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SavedCampaignsProvider>
      <MyCampaignsProvider>
        <CampaignTabProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/connexion" element={<LoginPage />} />
              <Route path="/lp" element={<Navigate to="/" replace />} />
              <Route element={<AuthGuard />}>
                <Route path="/app-entreprise/*" element={<EnterpriseAppPage />} />
                <Route element={<MobileLayout />}>
                  <Route path="/home" element={<CreatorHomePage />} />
                  <Route path="/campagnes" element={<CampaignsPage />} />
                  <Route path="/campagne/:id" element={<CampaignDetailPage />} />
                  <Route path="/creer-campagne" element={<CreateCampaignPage />} />
                  <Route path="/modifier-campagne/:id" element={<CreateCampaignPage />} />
                  <Route path="/campagne/:id/verification" element={<VideoVerificationPage />} />
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
          </BrowserRouter>
        </CampaignTabProvider>
      </MyCampaignsProvider>
    </SavedCampaignsProvider>
  </StrictMode>
);
