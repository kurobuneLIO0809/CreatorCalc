/// <reference lib="webworker" />
import { decodeBlob, runPipeline } from './pipeline';
import type { WorkerRequest, WorkerResponse } from './types';

const scope = self as unknown as DedicatedWorkerGlobalScope;

scope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, source, options } = event.data;
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = source instanceof Blob ? await decodeBlob(source) : source;
    const result = await runPipeline(bitmap, options);
    scope.postMessage({ id, ok: true, result } satisfies WorkerResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    scope.postMessage({ id, ok: false, error: message } satisfies WorkerResponse);
  } finally {
    bitmap?.close();
  }
};
