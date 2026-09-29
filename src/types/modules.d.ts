declare module 'upng-js' {
  const UPNG: {
    encode(bufs: ArrayBuffer[], w: number, h: number, colors: number, delays?: number[]): ArrayBuffer;
  };
  export default UPNG;
}
