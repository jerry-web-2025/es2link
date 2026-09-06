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

export function TermsPage() {
  const { theme, toggle } = usePageTheme();

  return (
    <PageLayout theme={theme} onToggleTheme={toggle} title="Terms of Service">
      <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Last updated: September 6, 2026</p>

      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Es2LINK web application (the &ldquo;Service&rdquo;). By using the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <Section title="Description of the service">
        <p>
          Es2LINK is a browser-based tool that extracts usable links from screenshots and images. It scans images for visible web URLs and QR codes using client-side processing and presents the detected links for you to copy or open.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>
          You agree to use Es2LINK only for lawful purposes. You must not use the Service to process images you do not have the right to analyze, or to attempt to access, disrupt, or reverse-engineer the Service beyond its intended functionality.
        </p>
      </Section>

      <Section title="Limitations of URL, OCR, and QR extraction">
        <p>
          Es2LINK's extraction capabilities depend on image quality, text clarity, contrast, and QR-code legibility. The Service may not detect all links, may produce incomplete results, and may occasionally misinterpret text as a URL. OCR and QR decoding are inherently imperfect technologies. Es2LINK does not guarantee that every link in an image will be found.
        </p>
      </Section>

      <Section title="External links">
        <p>
          Links detected by Es2LINK point to third-party websites. Es2LINK does not control, endorse, or take responsibility for the content, safety, or legality of those sites. You access external links at your own risk.
        </p>
      </Section>

      <Section title="User responsibility">
        <p>
          You are solely responsible for the images you process and for the links you choose to open. Exercise caution when visiting unknown or untrusted URLs. Es2LINK is a tool to assist extraction; it does not verify the safety of any detected link.
        </p>
      </Section>

      <Section title="Service availability">
        <p>
          The Service is provided &ldquo;as is&rdquo; and may be modified, suspended, or discontinued at any time without notice. We do not guarantee uninterrupted or error-free access to the Service.
        </p>
      </Section>

      <Section title="No guarantee of accuracy or link safety">
        <p>
          Es2LINK does not warrant that detected links are accurate, valid, or safe. URLs extracted from images may be outdated, malformed, or point to malicious content. Always use your own judgment before opening any link.
        </p>
      </Section>

      <Section title="Limitation of responsibility">
        <p>
          To the maximum extent permitted by applicable law, Es2LINK shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from your use of the Service, including but not limited to the opening of detected links, the failure to detect a link, or the misinterpretation of image content.
        </p>
      </Section>

      <Section title="Changes to the service">
        <p>
          We reserve the right to modify or discontinue the Service, or update these Terms, at any time. Updated Terms will be posted on this page with a revised date. Continued use of the Service after changes constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have questions about these Terms, contact us at <a href={`mailto:${EMAIL}`} className="font-medium underline" style={{ color: 'var(--primary)' }}>{EMAIL}</a>.
        </p>
      </Section>
    </PageLayout>
  );
}
