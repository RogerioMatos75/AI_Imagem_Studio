export enum Mode {
  Create = 'create',
  Edit = 'edit',
}

export enum CreateFunction {
  Free = 'free',
  Sticker = 'sticker',
  Text = 'text',
  Comic = 'comic',
  Skeleton = 'skeleton',
  Miniature = 'miniature',
  Colmap = 'colmap',
  Animate = 'animate',
}

export enum EditFunction {
  AddRemove = 'add-remove',
  Retouch = 'retouch',
  Style = 'style',
  Compose = 'compose',
}

export type OrthoView = 'front' | 'back' | 'side_left' | 'side_right';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface ImageFile {
    base64: string;
    mimeType: string;
}