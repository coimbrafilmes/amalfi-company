import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { cn } from '../../lib/utils/cn';

interface DropzoneProps {
  onFile: (file: File, base64: string) => void;
  preview?: string;
  className?: string;
  /** Limite em MB (default: 10) */
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = /^image\/(png|jpeg|jpg|webp|heic|heif)$/i;
const ACCEPTED_EXT = /\.(png|jpe?g|webp|heic|heif)$/i;

/**
 * Dropzone — zona de drop pra foto crua.
 * Princípio: bg Osso, borda dashed Tinta-15, hover Tinta forte.
 * Validação: tipo (PNG/JPG/WEBP/HEIC) + tamanho (default 10 MB).
 */
export function Dropzone({ onFile, preview, className, maxSizeMB = 10 }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (file: File): string | null => {
    const isImage = ACCEPTED_TYPES.test(file.type) || ACCEPTED_EXT.test(file.name);
    if (!isImage) return `formato não aceito (use PNG, JPG, WEBP ou HEIC).`;
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      return `arquivo grande demais (${mb} MB) — máx ${maxSizeMB} MB.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onFile(file, base64);
    };
    reader.onerror = () => {
      setError('falhou ao ler o arquivo. tente outro.');
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'bg-osso border-thick border-dashed py-10 px-6 text-center cursor-pointer transition-colors duration-fast',
          over ? 'border-tinta bg-areia/30' : 'border-tinta-15 hover:border-tinta hover:bg-areia/20',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
          className="hidden"
          onChange={onChange}
        />
        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img src={preview} alt="prévia" className="max-h-48 max-w-full object-contain" />
            <span className="font-editorial italic text-[13px] text-tinta-50">clique pra trocar</span>
          </div>
        ) : (
          <>
            <div className="font-display text-2xl mb-1.5 leading-tight text-tinta">Arraste uma foto.</div>
            <div className="font-editorial italic text-[14px] text-tinta-50">
              PNG, JPG, WEBP ou HEIC · até {maxSizeMB} MB · luz natural lateral é a nossa preferida.
            </div>
          </>
        )}
      </div>
      {error && (
        <div className="mt-3 px-3 py-2 bg-terracota/15 text-tinta font-ui text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
