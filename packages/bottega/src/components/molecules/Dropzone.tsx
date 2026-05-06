import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { cn } from '../../lib/utils/cn';
import { resizeImageToBase64 } from '../../lib/utils/resizeImage';

interface DropzoneProps {
  /** Callback recebe os data URIs base64 já redimensionados (max 1024×1024). */
  onFiles: (base64s: string[]) => void;
  previews?: string[];
  className?: string;
  /** Limite de arquivos aceitos no total (default 3). */
  maxFiles?: number;
  /** Limite em MB de cada arquivo no upload (default 12). Resize traz pra ~300-500KB. */
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = /^image\/(png|jpeg|jpg|webp|heic|heif)$/i;
const ACCEPTED_EXT = /\.(png|jpe?g|webp|heic|heif)$/i;

/**
 * Dropzone — aceita até N fotos de referência do produto.
 * Aplica resize client-side (1024×1024 max, JPEG q=0.85) antes de devolver
 * pro form, garantindo que o payload pra Function não estoure limite.
 */
export function Dropzone({
  onFiles,
  previews = [],
  className,
  maxFiles = 3,
  maxSizeMB = 12,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const handleFiles = async (files: FileList | File[]) => {
    const incoming = Array.from(files);
    const slotsLeft = maxFiles - previews.length;
    if (slotsLeft <= 0) {
      setError(`limite de ${maxFiles} fotos atingido. Remova uma pra adicionar outra.`);
      return;
    }
    const slice = incoming.slice(0, slotsLeft);
    setError(null);
    setBusy(true);
    try {
      const out: string[] = [];
      for (const file of slice) {
        const err = validate(file);
        if (err) {
          setError(err);
          continue;
        }
        const resized = await resizeImageToBase64(file);
        out.push(resized);
      }
      if (out.length > 0) {
        onFiles([...previews, ...out]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'falha ao processar imagem');
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (idx: number) => {
    const next = previews.filter((_, i) => i !== idx);
    onFiles(next);
    setError(null);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setOver(false);
    void handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) void handleFiles(e.target.files);
    // Reset input pra permitir re-selecionar o mesmo arquivo
    if (inputRef.current) inputRef.current.value = '';
  };

  const slotsLeft = maxFiles - previews.length;

  return (
    <div className={className}>
      <div
        onClick={() => slotsLeft > 0 && !busy && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          'bg-osso border-thick border-dashed py-8 px-6 text-center transition-colors duration-fast',
          slotsLeft > 0 && !busy ? 'cursor-pointer' : 'cursor-default opacity-60',
          over ? 'border-tinta bg-areia/30' : 'border-tinta-15 hover:border-tinta hover:bg-areia/20',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif,.heic,.heif"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={onChange}
        />
        {previews.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-center gap-3 flex-wrap">
              {previews.map((p, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={p}
                    alt={`prévia ${idx + 1}`}
                    className="h-28 w-28 object-cover border border-tinta-15"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAt(idx);
                    }}
                    aria-label={`remover foto ${idx + 1}`}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-tinta text-osso text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-terracota"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <span className="font-editorial italic text-[13px] text-tinta-50 block">
              {slotsLeft > 0
                ? `clique pra adicionar mais (${slotsLeft} ${slotsLeft === 1 ? 'foto' : 'fotos'} disponíveis)`
                : `${maxFiles} de ${maxFiles} fotos · arraste o × pra remover`}
            </span>
          </div>
        ) : (
          <>
            <div className="font-display text-2xl mb-1.5 leading-tight text-tinta">
              {busy ? 'Processando…' : 'Arraste até 3 fotos.'}
            </div>
            <div className="font-editorial italic text-[14px] text-tinta-50">
              PNG, JPG, WEBP ou HEIC · até {maxSizeMB} MB cada · referências do produto pra geração fiel.
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
