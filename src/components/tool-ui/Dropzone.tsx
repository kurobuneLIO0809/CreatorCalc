import { t } from '../../i18n/runtime';
import { useEffect, useRef, useState } from 'preact/hooks';

interface DropzoneProps {
  acceptAttr: string;
  multiple: boolean;
  hint: string;
  compact?: boolean;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
}

/**
 * File picker with drag & drop and clipboard paste. Files are handed to the caller as
 * File objects — they are read locally and never submitted anywhere.
 */
export function Dropzone({ acceptAttr, multiple, hint, compact, disabled, onFiles, title }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    // A file dropped outside the zone would otherwise make the browser navigate away.
    const prevent = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    };
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length && !disabled) {
        e.preventDefault();
        onFiles(multiple ? files : files.slice(0, 1));
      }
    };
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
      window.removeEventListener('paste', onPaste);
    };
  }, [onFiles, multiple, disabled]);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      class={`dropzone${compact ? ' dropzone--compact' : ''}${dragging ? ' is-dragging' : ''}${disabled ? ' is-disabled' : ''}`}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
      }}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        if (disabled) return;
        const files = Array.from(e.dataTransfer?.files ?? []);
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        open();
      }}
    >
      <input
        ref={inputRef}
        type="file"
        class="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        accept={acceptAttr}
        multiple={multiple}
        onChange={(e) => {
          const input = e.target as HTMLInputElement;
          const files = Array.from(input.files ?? []);
          input.value = '';
          if (files.length) onFiles(files);
        }}
      />
      {!compact && (
        <svg class="dropzone__icon" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 31V13m0 0-7 7m7-7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M10 29v6a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4v-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
        </svg>
      )}
      {!compact && <p class="dropzone__title">{title ?? (multiple ? t('dz.titleMulti') : t('dz.titleSingle'))}</p>}
      <button type="button" class={`btn ${compact ? 'btn--secondary' : 'btn--primary btn--lg'}`} onClick={open} disabled={disabled}>
        {compact ? (multiple ? t('dz.addMore') : t('dz.chooseOther')) : multiple ? t('dz.chooseMulti') : t('dz.chooseSingle')}
      </button>
      {!compact && <p class="dropzone__hint">{hint}</p>}
    </div>
  );
}
