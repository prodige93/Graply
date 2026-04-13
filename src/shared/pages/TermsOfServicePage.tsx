import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Sidebar from '@/creator/components/Sidebar';

const CONTACT_EMAIL = 'damian.evosmart@gmail.com';

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

export default function TermsOfServicePage() {
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

        <h1 className="text-3xl font-bold text-white mb-2 text-left">Terms of Service</h1>
        <p className="text-sm text-white/45 mb-10">Last updated: March 31, 2024</p>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
          <P>
            By accessing or using this application, you agree to be bound by these <Em>Terms of Service</Em>. If you do
            not agree with these Terms, you <Em>must not use</Em> the service.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">2. Eligibility</h2>
          <P>
            You must be <Em>at least 13 years old</Em> (or the minimum legal age in your jurisdiction) to use this
            service. By using the application, you confirm that you <Em>meet this requirement</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">3. Description of Service</h2>
          <P>
            Our application enables users to connect their <Em>TikTok account</Em> and access authorized data such as
            public profile information and analytics. We reserve the right to <Em>modify, suspend, or discontinue</Em> any
            part of the service <Em>at any time without notice</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">4. Account and Authentication</h2>
          <P>
            Access to certain features requires authentication via <Em>TikTok</Em>. You are responsible for:
          </P>
          <BulletList
            items={[
              <>Maintaining the <Em>security of your account</Em></>,
              <>All activities performed <Em>under your account</Em></>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">5. Acceptable Use</h2>
          <P>You agree not to:</P>
          <BulletList
            items={[
              <>Use the service for <Em>unlawful purposes</Em></>,
              <>Attempt to gain <Em>unauthorized access</Em> to systems or data</>,
              <>Interfere with or <Em>disrupt</Em> the service</>,
              <>
                <Em>Misuse TikTok data</Em> or violate TikTok policies
              </>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">6. TikTok Integration</h2>
          <P>
            This application uses <Em>TikTok&apos;s official APIs</Em> to access user-authorized data. We only access data
            that users <Em>explicitly authorize</Em>.
          </P>
          <P>We are not affiliated with TikTok and are not responsible for:</P>
          <BulletList
            items={[
              <>TikTok <Em>platform changes</Em></>,
              <>TikTok <Em>service interruptions</Em></>,
              <>Any issues <Em>originating from TikTok</Em></>,
            ]}
          />
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">7. Data Usage</h2>
          <P>
            We only process data <Em>necessary to provide</Em> our services.
          </P>
          <P>
            We <Em>do not access</Em> private or restricted data <Em>without user consent</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">8. Intellectual Property</h2>
          <P>
            All content, branding, and features of this application are protected by <Em>intellectual property laws</Em>.
          </P>
          <P>
            You may not <Em>copy, reproduce, or distribute</Em> any part of the service without <Em>prior written consent</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">9. Limitation of Liability</h2>
          <P>To the fullest extent permitted by law, we are not liable for:</P>
          <BulletList
            items={[
              <>Any <Em>indirect or consequential damages</Em></>,
              <><Em>Data loss</Em> or corruption</>,
              <><Em>Service interruptions</Em> or downtime</>,
            ]}
          />
          <P>
            Use of the service is <Em>at your own risk</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">10. Termination</h2>
          <P>
            We reserve the right to <Em>suspend or terminate</Em> your access <Em>at any time</Em>, without prior
            notice, if you <Em>violate these Terms</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">11. Changes to Terms</h2>
          <P>
            We may update these Terms <Em>at any time</Em>. <Em>Continued use</Em> of the service constitutes acceptance of
            the updated Terms.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">12. Governing Law</h2>
          <P>
            These Terms shall be governed by and interpreted in accordance with <Em>applicable laws</Em>.
          </P>
        </Section>

        <Section>
          <h2 className="text-lg font-bold text-white mb-3">13. Contact</h2>
          <P>For any questions regarding these Terms:</P>
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
