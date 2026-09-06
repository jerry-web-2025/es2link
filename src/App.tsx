import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, RefreshCw, X, Scan, Image as ImageIcon, FileText, Link2, ShieldCheck, Sun, Moon, Copy, Check, ExternalLink, Download, ChevronDown, Camera } from 'lucide-react';
import { extractLinks, type LinkDetection } from '@/lib/extractLinks';
import { useTheme, type Theme } from '@/lib/theme';
import { BrandLogo } from '@/components/BrandLogo';
import { PageLayout } from '@/components/PageLayout';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { CameraCapture } from '@/components/CameraCapture';

type Phase = 'idle' | 'preview' | 'scanning' | 'results' | 'empty' | 'error';
type Route = 'home' | 'contact' | 'privacy' | 'terms';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED = 'image/png,image/jpeg,image/webp,image/gif';

function useRoute(): [Route, (route: Route) => void] {
  const parse = (): Route => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (hash === 'contact') return 'contact';
    if (hash === 'privacy') return 'privacy';
    if (hash === 'terms') return 'terms';
    return 'home';
  };
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onHashChange = () => setRoute(parse());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = next === 'home' ? '' : `/${next}`;
    setRoute(next);
    window.scrollTo(0, 0);
  }, []);

  return [route, navigate];
}

function useCopy() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      setCopiedKey(null);
    }
  }, []);
  return { copiedKey, copy };
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

function getProtocol(url: string): string {
  try { return new URL(url).protocol.replace(':', ''); } catch { return ''; }
}

function safeRel(): string {
  return 'noopener noreferrer';
}

