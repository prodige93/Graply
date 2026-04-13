import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '@/creator/components/Sidebar';

const CONTACT_EMAIL = 'damian.evosmart@gmail.com';

/** Mise en évidence du texte juridique important (gras blanc plein). */
function Em({ children }: { children: ReactNode }) {
  return <strong className="font-semibold text-white">{children}</strong>;
}

function BulletList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 leading-relaxed mb-3 marker:text-white/40">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-sm text-white/65 leading-relaxed mb-3 last:mb-0">{children}</p>;
}

function Section({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`mb-0 pb-10 border-b border-white/[0.07] last:border-b-0 last:pb-0 ${className}`}>{children}</section>
  );
}

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/app-entreprise');
  const settingsPath = isEnterprise ? '/app-entreprise/parametres' : '/parametres';

  const body = (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-4 lg:py-10">
      <div className="w-full max-w-2xl mx-auto pb-8">
        <div className="flex items-center gap-3 pb-4 lg:hidden w-full">
          <button
            type="button"
            onClick={() => navigate(settingsPath)}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour aux paramètres</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(settingsPath)}
          className="hidden lg:flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux paramètres
        </button>

        <h1 className="text-3xl font-bold text-white mb-2 text-left">Privacy Policy</h1>
        <p className="text-sm text-white/45 mb-10">Last updated: March 31, 2024</p>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">1. Introduction</h2>
          <P>
            This Privacy Policy explains how we collect, use, and protect your information when you use our application
            and connect your <Em>TikTok account</Em>.
          </P>
          <P>
            We are committed to <Em>protecting your privacy</Em> and ensuring <Em>full transparency</Em> regarding the
            data we process.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">2. Information We Collect</h2>
          <P>When you log in using TikTok, we may collect the following information:</P>
          <BulletList
            items={[
              <><Em>Username</Em></>,
              <><Em>Profile picture</Em></>,
              <><Em>Public profile information</Em></>,
              <>Any data <Em>explicitly authorized by you</Em> via TikTok</>,
            ]}
          />
          <P>
            We only access data that is <Em>strictly necessary</Em> for the functionality of our application.
          </P>
          <P>
            We <Em>do not collect</Em> sensitive personal data without your <Em>explicit consent</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Information</h2>
          <P>We use your data to:</P>
          <BulletList
            items={[
              <><Em>Authenticate</Em> your account securely</>,
              <><Em>Provide access</Em> to our services</>,
              <>Display your <Em>profile information</Em> within the application</>,
              <>Provide <Em>analytics and insights</Em> based on authorized data</>,
              <><Em>Improve</Em> the performance and user experience of our platform</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">4. Legal Basis for Processing</h2>
          <P>We process your data based on:</P>
          <BulletList
            items={[
              <><Em>Your explicit consent</Em> via TikTok authentication</>,
              <><Em>The necessity</Em> to provide our services</>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">5. Data Sharing</h2>
          <P>
            We <Em>do not sell, rent, or trade</Em> your personal data.
          </P>
          <P>
            We may share data <Em>only</Em> in the following cases:
          </P>
          <BulletList
            items={[
              <>When <Em>required by law</Em> or legal obligation</>,
              <>
                With <Em>trusted service providers</Em> (e.g., hosting, infrastructure){' '}
                <Em>strictly necessary</Em> to operate the service
              </>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">6. Data Retention</h2>
          <P>
            We retain your data <Em>only for as long as necessary</Em> to provide our services.
          </P>
          <P>
            <Em>You may request deletion</Em> of your data <Em>at any time</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">7. Data Security</h2>
          <P>
            We implement appropriate <Em>technical and organizational measures</Em> to protect your data against{' '}
            <Em>unauthorized access</Em>, alteration, disclosure, or destruction.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">8. Your Rights</h2>
          <P>
            You have the <Em>right</Em> to:
          </P>
          <BulletList
            items={[
              <><Em>Access</Em> your personal data</>,
              <><Em>Request correction or deletion</Em></>,
              <><Em>Withdraw your consent</Em> at any time</>,
              <><Em>Disconnect</Em> your TikTok account from our application</>,
            ]}
          />
          <p className="text-sm text-white/65 leading-relaxed mt-1">
            To exercise your rights, contact:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-white underline underline-offset-2 hover:text-white">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">9. Children&apos;s Privacy</h2>
          <P>
            Our service is <Em>not intended</Em> for individuals <Em>under the age of 13</Em> (or the minimum legal age
            in your country).
          </P>
          <P>
            We <Em>do not knowingly collect</Em> personal data from children. If we become aware that such data has been
            collected, it will be <Em>deleted promptly</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">10. Third-Party Services</h2>
          <P>
            Our application uses <Em>TikTok&apos;s official APIs</Em> to access user-authorized data.
          </P>
          <P>
            By using our service, you also agree to TikTok&apos;s Terms of Service and Privacy Policy. We are{' '}
            <Em>not responsible</Em> for third-party practices.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">11. Changes to This Policy</h2>
          <P>
            We may update this Privacy Policy <Em>at any time</Em>. Updates will be posted on this page.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">12. Contact</h2>
          <P>If you have any questions regarding this Privacy Policy, you can contact us at:</P>
          <p className="text-sm text-white/65 leading-relaxed">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-semibold text-white underline underline-offset-2 hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <main className="text-white flex-1 overflow-y-auto min-h-0" style={{ background: '#050404' }}>
        {body}
      </main>
    );
  }

  return (
    <div className="h-screen text-white flex overflow-hidden" style={{ background: '#050404' }}>
      <Sidebar activePage="parametres" onOpenSearch={() => {}} />
      <main className="flex-1 overflow-y-auto min-h-0" style={{ background: '#050404' }}>
        {body}
      </main>
    </div>
  );
}
