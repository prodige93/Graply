import { Routes, Route, Navigate } from 'react-router-dom';
import { MyCampaignsProvider } from '@/enterprise/contexts/MyCampaignsContext';
import { SavedCampaignsProvider } from '@/enterprise/contexts/SavedCampaignsContext';
import { CampaignTabProvider } from '@/enterprise/contexts/CampaignTabContext';
import AppLayout from '@/enterprise/components/AppLayout';
import EnterpriseHomePage from '@/enterprise/pages/EnterpriseHomePage';
import DashboardPage from '@/enterprise/pages/DashboardPage';
import MyCampaignsPage from '@/enterprise/pages/MyCampaignsPage';
import MyCampaignDetailPage from '@/enterprise/pages/MyCampaignDetailPage';
import CreateCampaignPage from '@/enterprise/pages/CreateCampaignPage';
import CampaignsPage from '@/enterprise/pages/CampaignsPage';
import CampaignDetailPage from '@/enterprise/pages/CampaignDetailPage';
import CreatorSearchPage from '@/enterprise/pages/CreatorSearchPage';
import CreatorDetailPage from '@/enterprise/pages/CreatorDetailPage';
import CreatorAccessValidationPage from '@/enterprise/pages/CreatorAccessValidationPage';
import CreatorVerificationsPage from '@/enterprise/pages/CreatorVerificationsPage';
import ValidationVideosPage from '@/enterprise/pages/ValidationVideosPage';
import MessagingPage from '@/enterprise/pages/MessagingPage';
import ProfilePage from '@/enterprise/pages/ProfilePage';
import MyAccountPage from '@/enterprise/pages/MyAccountPage';
import SettingsPage from '@/enterprise/pages/SettingsPage';
import NotificationsPage from '@/enterprise/pages/NotificationsPage';
import SavedCampaignsPage from '@/enterprise/pages/SavedCampaignsPage';
import EnterprisePage from '@/enterprise/pages/EnterprisePage';
import EnterpriseCertificationPage from '@/enterprise/pages/EnterpriseCertificationPage';
import UserProfilePage from '@/enterprise/pages/UserProfilePage';

export default function EnterpriseAppPage() {
  return (
    <MyCampaignsProvider>
      <SavedCampaignsProvider>
        <CampaignTabProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<EnterpriseHomePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
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
