import type { DotLottie } from '@lottiefiles/dotlottie-web';

// ─── Layout ───────────────────────────────────────────────────────────────────

export type Fit = 'contain' | 'cover' | 'fill' | 'fit-width' | 'fit-height' | 'none';

export interface Layout {
  fit: Fit;
  /** Normalised [x, y] alignment, both in range [0, 1]. Default [0.5, 0.5]. */
  align: [number, number];
}

// ─── RenderConfig ─────────────────────────────────────────────────────────────

export interface RenderConfig {
  autoResize?: boolean;
  devicePixelRatio?: number;
  freezeOnOffscreen?: boolean;
}

// ─── Mode ─────────────────────────────────────────────────────────────────────

export type Mode = 'forward' | 'reverse' | 'bounce' | 'reverse-bounce';

// ─── Component inputs ─────────────────────────────────────────────────────────

export interface DotLottieInputs {
  /** URL or data-URI of the .lottie or .json animation. */
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  /** Background colour passed to the canvas (CSS colour string). */
  backgroundColor?: string;
  mode?: Mode;
  /** [startFrame, endFrame] segment to play. */
  segment?: [number, number];
  useFrameInterpolation?: boolean;
  renderConfig?: RenderConfig;
  layout?: Layout;
  /** For multi-animation .lottie files. */
  animationId?: string;
  /** Activate a theme embedded in the .lottie manifest. */
  themeId?: string;
  /** stateMachineId to start automatically after load. */
  stateMachineId?: string;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/** Union of all event names emitted by DotLottie. */
export type DotLottieEventName =
  | 'load'
  | 'loadError'
  | 'ready'
  | 'play'
  | 'pause'
  | 'stop'
  | 'complete'
  | 'loop'
  | 'frame'
  | 'render'
  | 'destroy'
  | 'freeze'
  | 'unfreeze'
  | 'stateMachineStart'
  | 'stateMachineStop'
  | 'stateMachineTransition'
  | 'stateMachineStateEntered'
  | 'stateMachineBooleanInputValueChange'
  | 'stateMachineNumericInputValueChange';

/** Re-export the DotLottie instance type for consumers. */
export type { DotLottie };
