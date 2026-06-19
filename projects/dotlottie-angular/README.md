# dotlottie-angular

Angular wrapper for [`@lottiefiles/dotlottie-web`](https://github.com/LottieFiles/dotlottie-web) —
the official Rust/WASM-powered Lottie & dotLottie player.

## Files

```
index.ts                      ← public barrel
lib/
  dotlottie.types.ts          ← shared TypeScript types
  dotlottie.component.ts      ← <dot-lottie> standalone component
  dotlottie.directive.ts      ← canvas[dotLottie] standalone directive
  dotlottie.service.ts        ← DotLottieService (imperative / shared instances)
  dotlottie.module.ts         ← NgModule for non-standalone apps
```

---

## Installation

```bash
npm install @lottiefiles/dotlottie-web
# copy the lib/ folder into your project's shared library, e.g. src/lib/dotlottie/
```

---

## Usage

### 1. Component (recommended for most cases)

Drop `<dot-lottie>` anywhere in a template. Size it with Tailwind or plain CSS —
the inner `<canvas>` fills the host element automatically.

```html
<!-- standalone app.component.html -->
<dot-lottie
  src="assets/animations/welcome.lottie"
  [loop]="true"
  [autoplay]="true"
  [speed]="1"
  class="w-36 h-36"
  (playerReady)="onReady($event)"
  (complete)="onComplete()"
></dot-lottie>
```

```ts
// app.component.ts
import { DotLottieComponent } from '@/lib/dotlottie';
import type { DotLottie } from '@/lib/dotlottie';

@Component({
  standalone: true,
  imports: [DotLottieComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  onReady(player: DotLottie) {
    console.log('total frames:', player.totalFrames);
  }

  onComplete() {
    console.log('animation finished');
  }
}
```

### 2. Directive (use on your own `<canvas>`)

Use `canvas[dotLottie]` when you need to own the canvas element directly —
useful for custom `id`, `aria-*`, or fixed pixel dimensions.

```html
<canvas
  dotLottie
  [src]="animSrc"
  [loop]="true"
  [autoplay]="true"
  width="200"
  height="200"
  class="rounded-xl"
  (complete)="onDone()"
></canvas>
```

```ts
import { DotLottieDirective } from '@/lib/dotlottie';

@Component({
  standalone: true,
  imports: [DotLottieDirective],
  template: `...`,
})
export class MyComponent {
  animSrc = 'assets/animations/success.lottie';
}
```

### 3. Service (imperative / shared instances)

Use `DotLottieService` to create and control players from TypeScript —
useful for route-level pre-loading or cross-component control.

```ts
import { DotLottieService } from '@/lib/dotlottie';

@Component({ ... })
export class HeroComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private lottie: DotLottieService) {}

  ngAfterViewInit() {
    this.lottie.create('hero', {
      canvas: this.canvasRef.nativeElement,
      src: 'assets/hero.lottie',
      autoplay: false,
      loop: true,
    });
  }

  play()  { this.lottie.play('hero');  }
  pause() { this.lottie.pause('hero'); }

  ngOnDestroy() {
    this.lottie.destroy('hero');
  }
}
```

### 4. NgModule (non-standalone apps)

```ts
import { DotLottieModule } from '@/lib/dotlottie';

@NgModule({
  imports: [DotLottieModule],
})
export class AppModule {}
```

---

## All Inputs

| Input                    | Type                  | Default       | Description                                   |
|--------------------------|-----------------------|---------------|-----------------------------------------------|
| `src` *(required)*       | `string`              | —             | URL or data-URI of `.lottie` / `.json` file   |
| `autoplay`               | `boolean`             | `true`        | Start playing immediately after load          |
| `loop`                   | `boolean`             | `false`       | Loop the animation                            |
| `speed`                  | `number`              | `1`           | Playback speed multiplier                     |
| `backgroundColor`        | `string`              | `''`          | CSS color string for canvas background        |
| `mode`                   | `Mode`                | `'forward'`   | `forward` / `reverse` / `bounce` / `reverse-bounce` |
| `segment`                | `[number, number]`    | `undefined`   | `[startFrame, endFrame]` to play              |
| `useFrameInterpolation`  | `boolean`             | `true`        | Smooth sub-frame playback                     |
| `renderConfig`           | `RenderConfig`        | `undefined`   | `{ autoResize, devicePixelRatio, freezeOnOffscreen }` |
| `layout`                 | `Layout`              | `undefined`   | `{ fit, align }` — controls canvas layout     |
| `animationId`            | `string`              | `undefined`   | For multi-animation `.lottie` files           |
| `themeId`                | `string`              | `undefined`   | Theme ID from `.lottie` manifest              |
| `stateMachineId`         | `string`              | `undefined`   | State machine to activate after load          |

---

## All Outputs

| Output                                    | Payload                                            |
|-------------------------------------------|----------------------------------------------------|
| `playerReady`                             | `DotLottie` instance                               |
| `load`                                    | `void`                                             |
| `loadError`                               | `{ error: Error }`                                 |
| `ready`                                   | `void`                                             |
| `play`                                    | `void`                                             |
| `pause`                                   | `void`                                             |
| `stop`                                    | `void`                                             |
| `complete`                                | `void`                                             |
| `loop`                                    | `{ loopCount: number }`                            |
| `frame`                                   | `{ currentFrame: number }`                         |
| `render`                                  | `{ currentFrame: number }`                         |
| `freeze`                                  | `void`                                             |
| `unfreeze`                                | `void`                                             |
| `destroy`                                 | `void`                                             |
| `stateMachineStart`                       | `void`                                             |
| `stateMachineStop`                        | `void`                                             |
| `stateMachineTransition`                  | `{ fromState: string; toState: string }`           |
| `stateMachineStateEntered`                | `{ state: string }`                                |
| `stateMachineBooleanInputValueChange`     | `{ inputName, oldValue, newValue: boolean }`       |
| `stateMachineNumericInputValueChange`     | `{ inputName, oldValue, newValue: number }`        |

---

## Accessing the player instance via template reference

```html
<dot-lottie
  #lottie
  src="assets/confetti.lottie"
  [autoplay]="false"
  class="w-24 h-24"
></dot-lottie>

<button (click)="lottie.play_anim()">Play</button>
<button (click)="lottie.pause_anim()">Pause</button>
<button (click)="lottie.seekToFrame(0)">Reset</button>
```
