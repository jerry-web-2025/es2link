import jsQR from 'jsqr';
import { createWorker } from 'tesseract.js';

export type DetectionSource = 'URL' | 'QR code' | 'URL + QR code';

export type LinkDetection = {
  url: string;
  source: DetectionSource;
  rawValue?: string;
};

const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{2,5})?(?:[/?#][^\s<>]*)?/gi;

function cleanCandidate(value: string): string {
  return value
    .replace(/[\])}>.,;:!?]+$/g, '')
    .replace(/^[(\[{<]+/g, '')
    .replace(/[|]/g, '')
    .trim();
}

export function normalizeUrl(value: string): string | null {
  const candidate = cleanCandidate(value);
  if (!candidate || /\s/.test(candidate)) return null;

  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes('.') || !parsed.hostname.includes('')) return null;
    return parsed.toString().replace(/\/$/, '') || null;
  } catch {
    return null;
  }
}

function findUrls(text: string): string[] {
  return Array.from(text.matchAll(URL_PATTERN))
    .map((match) => normalizeUrl(match[0]))
    .filter((url): url is string => Boolean(url));
}

function mergeDetections(urls: string[], qrValues: string[]): LinkDetection[] {
  const map = new Map<string, LinkDetection>();
  urls.forEach((url) => map.set(url, { url, source: 'URL' }));

  qrValues.forEach((rawValue) => {
    const url = normalizeUrl(rawValue) ?? findUrls(rawValue)[0];
    if (!url) return;
    const existing = map.get(url);
    map.set(url, {
      url,
      source: existing ? 'URL + QR code' : 'QR code',
      rawValue: rawValue !== url ? rawValue : undefined,
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const priority = (source: DetectionSource) => source === 'QR code' ? 0 : source === 'URL + QR code' ? 1 : 2;
    return priority(a.source) - priority(b.source);
  });
}

async function readQrCodes(image: HTMLImageElement): Promise<string[]> {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
  return result?.data ? [result.data] : [];
}

export async function extractLinks(
  image: HTMLImageElement,
  onStage: (stage: string) => void,
): Promise<LinkDetection[]> {
  onStage('Scanning for QR codes...');
  const qrValues = await readQrCodes(image);

  onStage('Reading visible links...');
  const worker = await createWorker('eng');
  try {
    const { data } = await worker.recognize(image);
    onStage('Checking results...');
    return mergeDetections(findUrls(data.text), qrValues);
  } finally {
    await worker.terminate();
  }
}
