import { searchTargetSize, type TargetEncoder } from '../../src/lib/target-size';

/** Fake encoder: size ∝ scale² × (0.2 + quality²). */
function fakeEncoder(fullSize: number): { encode: TargetEncoder<string>; calls: Array<[number, number]> } {
  const calls: Array<[number, number]> = [];
  return {
    calls,
    encode: async (q, s) => {
      calls.push([q, s]);
      const size = Math.round(fullSize * s * s * (0.2 + q * q));
      return { result: `q=${q},s=${s}`, size };
    },
  };
}

describe('searchTargetSize', () => {
  it('returns max quality immediately when it already fits', async () => {
    const { encode, calls } = fakeEncoder(10_000);
    const r = await searchTargetSize(encode, 100_000);
    expect(r.fits).toBe(true);
    expect(r.quality).toBe(0.92);
    expect(r.scale).toBe(1);
    expect(calls).toHaveLength(1);
  });

  it('finds the highest quality under the budget without resizing', async () => {
    const { encode } = fakeEncoder(100_000);
    const r = await searchTargetSize(encode, 60_000);
    expect(r.fits).toBe(true);
    expect(r.size).toBeLessThanOrEqual(60_000);
    expect(r.scale).toBe(1);
    // Theoretical optimum: q = sqrt(0.6 - 0.2) ≈ 0.632
    expect(r.quality).toBeGreaterThan(0.6);
    expect(r.quality).toBeLessThanOrEqual(0.633);
  });

  it('downscales when minimum quality is not enough', async () => {
    const { encode } = fakeEncoder(1_000_000);
    const r = await searchTargetSize(encode, 20_000);
    expect(r.fits).toBe(true);
    expect(r.size).toBeLessThanOrEqual(20_000);
    expect(r.scale).toBeLessThan(1);
    expect(r.attempts).toBeLessThan(40);
  });

  it('reports failure with the smallest result for impossible targets', async () => {
    const encode: TargetEncoder<string> = async () => ({ result: 'x', size: 5000 });
    const r = await searchTargetSize(encode, 100, { maxScaleSteps: 3 });
    expect(r.fits).toBe(false);
    expect(r.size).toBe(5000);
  });

  it('stops when aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const { encode } = fakeEncoder(1000);
    await expect(searchTargetSize(encode, 10, { signal: controller.signal })).rejects.toThrow('Cancelled');
  });
});
