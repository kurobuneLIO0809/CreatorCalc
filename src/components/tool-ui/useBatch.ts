import { t } from '../../i18n/runtime';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { limits } from '../../config/site';
import type { DetectedFormat } from '../../lib/format';
import { inspectFile, InputError, isAbort, type InputInfo } from '../../services/engine';

export interface ItemResult {
  blob: Blob;
  name: string;
  /** Object URL for preview/download; revoked on reset/re-run. */
  url: string;
  width?: number;
  height?: number;
  notes: string[];
  /** The original file was returned unchanged (e.g. compression would have made it bigger). */
  keptOriginal?: boolean;
  /** Tool-specific values shown in the row (e.g. "Removed: EXIF, XMP"). */
  details?: string[];
  /** false when a target could not be met. */
  success?: boolean;
}

export type ItemStatus = 'pending' | 'processing' | 'done' | 'error';

export interface BatchItem {
  id: string;
  file: File;
  info?: InputInfo;
  /** Rejected during inspection — never processed. */
  invalid?: boolean;
  status: ItemStatus;
  error?: string;
  result?: ItemResult;
}

export type Processor = (item: BatchItem, signal: AbortSignal) => Promise<Omit<ItemResult, 'url'>>;

let counter = 0;
const newId = () => `f${Date.now().toString(36)}${(counter++).toString(36)}`;

export function useBatch(accept: readonly DetectedFormat[], wrongFormatMessage?: (format: DetectedFormat) => string | undefined) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef<BatchItem[]>([]);
  const controllerRef = useRef<AbortController | null>(null);

  const commit = (next: BatchItem[]) => {
    itemsRef.current = next;
    setItems(next);
  };
  const patch = (id: string, change: Partial<BatchItem>) => {
    commit(itemsRef.current.map((it) => (it.id === id ? { ...it, ...change } : it)));
  };
  const revoke = (list: BatchItem[]) => list.forEach((it) => it.result && URL.revokeObjectURL(it.result.url));

  useEffect(() => () => {
    controllerRef.current?.abort();
    revoke(itemsRef.current);
  }, []);

  const addFiles = useCallback(
    async (files: File[], replace = false): Promise<BatchItem[]> => {
      setNotice(null);
      if (replace) {
        controllerRef.current?.abort();
        revoke(itemsRef.current);
        commit([]);
      }
      const room = limits.maxBatchFiles - itemsRef.current.length;
      let accepted = files;
      if (files.length > room) {
        accepted = files.slice(0, Math.max(0, room));
        setNotice(t('batch.tooMany', { max: limits.maxBatchFiles, skipped: files.length - accepted.length }));
      }
      const added: BatchItem[] = [];
      for (const file of accepted) {
        const item: BatchItem = { id: newId(), file, status: 'pending' };
        try {
          item.info = await inspectFile(file, accept);
        } catch (error) {
          item.invalid = true;
          item.status = 'error';
          let message = error instanceof InputError ? error.message : t('batch.unreadable');
          // Offer a friendlier explanation when the file is a valid image of another format.
          if (error instanceof InputError && error.format) message = wrongFormatMessage?.(error.format) ?? message;
          item.error = message;
        }
        added.push(item);
      }
      commit([...itemsRef.current, ...added]);
      return added.filter((it) => !it.invalid);
    },
    [accept, wrongFormatMessage],
  );

  const run = useCallback(async (processor: Processor, only?: BatchItem[]) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const targetIds = new Set((only ?? itemsRef.current).filter((it) => !it.invalid).map((it) => it.id));
    // Reset previous results for items being re-run.
    commit(
      itemsRef.current.map((it) => {
        if (!targetIds.has(it.id)) return it;
        if (it.result) URL.revokeObjectURL(it.result.url);
        return { ...it, status: 'pending', result: undefined, error: undefined };
      }),
    );
    const queue = itemsRef.current.filter((it) => targetIds.has(it.id));
    setRunning(true);
    setProgress({ done: 0, total: queue.length });
    let done = 0;
    for (const item of queue) {
      if (controller.signal.aborted) break;
      if (!itemsRef.current.some((it) => it.id === item.id)) continue;
      patch(item.id, { status: 'processing' });
      try {
        const result = await processor(item, controller.signal);
        if (controller.signal.aborted) break;
        const url = URL.createObjectURL(result.blob);
        patch(item.id, { status: 'done', result: { ...result, url } });
      } catch (error) {
        if (isAbort(error) || controller.signal.aborted) {
          patch(item.id, { status: 'pending' });
          break;
        }
        patch(item.id, { status: 'error', error: error instanceof Error ? error.message : t('batch.failed') });
      }
      done += 1;
      setProgress({ done, total: queue.length });
      // Yield so the UI can repaint between files.
      await new Promise((r) => setTimeout(r, 0));
    }
    if (controllerRef.current === controller) {
      controllerRef.current = null;
      setRunning(false);
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setRunning(false);
    commit(itemsRef.current.map((it) => (it.status === 'processing' ? { ...it, status: 'pending' } : it)));
    setNotice(t('batch.cancelled'));
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    revoke(itemsRef.current);
    commit([]);
    setRunning(false);
    setProgress({ done: 0, total: 0 });
    setNotice(null);
  }, []);

  const remove = useCallback((id: string) => {
    const it = itemsRef.current.find((i) => i.id === id);
    if (it?.result) URL.revokeObjectURL(it.result.url);
    commit(itemsRef.current.filter((i) => i.id !== id));
  }, []);

  return { items, running, progress, notice, setNotice, addFiles, run, cancel, reset, remove, itemsRef };
}
