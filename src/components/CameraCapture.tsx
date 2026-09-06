import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Check, RefreshCw, X, AlertTriangle, Video } from 'lucide-react';
import { captureError } from '@/lib/sentry';

interface CameraCaptureProps {
  onUsePhoto: (file: File) => void;
  onCancel: () => void;
}

type CameraState = 'starting' | 'live' | 'captured' | 'error';

type CameraOption = {
  deviceId: string;
  label: string;
};

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function CameraCapture({ onUsePhoto, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [state, setState] = useState<CameraState>('starting');
  const [error, setError] = useState('');
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [selectedCamera, setSelectedCamera] = useState('');

  const closeStream = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async (deviceId?: string) => {
    closeStream();
    setState('starting');
    setError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser. You can upload an image instead.');
      setState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      setCameras(videoInputs);
      setSelectedCamera(deviceId || stream.getVideoTracks()[0]?.getSettings().deviceId || videoInputs[0]?.deviceId || '');
      setState('live');
    } catch (cameraError) {
      const message = cameraError instanceof DOMException && cameraError.name === 'NotAllowedError'
        ? 'Camera permission was denied. You can upload an image instead.'
        : cameraError instanceof DOMException && cameraError.name === 'NotFoundError'
          ? 'No camera was found on this device. You can upload an image instead.'
          : 'We could not start the camera. You can upload an image instead.';
      setError(message);
      setState('error');
      captureError(cameraError, { feature: 'camera', action: 'start' });
    }
  }, [closeStream]);

  useEffect(() => {
    void startCamera();
    return () => {
      closeStream();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [closeStream, startCamera]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setError('This browser could not capture the camera image. You can upload an image instead.');
      setState('error');
      captureError(new Error('Camera capture context unavailable'), { feature: 'camera', action: 'capture' });
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('We could not capture an image from the camera. You can upload an image instead.');
        setState('error');
        captureError(new Error('Camera capture returned no blob'), { feature: 'camera', action: 'capture' });
        return;
      }
      const url = URL.createObjectURL(blob);
      previewUrlRef.current = url;
      setCapturedBlob(blob);
      setCapturedUrl(url);
      closeStream();
      setState('captured');
    }, 'image/jpeg', 0.92);
  }, [closeStream]);

  const retake = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setCapturedBlob(null);
    setCapturedUrl(null);
    void startCamera(selectedCamera || undefined);
  }, [selectedCamera, startCamera]);

  const usePhoto = useCallback(() => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], 'es2link-camera-capture.jpg', { type: 'image/jpeg' });
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setCapturedUrl(null);
    setCapturedBlob(null);
    onUsePhoto(file);
  }, [capturedBlob, onUsePhoto]);

  const cancel = useCallback(() => {
    closeStream();
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    onCancel();
  }, [closeStream, onCancel]);

  return (
    <div className="rounded-3xl border p-5 sm:p-8" style={{ background: 'var(--card-bg)', borderColor: 'var(--border)' }}>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--primary-soft)' }}>
            <Video size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 className="font-semibold">Use camera</h2>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Capture a screenshot or photo</p>
          </div>
        </div>
        <button onClick={cancel} className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--btn-ghost-bg)]" aria-label="Close camera">
          <X size={18} />
        </button>
      </div>

      {state === 'starting' && (
        <div className="flex min-h-[280px] items-center justify-center rounded-2xl" style={{ background: 'var(--bg)' }}>
          <div className="text-center">
            <Camera size={28} className="mx-auto animate-pulse" style={{ color: 'var(--primary)' }} />
            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>Requesting camera access...</p>
          </div>
        </div>
      )}

      {state === 'live' && (
        <>
          <div className="overflow-hidden rounded-2xl" style={{ background: '#000' }}>
            <video ref={videoRef} autoPlay muted playsInline className="aspect-video w-full object-contain" aria-label="Live camera preview" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {cameras.length > 1 ? (
              <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Camera</span>
                <select
                  value={selectedCamera}
                  onChange={(event) => { setSelectedCamera(event.target.value); void startCamera(event.target.value); }}
                  className="rounded-lg border px-2 py-1.5 text-sm outline-none"
                  style={{ borderColor: 'var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)' }}
                  aria-label="Choose camera"
                >
                  {cameras.map((camera) => <option key={camera.deviceId} value={camera.deviceId}>{camera.label}</option>)}
                </select>
              </label>
            ) : <span />}
            <button onClick={capture} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ background: 'var(--primary)', color: '#fff' }}>
              <Camera size={16} />
              Capture
            </button>
          </div>
        </>
      )}

      {state === 'captured' && capturedUrl && (
        <>
          <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--bg)' }}>
            <img src={capturedUrl} alt="Captured camera preview" className="mx-auto max-h-[420px] w-auto object-contain" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            <button onClick={cancel} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium" style={{ background: 'var(--btn-ghost-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <X size={15} />
              Cancel
            </button>
            <button onClick={retake} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium" style={{ background: 'var(--btn-ghost-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <RefreshCw size={15} />
              Retake
            </button>
            <button onClick={usePhoto} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ background: 'var(--primary)', color: '#fff' }}>
              <Check size={16} />
              Use Photo
            </button>
          </div>
        </>
      )}

      {state === 'error' && (
        <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'var(--error)', background: 'var(--error-soft)' }}>
          <AlertTriangle size={28} className="mx-auto" style={{ color: 'var(--error)' }} />
          <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-primary)' }}>{error}</p>
          <button onClick={cancel} className="mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            Use image upload instead
          </button>
        </div>
      )}
    </div>
  );
}
