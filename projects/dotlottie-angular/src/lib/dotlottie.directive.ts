import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import type { DotLottieInputs, Layout, Mode, RenderConfig } from './dotlottie.types';

/**
 * `[dotLottie]` — Directive that attaches a DotLottie player to an existing
 * `<canvas>` element in the host template.
 *
 * Use this when you need full control over the canvas element itself (e.g.
 * custom sizing, `id`, `aria-*` attributes) rather than letting the component
 * manage it.
 *
 * ### Usage
 * ```html
 * <canvas
 *   dotLottie
 *   [src]="'assets/welcome.lottie'"
 *   [loop]="true"
 *   [autoplay]="true"
 *   class="w-32 h-32"
 *   (playerReady)="onReady($event)"
 * ></canvas>
 * ```
 */
@Directive({
  selector: 'canvas[dotLottie]',
  standalone: true,
})
export class DotLottieDirective
  implements OnInit, OnChanges, OnDestroy, DotLottieInputs
{
  // ─── Inputs ───────────────────────────────────────────────────────────────

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

  @Output() playerReady = new EventEmitter<DotLottie>();

  @Output() load            = new EventEmitter<void>();
  @Output() loadError       = new EventEmitter<{ error: Error }>();
  @Output() ready           = new EventEmitter<void>();
  @Output() play            = new EventEmitter<void>();
  @Output() pause           = new EventEmitter<void>();
  @Output() stop            = new EventEmitter<void>();
  @Output() complete        = new EventEmitter<void>();
  @Output() doLoop          = new EventEmitter<{ loopCount: number }>();
  @Output() frame           = new EventEmitter<{ currentFrame: number }>();
  @Output() render          = new EventEmitter<{ currentFrame: number }>();
  @Output() freeze          = new EventEmitter<void>();
  @Output() unfreeze        = new EventEmitter<void>();
  @Output() destroy         = new EventEmitter<void>();

  // ─── Internal ─────────────────────────────────────────────────────────────

  private _player: DotLottie | null = null;

  constructor(private readonly _el: ElementRef<HTMLCanvasElement>) {}

  // ─── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this._initPlayer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._player) return;

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
    this._player?.destroy();
    this._player = null;
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  get player(): DotLottie | null {
    return this._player;
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private _initPlayer(): void {
    this._player = new DotLottie({
      canvas: this._el.nativeElement,
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
    p.addEventListener('load',      ()  => this.load.emit());
    p.addEventListener('loadError', (e) => this.loadError.emit(e as any));
    p.addEventListener('ready',     ()  => this.ready.emit());
    p.addEventListener('play',      ()  => this.play.emit());
    p.addEventListener('pause',     ()  => this.pause.emit());
    p.addEventListener('stop',      ()  => this.stop.emit());
    p.addEventListener('complete',  ()  => this.complete.emit());
    p.addEventListener('loop',      (e) => this.doLoop.emit(e as any));
    p.addEventListener('frame',     (e) => this.frame.emit(e as any));
    p.addEventListener('render',    (e) => this.render.emit(e as any));
    p.addEventListener('freeze',    ()  => this.freeze.emit());
    p.addEventListener('unfreeze',  ()  => this.unfreeze.emit());
    p.addEventListener('destroy',   ()  => this.destroy.emit());
  }
}
