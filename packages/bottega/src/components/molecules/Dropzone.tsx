import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { cn } from '../../lib/utils/cn';

interface DropzoneProps {
  onFile: (file: File, base64: string) => void;
  preview?: string;
  className?: string;
}

/**
 * Dropzone — zona de drop pra foto crua.
 * Princípio: bg Osso, borda dashed Tinta-15, hover Tinta forte.
 * Editorial: "Arraste uma foto" em DM Serif, sub em Cormorant italic.
 */
export function Dropzone({ onFile, preview, className }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onFile(file, base64);
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
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        'bg-osso border-thick border-dashed py-10 px-6 text-center cursor-pointer transition-colors duration-fast',
        over ? 'border-tinta bg-areia/30' : 'border-tinta-15 hover:border-tinta hover:bg-areia/20',
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic"
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
            PNG, JPG ou HEIC · até 10 MB · luz natural lateral é a nossa preferida.
          </div>
        </>
      )}
    </div>
  );
}
