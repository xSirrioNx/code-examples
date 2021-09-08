export interface IAnimationConfig {
  textures: IAnimationTexture[];
  meta?: IAnimationMeta;
}

export interface IAnimationMeta {
  app: string;
  version: string;
}

export interface IAnimationTexture {
  image: string;
  format: string;
  size: IFrameSize;
  scale: number;
  frames: IFrameElement[];
}

export interface IFrameElement {
  filename: string;
  rotated: boolean;
  trimmed: boolean;
  sourceSize: IFrameSize;
  spriteSourceSize: ISpriteSourceSize;
  frame: ISpriteSourceSize;
}

export interface ISpriteSourceSize {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface IFrameSize {
  w: number;
  h: number;
}

export interface IFakePlayer {
  name: string;
  image: string;
  isReal: boolean;
  coins?: number;
}

export type TSex = 'male' | 'female';

export interface ILevel {
  id: number;
  name: string;
  coins?: number;
  maxCoins: number;

  completed?: boolean;
  disabled?: boolean;
}

export type TStatus = 'DONE' | 'PROCESSING' | 'FAILED';

export interface IStatusResult {
  status: TStatus;
}

export type TRefreshResult = 'PROCESSING' | 'SEND_TIMEOUT';

export interface IRefreshResult {
  requestId: number;
  result: TRefreshResult;
}
