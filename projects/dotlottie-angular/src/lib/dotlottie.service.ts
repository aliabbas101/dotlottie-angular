import { Injectable, OnDestroy } from '@angular/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import type { DotLottieInputs } from './dotlottie.types';

/**
 * `DotLottieService` — optional injectable for managing named DotLottie
 * instances imperatively (outside of the component/directive lifecycle).
 *
 * Useful when you need:
 * - A single shared player across multiple views
 * - Programmatic play/pause from a service layer or route guard
 * - Pre-loading animations before a component mounts
 *
 * All instances registered via `create()` are automatically destroyed when
 * the service itself is destroyed (i.e. when the providing module/component
 * is torn down).
 *
 * ### Usage
 * ```ts
 * // In your component
 * constructor(private lottie: DotLottieService) {}
 *
 * ngAfterViewInit() {
 *   this.lottie.create('hero', {
 *     src: 'assets/hero.lottie',
 *     canvas: this.canvasRef.nativeElement,
 *     autoplay: true,
 *     loop: true,
 *   });
 * }
 *
 * playHero() {
 *   this.lottie.get('hero')?.play();
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class DotLottieService implements OnDestroy {
  private readonly _instances = new Map<string, DotLottie>();

  // ─── Instance management ──────────────────────────────────────────────────

  /**
   * Create and register a named DotLottie instance.
   * If an instance with the same key already exists it is destroyed first.
   *
   * @param key    Unique identifier for this instance.
   * @param config DotLottie constructor config — must include `canvas`.
   */
  create(
    key: string,
    config: DotLottieInputs & { canvas: HTMLCanvasElement | OffscreenCanvas },
  ): DotLottie {
    this.destroy(key); // clean up existing if any

    const instance = new DotLottie({
      canvas: config.canvas,
      src: config.src,
      autoplay: config.autoplay ?? true,
      loop: config.loop ?? false,
      speed: config.speed ?? 1,
      backgroundColor: config.backgroundColor,
      mode: config.mode,
      segment: config.segment,
      useFrameInterpolation: config.useFrameInterpolation,
      renderConfig: config.renderConfig,
      layout: config.layout,
      animationId: config.animationId,
      themeId: config.themeId,
      stateMachineId: config.stateMachineId,
    });

    this._instances.set(key, instance);
    return instance;
  }

  /**
   * Retrieve a previously created instance by key.
   * Returns `undefined` if no instance exists for that key.
   */
  get(key: string): DotLottie | undefined {
    return this._instances.get(key);
  }

  /**
   * Destroy a named instance and remove it from the registry.
   * No-op if the key is not found.
   */
  destroy(key: string): void {
    const instance = this._instances.get(key);
    if (instance) {
      instance.destroy();
      this._instances.delete(key);
    }
  }

  /** Destroy all registered instances. */
  destroyAll(): void {
    this._instances.forEach((instance) => instance.destroy());
    this._instances.clear();
  }

  // ─── Convenience play-control shortcuts ───────────────────────────────────

  play(key: string):  void { this.get(key)?.play(); }
  pause(key: string): void { this.get(key)?.pause(); }
  stop(key: string):  void { this.get(key)?.stop(); }

  /** Set playback speed for a named instance (1 = normal). */
  setSpeed(key: string, speed: number): void {
    this.get(key)?.setSpeed(speed);
  }

  /** Seek to a specific frame for a named instance. */
  seekToFrame(key: string, frame: number): void {
    this.get(key)?.setFrame(frame);
  }

  // ─── Angular lifecycle ────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.destroyAll();
  }
}
