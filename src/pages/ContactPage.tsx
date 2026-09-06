import { Mail, MessageCircle } from 'lucide-react';
import { PageLayout, usePageTheme } from '@/components/PageLayout';

const EMAIL = 'senapojerrykeahii@gmail.com';
const WHATSAPP_NUMBER = '231887567785';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function ContactPage() {
  const { theme, toggle } = usePageTheme();

  return (
    <PageLayout theme={theme} onToggleTheme={toggle} title="Contact Es2LINK">
      <p>
        Have a question, feedback, or need help with Es2LINK? We'd love to hear from you. Reach out using either of the methods below.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${EMAIL}`}
          className="group flex flex-col gap-3 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--primary-soft)' }}>
            <Mail size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Email Us</h3>
            <p className="mt-1 text-sm break-all">{EMAIL}</p>
          </div>
          <span className="mt-1 text-sm font-medium transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--primary)' }}>
            Send an email &rarr;
          </span>
        </a>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-3 rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--success-soft)' }}>
            <MessageCircle size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Message on WhatsApp</h3>
            <p className="mt-1 text-sm">+231 887 567 785</p>
          </div>
          <span className="mt-1 text-sm font-medium transition-colors group-hover:text-[var(--success)]" style={{ color: 'var(--success)' }}>
            Open WhatsApp &rarr;
          </span>
        </a>
      </div>

      <div className="rounded-2xl border p-6" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Response time</h3>
        <p className="text-sm">
          We typically respond within 1–2 business days. For faster replies, WhatsApp is the best channel.
        </p>
      </div>
    </PageLayout>
  );
}
