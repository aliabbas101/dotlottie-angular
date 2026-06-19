import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import type {
  DotLottieInputs,
  Layout,
  Mode,
  RenderConfig,
} from './dotlottie.types';

/**
 * `<dot-lottie>` — Angular wrapper for `@lottiefiles/dotlottie-web`.
 *
 * Renders a Lottie or dotLottie animation into an internal `<canvas>`.
 * The host element size drives the canvas dimensions; use CSS to size it.
 *
 * ### Usage
 * ```html
 * <dot-lottie
 *   src="assets/animations/welcome.lottie"
 *   [loop]="true"
 *   [autoplay]="true"
 *   [speed]="1.5"
 *   (playerReady)="onReady($event)"
 *   (complete)="onComplete()"
 * ></dot-lottie>
 * ```
 */
@Component({
  selector: 'dot-lottie',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <canvas
      #canvas
      class="block w-full h-full"
      aria-hidden="true"
    ></canvas>
  `,
  host: {
    class: 'block',
    style: 'display:block',
  },
})
export class DotLottieComponent
  implements AfterViewInit, OnChanges, OnDestroy, DotLottieInputs
{
  // ─── Inputs ───────────────────────────────────────────────────────────────

  /** URL (.lottie or .json) or data-URI. Required. */
  @Input({ required: true }) src!: string;

  @Input() autoplay = true;
  @Input() loop = false;
  @Input() speed = 1;
  @Input() backgroundColor = '';
  @Input() mode: Mode = 'forward';
  @Input() segment?: [number, number];
  @Input() useFrameInterpolation = true;
  @Input() renderConfig?: RenderConfig;
  @Input() layout?: Layout;
  @Input() animationId?: string;
  @Input() themeId?: string;
  @Input() stateMachineId?: string;

  // ─── Outputs ──────────────────────────────────────────────────────────────

  /** Emits the `DotLottie` instance as soon as it is created. */
  @Output() playerReady = new EventEmitter<DotLottie>();

  /** Animation events – matching the DotLottie addEventListener names. */
  @Output() load            = new EventEmitter<void>();
  @Output() loadError       = new EventEmitter<{ error: Error }>();
  @Output() ready           = new EventEmitter<void>();
  @Output() play            = new EventEmitter<void>();
  @Output() pause           = new EventEmitter<void>();
  @Output() stop            = new EventEmitter<void>();
  @Output() complete        = new EventEmitter<void>();
  @Output() doLoop            = new EventEmitter<{ loopCount: number }>();
  @Output() frame           = new EventEmitter<{ currentFrame: number }>();
  @Output() render          = new EventEmitter<{ currentFrame: number }>();
  @Output() freeze          = new EventEmitter<void>();
  @Output() unfreeze        = new EventEmitter<void>();
  @Output() destroy         = new EventEmitter<void>();

  /** State-machine events. */
  @Output() stateMachineStart   = new EventEmitter<void>();
  @Output() stateMachineStop    = new EventEmitter<void>();
  @Output() stateMachineTransition = new EventEmitter<{
    fromState: string;
    toState: string;
  }>();
  @Output() stateMachineStateEntered = new EventEmitter<{ state: string }>();
  @Output() stateMachineBooleanInputValueChange = new EventEmitter<{
    inputName: string;
    oldValue: boolean;
    newValue: boolean;
  }>();
  @Output() stateMachineNumericInputValueChange = new EventEmitter<{
    inputName: string;
    oldValue: number;
    newValue: number;
  }>();

  // ─── Internal ─────────────────────────────────────────────────────────────

  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private _player: DotLottie | null = null;

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this._initPlayer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._player) return;

    // src change → reload entirely
    if (changes['src']) {
      this._player.load({
        src: this.src,
        autoplay: this.autoplay,
        loop: this.loop,
        speed: this.speed,
        backgroundColor: this.backgroundColor || undefined,
        mode: this.mode,
        segment: this.segment,
        useFrameInterpolation: this.useFrameInterpolation,
        renderConfig: this.renderConfig,
        layout: this.layout,
        animationId: this.animationId,
        themeId: this.themeId,
        stateMachineId: this.stateMachineId,
      });
      return;
    }

    // Individual property changes that have runtime setters
    if (changes['speed'])                  this._player.setSpeed(this.speed);
    if (changes['loop'])                   this._player.setLoop(this.loop);
    if (changes['mode'])                   this._player.setMode(this.mode);
    if (changes['backgroundColor'])        this._player.setBackgroundColor(this.backgroundColor);
    if (changes['useFrameInterpolation'])  this._player.setUseFrameInterpolation(this.useFrameInterpolation);
    if (changes['segment'] && this.segment) this._player.setSegment(this.segment[0], this.segment[1]);
    if (changes['layout'] && this.layout)   this._player.setLayout(this.layout);
    if (changes['themeId'] && this.themeId) this._player.setTheme(this.themeId);
  }

  ngOnDestroy(): void {
    this._destroyPlayer();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Direct access to the underlying `DotLottie` instance. */
  get player(): DotLottie | null {
    return this._player;
  }

  play_anim(): void  { this._player?.play(); }
  pause_anim(): void { this._player?.pause(); }
  stop_anim(): void  { this._player?.stop(); }

  /** Seek to a specific frame (0-based). */
  seekToFrame(frame: number): void {
    this._player?.setFrame(frame);
  }

  /** Load a different animation src at runtime. */
  loadSrc(src: string): void {
    this._player?.load({ src });
  }

  /** Switch between animations bundled in a .lottie file. */
  loadAnimation(animationId: string): void {
    this._player?.loadAnimation(animationId);
  }

  /** Apply a theme from the .lottie manifest. */
  setTheme(themeId: string): void {
    this._player?.setTheme(themeId);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private _initPlayer(): void {
    const canvas = this.canvasRef.nativeElement;

    this._player = new DotLottie({
      canvas,
      src: this.src,
      autoplay: this.autoplay,
      loop: this.loop,
      speed: this.speed,
      backgroundColor: this.backgroundColor || undefined,
      mode: this.mode,
      segment: this.segment,
      useFrameInterpolation: this.useFrameInterpolation,
      renderConfig: this.renderConfig,
      layout: this.layout,
      animationId: this.animationId,
      themeId: this.themeId,
      stateMachineId: this.stateMachineId,
    });

    this._bindEvents();
    this.playerReady.emit(this._player);
  }

  private _bindEvents(): void {
    const p = this._player!;

    p.addEventListener('load',            ()  => this.load.emit());
    p.addEventListener('loadError',       (e) => this.loadError.emit(e as any));
    p.addEventListener('ready',           ()  => this.ready.emit());
    p.addEventListener('play',            ()  => this.play.emit());
    p.addEventListener('pause',           ()  => this.pause.emit());
    p.addEventListener('stop',            ()  => this.stop.emit());
    p.addEventListener('complete',        ()  => this.complete.emit());
    p.addEventListener('loop',            (e) => this.doLoop.emit(e as any));
    p.addEventListener('frame',           (e) => this.frame.emit(e as any));
    p.addEventListener('render',          (e) => this.render.emit(e as any));
    p.addEventListener('freeze',          ()  => this.freeze.emit());
    p.addEventListener('unfreeze',        ()  => this.unfreeze.emit());
    p.addEventListener('destroy',         ()  => this.destroy.emit());

    p.addEventListener('stateMachineStart',  () => this.stateMachineStart.emit());
    p.addEventListener('stateMachineStop',   () => this.stateMachineStop.emit());
    p.addEventListener('stateMachineTransition',     (e) => this.stateMachineTransition.emit(e as any));
    p.addEventListener('stateMachineStateEntered',   (e) => this.stateMachineStateEntered.emit(e as any));
    p.addEventListener('stateMachineBooleanInputValueChange', (e) => this.stateMachineBooleanInputValueChange.emit(e as any));
    p.addEventListener('stateMachineNumericInputValueChange', (e) => this.stateMachineNumericInputValueChange.emit(e as any));
  }

  private _destroyPlayer(): void {
    this._player?.destroy();
    this._player = null;
  }
}
