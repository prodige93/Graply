import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MyCampaignsProvider } from '@/enterprise/contexts/MyCampaignsContext';
import { SavedCampaignsProvider } from '@/enterprise/contexts/SavedCampaignsContext';
import { CampaignTabProvider } from '@/enterprise/contexts/CampaignTabContext';
import AppLayout from '@/enterprise/components/AppLayout';
const EnterpriseHomePage = lazy(() => import('@/enterprise/pages/EnterpriseHomePage'));
const DashboardPage = lazy(() => import('@/enterprise/pages/DashboardPage'));
const MyCampaignsPage = lazy(() => import('@/enterprise/pages/MyCampaignsPage'));
const MyCampaignDetailPage = lazy(() => import('@/enterprise/pages/MyCampaignDetailPage'));
const CreateCampaignPage = lazy(() => import('@/enterprise/pages/CreateCampaignPage'));
const CampaignsPage = lazy(() => import('@/enterprise/pages/CampaignsPage'));
const CampaignDetailPage = lazy(() => import('@/enterprise/pages/CampaignDetailPage'));
const CreatorSearchPage = lazy(() => import('@/enterprise/pages/CreatorSearchPage'));
const CreatorDetailPage = lazy(() => import('@/enterprise/pages/CreatorDetailPage'));
const CreatorAccessValidationPage = lazy(() => import('@/enterprise/pages/CreatorAccessValidationPage'));
const CreatorVerificationsPage = lazy(() => import('@/enterprise/pages/CreatorVerificationsPage'));
const ValidationVideosPage = lazy(() => import('@/enterprise/pages/ValidationVideosPage'));
const MessagingPage = lazy(() => import('@/enterprise/pages/MessagingPage'));
const ProfilePage = lazy(() => import('@/enterprise/pages/ProfilePage'));
const MyAccountPage = lazy(() => import('@/enterprise/pages/MyAccountPage'));
const SettingsPage = lazy(() => import('@/enterprise/pages/SettingsPage'));
const NotificationsPage = lazy(() => import('@/enterprise/pages/NotificationsPage'));
const SavedCampaignsPage = lazy(() => import('@/enterprise/pages/SavedCampaignsPage'));
const EnterprisePage = lazy(() => import('@/enterprise/pages/EnterprisePage'));
const EnterpriseCertificationPage = lazy(() => import('@/enterprise/pages/EnterpriseCertificationPage'));
const UserProfilePage = lazy(() => import('@/enterprise/pages/UserProfilePage'));
const AcceptedCreatorDetailPage = lazy(() => import('@/enterprise/pages/AcceptedCreatorDetailPage'));

export default function EnterpriseAppPage() {
  return (
    <MyCampaignsProvider>
      <SavedCampaignsProvider>
        <CampaignTabProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<EnterpriseHomePage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="createurs-acceptes/:userId" element={<AcceptedCreatorDetailPage />} />
                <Route path="mes-campagnes" element={<MyCampaignsPage />} />
                <Route path="ma-campagne/:id" element={<MyCampaignDetailPage />} />
                <Route path="ma-campagne/:id/verifications" element={<CreatorVerificationsPage />} />
                <Route path="ma-campagne/:id/validation-createurs" element={<CreatorAccessValidationPage />} />
                <Route path="creer-campagne" element={<CreateCampaignPage />} />
                <Route path="modifier-campagne/:id" element={<CreateCampaignPage />} />
                <Route path="campagnes" element={<CampaignsPage />} />
                <Route path="campagne/:id" element={<CampaignDetailPage />} />
                <Route path="recherche-createurs" element={<CreatorSearchPage />} />
                <Route path="createur/:id" element={<CreatorDetailPage />} />
                <Route path="createur/:id/validation" element={<CreatorAccessValidationPage />} />
                <Route path="validation-videos" element={<ValidationVideosPage />} />
                <Route path="messagerie" element={<MessagingPage />} />
                <Route path="profil" element={<ProfilePage />} />
                <Route path="mon-compte" element={<MyAccountPage />} />
                <Route path="parametres" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="enregistre" element={<SavedCampaignsPage />} />
                <Route path="entreprise/:id" element={<EnterprisePage />} />
                <Route path="certification" element={<EnterpriseCertificationPage />} />
                <Route path="certification-entreprise" element={<EnterpriseCertificationPage />} />
                <Route path="u/:username" element={<UserProfilePage />} />
                <Route path="*" element={<Navigate to="/app-entreprise" replace />} />
              </Route>
            </Routes>
        </CampaignTabProvider>
      </SavedCampaignsProvider>
    </MyCampaignsProvider>
  );
}
