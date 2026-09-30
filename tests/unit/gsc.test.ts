import { analyze, classify, clusterKey, expectedCtr, parseCsv, toMarkdown, toRecords } from '../../scripts/gsc/analyze.mjs';

const QUERIES = `Top queries,Clicks,Impressions,CTR,Position
compress image to 50kb,12,900,1.33%,11.2
"resize image, keep ratio",3,150,2%,14
passport photo size 35x45,0,420,0%,22.5
pdf merge,1,260,0.38%,31
merge pdf online free,0,180,0%,28
combine pdf files,0,90,0%,35
remove background from image,0,500,0%,45
heic to jpg,0,300,0%,40
webp to jpg,50,400,12.5%,4.1
`;
const PAGES = `Top pages,Clicks,Impressions,CTR,Position
https://wrenfile.pages.dev/tools/webp-to-jpg,50,400,12.5%,4.1
https://wrenfile.pages.dev/tools/image-compressor,5,1200,0.42%,6.5
https://wrenfile.pages.dev/tools/rotate-image,0,0,0%,0
`;

describe('GSC analyzer', () => {
  const queries = toRecords(parseCsv(QUERIES));
  const pages = toRecords(parseCsv(PAGES));

  it('parses GSC CSV exports including quoted commas and percentages', () => {
    expect(queries[1]).toEqual({ key: 'resize image, keep ratio', clicks: 3, impressions: 150, ctr: 0.02, position: 14 });
    expect(pages).toHaveLength(3);
  });

  it('maps queries to existing tools', () => {
    expect(classify('compress image to 50kb')).toBe('compress-image-to-kb');
    expect(classify('remove location from photo')).toBe('remove-exif');
    expect(classify('jpg to pdf')).toBe('image-to-pdf');
    expect(classify('remove background from image')).toBeNull();
    expect(classify('merge pdf online free')).toBeNull();
    expect(classify('passport photo size 35x45')).toBeNull();
    expect(classify('compress passport photo to 20kb')).toBe('compress-image-to-kb');
  });

  it('applies R2, R3 and R4', () => {
    const r = analyze(queries, pages);
    // R2: striking distance queries on existing tools.
    expect(r.improve.map((q: { key: string }) => q.key)).toEqual(['compress image to 50kb', 'resize image, keep ratio']);
    // R3: compressor has 1200 impressions at position 6.5 with 0.42% CTR (< 4%).
    expect(r.ctr.map((p: { key: string }) => p.key)).toEqual(['https://wrenfile.pages.dev/tools/image-compressor']);
    // R4: unmatched clusters above thresholds.
    const clusters = r.candidates.map((c: { cluster: string }) => c.cluster);
    expect(clusters).toContain('background remove');
    // Merge-PDF queries form their own cluster instead of being credited to Image to PDF.
    expect(r.candidates.find((c: { cluster: string }) => c.cluster === 'merge pdf')?.queries.length).toBe(2);
    expect(clusters).toContain('passport photo');
    // R7: zero-impression pages.
    expect(r.noImpressions).toHaveLength(1);
    expect(toMarkdown(r)).toContain('## R4');
  });

  it('expected CTR bands', () => {
    expect(expectedCtr(2)).toBe(0.1);
    expect(expectedCtr(5)).toBe(0.04);
    expect(expectedCtr(9)).toBe(0.02);
    expect(expectedCtr(15)).toBe(0);
    expect(clusterKey('best free passport photo maker online')).toBe('passport photo');
  });
});