function CopyButton({ url, id, copied, onCopy }: { url: string; id: string; copied: boolean; onCopy: () => void }) {
  return (
    <button
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:opacity-50"
      style={{
        background: copied ? 'var(--success)' : 'var(--btn-ghost-bg)',
        color: copied ? '#fff' : 'var(--text-primary)',
        border: `1px solid ${copied ? 'var(--success)' : 'var(--border)'}`,
      }}
      aria-label={copied ? 'Link copied' : 'Copy link'}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ResultCard({ detection, index, onCopy }: { detection: LinkDetection; index: number; onCopy: (url: string, key: string) => void }) {
  const { url, source, rawValue } = detection;
  const domain = getDomain(url);
  const protocol = getProtocol(url);
  const key = `result-${index}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(url, key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sourceColor = source === 'QR code' ? 'var(--accent)' : source === 'URL + QR code' ? 'var(--success)' : 'var(--primary)';

  return (
    <div
      className="group rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: `${sourceColor}1a`, color: sourceColor }}
            >
              {source === 'QR code' && <Scan size={11} />}
              {source === 'URL + QR code' && <Link2 size={11} />}
              {source === 'URL' && <Link2 size={11} />}
              {source}
            </span>
          </div>
          <p className="truncate font-mono text-sm font-medium" style={{ color: 'var(--text-primary)' }} title={url}>
            {url}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {protocol && <span className="uppercase">{protocol}</span>}
            {domain && <span>{domain}</span>}
          </div>
          {rawValue && rawValue !== url && (
            <p className="mt-2 truncate text-xs italic" style={{ color: 'var(--text-tertiary)' }} title={rawValue}>
              Raw: {rawValue}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <CopyButton url={url} id={key} copied={copied} onCopy={handleCopy} />
        <a
          href={url}
          target="_blank"
          rel={safeRel()}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <ExternalLink size={14} />
          Open
        </a>
      </div>
    </div>
  );
}

function ProcessingOverlay({ stage }: { stage: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed animate-spin" style={{ borderColor: 'var(--primary)', animationDuration: '3s' }} />
        <div className="absolute inset-2 flex items-center justify-center rounded-xl" style={{ background: 'var(--primary)' }}>
          <Scan size={20} className="text-white" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{stage}</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Analyzing your image locally</p>
      </div>
    </div>
  );
}

function UploadZone({
  onFile,
  error,
  disabled,
  onUseCamera,
}: {
  onFile: (file: File) => void;
  error: string | null;
  disabled: boolean;
  onUseCamera: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload image"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) { e.preventDefault(); inputRef.current?.click(); } }}
      className="relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 focus:outline-none focus-visible:ring-4 sm:min-h-[340px]"
      style={{
        borderColor: dragOver ? 'var(--primary)' : error ? 'var(--error)' : 'var(--border)',
        background: dragOver ? 'var(--primary-soft)' : 'var(--card-bg)',
        opacity: disabled ? 0.6 : 1,
      }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (disabled) return;
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) onFile(file); e.target.value = ''; }}
      />
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300"
        style={{ background: dragOver ? 'var(--primary)' : 'var(--primary-soft)' }}
      >
        <Upload size={28} style={{ color: dragOver ? '#fff' : 'var(--primary)' }} />
      </div>
      <div>
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Drop a screenshot
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          or click to browse — PNG, JPG, WEBP, GIF up to {MAX_FILE_SIZE / (1024 * 1024)}MB
        </p>
      </div>
      {error && (
        <p className="text-sm font-medium" style={{ color: 'var(--error)' }}>{error}</p>
      )}
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); onUseCamera(); }}
        className="mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--btn-ghost-bg)]"
        style={{ color: 'var(--primary)' }}
      >
        <Camera size={15} />
        Use camera
      </button>
    </div>
  );
}

function PreviewControls({ onScan, onReplace, onRemove, scanning }: {
  onScan: () => void; onReplace: () => void; onRemove: () => void; scanning: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onScan}
        disabled={scanning}
        className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-60"
        style={{ background: 'var(--primary)', color: '#fff' }}
      >
        <Scan size={16} />
        {scanning ? 'Scanning...' : 'Scan'}
      </button>
      <button
        onClick={onReplace}
        disabled={scanning}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50"
        style={{ background: 'var(--btn-ghost-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <RefreshCw size={15} />
        Replace
      </button>
      <button
        onClick={onRemove}
        disabled={scanning}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50"
        style={{ background: 'var(--btn-ghost-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <X size={15} />
        Remove
      </button>
    </div>
  );
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{question}</span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-200"
          style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function HomePage({ theme, toggle, navigate }: { theme: Theme; toggle: () => void; navigate: (route: Route) => void }) {
  const { copiedKey, copy } = useCopy();

  const [phase, setPhase] = useState<Phase>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState('');
  const [detections, setDetections] = useState<LinkDetection[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please use PNG, JPG, WEBP, or GIF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`Image is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setImageElement(img);
      setPhase('preview');
      setDetections([]);
    };
    img.onerror = () => {
      setError('Could not load this image. It may be corrupted.');
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const handleScan = useCallback(async () => {
    if (!imageElement) return;
    setPhase('scanning');
    setStage('Preparing image...');
    try {
      const results = await extractLinks(imageElement, setStage);
      setDetections(results);
      setPhase(results.length > 0 ? 'results' : 'empty');
    } catch {
      setError('Something went wrong during extraction. Please try again.');
      setPhase('error');
    }
  }, [imageElement]);

  const handleReplace = useCallback(() => {
    replaceInputRef.current?.click();
  }, []);

  const handleCameraPhoto = useCallback((file: File) => {
    setCameraOpen(false);
    handleFile(file);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
    setImageElement(null);
    setDetections([]);
    setError(null);
    setPhase('idle');
  }, [imageUrl]);

  const handleNewImage = useCallback((file: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setDetections([]);
    handleFile(file);
  }, [imageUrl, handleFile]);

  const copyAll = useCallback(() => {
    const text = detections.map((d) => d.url).join('\n');
    copy(text, 'all');
  }, [detections, copy]);

  const exportTxt = useCallback(() => {
    const text = detections.map((d) => d.url).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'es2link-results.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [detections]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (phase === 'scanning') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
          }
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [phase, handleFile]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleNewImage(file); e.target.value = ''; }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'var(--border)', background: 'var(--header-bg)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 transition-opacity hover:opacity-80" aria-label="Es2LINK home">
            <BrandLogo theme={theme} compact />
          </button>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#how-it-works" className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--btn-ghost-bg)] sm:inline-block" style={{ color: 'var(--text-secondary)' }}>
              How it works
            </a>
            <a href="#faq" className="hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-[var(--btn-ghost-bg)] sm:inline-block" style={{ color: 'var(--text-secondary)' }}>
              FAQ
            </a>
            <button
              onClick={toggle}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--btn-ghost-bg)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Hero */}
        <section className="pt-12 text-center sm:pt-20">
          <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            Turn screenshots into links.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed sm:text-lg" style={{ color: 'var(--text-secondary)' }}>
            Upload an image or screenshot. Es2LINK finds the URLs and QR-code links inside it.
          </p>
        </section>

        {/* Tool */}
        <section className="mt-10 sm:mt-14">
          {phase === 'idle' && !cameraOpen && (
            <UploadZone onFile={handleFile} onUseCamera={() => setCameraOpen(true)} error={error} disabled={false} />
          )}

          {phase === 'idle' && cameraOpen && (
            <CameraCapture onUsePhoto={handleCameraPhoto} onCancel={() => setCameraOpen(false)} />
          )}

          {phase === 'preview' && imageUrl && (
            <div className="rounded-3xl border p-5 sm:p-8" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex-1 overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                  <img
                    src={imageUrl}
                    alt="Uploaded preview"
                    className="mx-auto max-h-[400px] w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col gap-4 lg:w-64">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    <ImageIcon size={14} />
                    <span>Image ready</span>
                  </div>
                  <PreviewControls onScan={handleScan} onReplace={handleReplace} onRemove={handleRemove} scanning={false} />
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    <ShieldCheck size={12} />
                    <span>Processed locally in your browser</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {phase === 'scanning' && imageUrl && (
            <div className="rounded-3xl border p-5 sm:p-8" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <div className="mb-6 flex justify-center">
                <img src={imageUrl} alt="Scanning" className="max-h-[200px] w-auto rounded-xl object-contain opacity-60" />
              </div>
              <ProcessingOverlay stage={stage} />
            </div>
          )}

          {phase === 'results' && (
            <div>
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {detections.length} {detections.length === 1 ? 'link' : 'links'} found
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>Review, copy, or open each detected link.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyAll}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{ background: copiedKey === 'all' ? 'var(--success)' : 'var(--btn-ghost-bg)', color: copiedKey === 'all' ? '#fff' : 'var(--text-primary)', border: '1px solid var(--border)' }}
                  >
                    {copiedKey === 'all' ? <Check size={15} /> : <Copy size={15} />}
                    {copiedKey === 'all' ? 'Copied all' : 'Copy all'}
                  </button>
                  <button
                    onClick={exportTxt}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{ background: 'var(--btn-ghost-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  >
                    <Download size={15} />
                    Export
                  </button>
                  <button
                    onClick={handleRemove}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                  >
                    <Upload size={15} />
                    New image
                  </button>
                </div>
              </div>
              <div className="grid gap-4">
                {detections.map((d, i) => (
                  <ResultCard key={`det-${i}`} detection={d} index={i} onCopy={copy} />
                ))}
              </div>
            </div>
          )}

          {phase === 'empty' && (
            <div className="rounded-3xl border p-8 text-center sm:p-16" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--bg)' }}>
                <FileText size={28} style={{ color: 'var(--text-tertiary)' }} />
              </div>
              <h2 className="text-xl font-bold">No links found</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                We couldn't detect a usable URL or QR code in this image. Try a clearer screenshot or a higher-resolution image.
              </p>
              <button
                onClick={handleRemove}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                <Upload size={16} />
                Try another image
              </button>
            </div>
          )}

          {phase === 'error' && (
            <div className="rounded-3xl border p-8 text-center sm:p-16" style={{ background: 'var(--card-bg)', borderColor: 'var(--error)' }}>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--error-soft)' }}>
                <X size={28} style={{ color: 'var(--error)' }} />
              </div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {error || 'An unexpected error occurred. Please try again.'}
              </p>
              <button
                onClick={handleRemove}
                className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                <Upload size={16} />
                Try again
              </button>
            </div>
          )}
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mt-20 sm:mt-28">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: <Upload size={22} />, title: '1. Upload', desc: 'Drop or select a screenshot from your device.' },
              { icon: <Scan size={22} />, title: '2. Scan', desc: 'Es2LINK searches for visible URLs and QR codes.' },
              { icon: <Link2 size={22} />, title: '3. Use', desc: 'Copy or open the links instantly.' },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border p-6 text-center" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'var(--primary-soft)' }}>
                  <span style={{ color: 'var(--primary)' }}>{step.icon}</span>
                </div>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-20 sm:mt-28">
          <div className="rounded-3xl border p-8 text-center sm:p-12" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: 'var(--success-soft)' }}>
              <ShieldCheck size={26} style={{ color: 'var(--success)' }} />
            </div>
            <h2 className="text-xl font-bold sm:text-2xl">Private by design</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed sm:text-base" style={{ color: 'var(--text-secondary)' }}>
              Your images are processed locally in your browser and are not uploaded by Es2LINK. No accounts, no tracking, no stored screenshots.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mt-20 sm:mt-28">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Frequently asked questions</h2>
          <div className="mx-auto mt-8 max-w-2xl">
            <FaqItem question="What images can I upload?">
              PNG, JPG/JPEG, WEBP, and GIF files up to {MAX_FILE_SIZE / (1024 * 1024)}MB. Screenshots from phones, desktops, or any device work great.
            </FaqItem>
            <FaqItem question="Can Es2LINK detect QR codes?">
              Yes. Es2LINK scans for QR codes in the image and decodes them. If a QR code contains a URL, it appears as a result alongside any text-based links found.
            </FaqItem>
            <FaqItem question="Can it find multiple links in one screenshot?">
              Yes. If the image contains several URLs or QR codes, all of them are listed. Duplicates are automatically merged.
            </FaqItem>
            <FaqItem question="Are my images uploaded?">
              No. All processing happens in your browser. Your screenshots never leave your device.
            </FaqItem>
            <FaqItem question="Why didn't Es2LINK find my link?">
              Low-resolution images, heavy styling, or low contrast can make text hard to read. Try a clearer or higher-resolution screenshot for better results.
            </FaqItem>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t sm:mt-28" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <button onClick={() => navigate('home')} className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
              <BrandLogo theme={theme} compact />
              <span className="text-lg font-bold tracking-tight">Es2LINK</span>
            </button>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Turn screenshots into links.</p>
            <nav className="flex items-center gap-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <a href="#/privacy" className="transition-colors hover:text-[var(--primary)]">Privacy</a>
              <a href="#/terms" className="transition-colors hover:text-[var(--primary)]">Terms</a>
              <a href="#/contact" className="transition-colors hover:text-[var(--primary)]">Contact</a>
            </nav>
          </div>
          <p className="mt-5 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>© 2026 Es2LINK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  const [route, navigate] = useRoute();

  if (route === 'contact') return <ContactPage />;
  if (route === 'privacy') return <PrivacyPage />;
  if (route === 'terms') return <TermsPage />;

  return <HomePage theme={theme} toggle={toggle} navigate={navigate} />;
}
