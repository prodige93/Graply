import { Bell, Megaphone, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'published' | 'approved' | 'rejected' | 'creator_joined' | 'milestone';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const initialNotifications: Notification[] = [
  { id: 'n1', type: 'published', title: 'Campagne publiée', message: 'Votre campagne "iPhone 17 Launch" a été publiée avec succès.', time: 'Il y a 2 minutes', read: false },
  { id: 'n2', type: 'creator_joined', title: 'Nouveau créateur', message: '@maxcreates a rejoint votre campagne "Nike Run Club".', time: 'Il y a 15 minutes', read: false },
  { id: 'n3', type: 'approved', title: 'Vidéo approuvée', message: 'La vidéo de @sarahvibes pour "Samsung Galaxy S25 Ultra" a été approuvée.', time: 'Il y a 1 heure', read: false },
  { id: 'n4', type: 'milestone', title: 'Objectif atteint', message: '"Red Bull Extreme Clips" a dépassé les 10M de vues !', time: 'Il y a 3 heures', read: true },
  { id: 'n5', type: 'rejected', title: 'Vidéo refusée', message: 'La vidéo de @techwithleo pour "Bose QuietComfort" ne respecte pas les règles.', time: 'Il y a 5 heures', read: true },
  { id: 'n6', type: 'published', title: 'Campagne publiée', message: '"WHOOP Athlete Clipping" est maintenant en ligne.', time: 'Il y a 1 jour', read: true },
];

export const notifTypeConfig: Record<Notification['type'], React.ReactNode> = {
  published: <Megaphone className="w-4 h-4 text-white" />,
  approved: <CheckCircle className="w-4 h-4 text-white" />,
  rejected: <AlertTriangle className="w-4 h-4 text-white" />,
  creator_joined: <Users className="w-4 h-4 text-white" />,
  milestone: <Bell className="w-4 h-4 text-white" />,
};
