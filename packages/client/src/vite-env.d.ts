/// <reference types="vite/client" />

declare module 'howler' {
  export class Howl {
    constructor(options: {
      src: string[];
      loop?: boolean;
      volume?: number;
      html5?: boolean;
      autoplay?: boolean;
      onloaderror?: () => void;
      onload?: () => void;
      onend?: () => void;
    });
    play(spriteOrId?: string | number): number;
    stop(id?: number): this;
    pause(id?: number): this;
    fade(from: number, to: number, duration: number, id?: number): this;
    volume(vol?: number, id?: number): this | number;
    loop(loop?: boolean, id?: number): this | boolean;
    unload(): void;
    state(): 'unloaded' | 'loading' | 'loaded';
  }
  export class Howler {
    static volume(vol?: number): number;
    static mute(muted: boolean): void;
  }
}
