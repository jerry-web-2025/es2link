import { PageLayout, usePageTheme } from '@/components/PageLayout';

const EMAIL = 'senapojerrykeahii@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function PrivacyPage() {
  const { theme, toggle } = usePageTheme();

  return (
    <PageLayout theme={theme} onToggleTheme={toggle} title="Privacy Policy">
      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last updated: September 6, 2026</p>

      <p>
        This Privacy Policy explains how Es2LINK (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles your information when you use the Es2LINK web application (the &ldquo;Service&rdquo;). Es2LINK is a single-purpose tool that extracts usable links from screenshots and images. Your privacy is central to how the Service is built.
      </p>

      <Section title="What Es2LINK does">
        <p>
          Es2LINK analyzes images you provide for visible web URLs and QR codes. It uses browser-based optical character recognition (OCR) and QR-code decoding to find links, then presents them so you can copy or open them.
        </p>
      </Section>

      <Section title="How uploaded images are processed">
        <p>
          All image processing happens locally in your browser. When you upload or paste an image, it is loaded into your browser's memory and analyzed on your device. The image is not transmitted to any Es2LINK server.
        </p>
      </Section>

      <Section title="Whether processing happens locally">
        <p>
          Yes. OCR and QR-code scanning run entirely in your browser using client-side JavaScript libraries. No server-side processing of your images takes place.
        </p>
      </Section>

      <Section title="What information is collected">
        <p>
          Es2LINK does not require an account and does not collect personal information such as your name, email, or location. The Service does not use cookies for tracking. Your theme preference (light or dark) is stored locally in your browser's local storage.
        </p>
      </Section>

      <Section title="Whether images are stored">
        <p>
          No. Uploaded images are held only in your browser's memory for the duration of your session and are discarded when you close or refresh the page. Es2LINK does not store, save, or retain your images.
        </p>
      </Section>

      <Section title="Whether third-party services receive user data">
        <p>
          No. Your images are not sent to any third-party service. All processing is performed locally. The OCR and QR-decoding libraries are loaded as part of the application and run in your browser.
        </p>
      </Section>

      <Section title="How extracted URLs are handled">
        <p>
          Detected links exist only in your browser session. They are not transmitted, logged, or shared. When you copy a link, it is written to your clipboard locally. When you open a link, your browser navigates to that external address — Es2LINK does not act as an intermediary.
        </p>
      </Section>

      <Section title="Security practices">
        <p>
          Es2LINK treats all extracted URLs as untrusted content. Links are rendered as text, not executed. External links open with <code>noopener</code> and <code>noreferrer</code> attributes to prevent the destination page from accessing the Es2LINK window. The Service does not inject extracted content as HTML.
        </p>
      </Section>

      <Section title="Third-party websites">
        <p>
          Links detected by Es2LINK point to external websites that Es2LINK does not control. Es2LINK is not responsible for the content, privacy practices, or safety of those sites. Exercise caution when visiting unknown links.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>
          Es2LINK is not directed at children under 13 and does not knowingly collect information from children. If you believe a child has provided information to us, please contact us and we will take appropriate action.
        </p>
      </Section>

      <Section title="Policy changes">
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the Service after changes constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have questions about this Privacy Policy, contact us at <a href={`mailto:${EMAIL}`} className="font-medium underline" style={{ color: 'var(--primary)' }}>{EMAIL}</a>.
        </p>
      </Section>
    </PageLayout>
  );
}
