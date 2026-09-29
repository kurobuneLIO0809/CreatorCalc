export type CategoryId = 'image' | 'pdf' | 'gif' | 'video' | 'audio' | 'text';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** Planned categories are listed on /tools as "coming later" and have no pages yet. */
  status: 'live' | 'planned';
}

export const categories: Category[] = [
  { id: 'image', name: 'Image tools', description: 'Compress, resize, convert, crop and clean up photos and graphics.', status: 'live' },
  { id: 'pdf', name: 'PDF tools', description: 'Merge, split and organise PDFs in your browser.', status: 'planned' },
  { id: 'gif', name: 'GIF tools', description: 'Make, resize and optimise animated GIFs.', status: 'planned' },
  { id: 'video', name: 'Video tools', description: 'Trim, compress and convert short videos.', status: 'planned' },
  { id: 'audio', name: 'Audio tools', description: 'Convert and trim audio files.', status: 'planned' },
  { id: 'text', name: 'Text & data tools', description: 'Everyday text and data helpers.', status: 'planned' },
];
