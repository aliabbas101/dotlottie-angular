import { NgModule } from '@angular/core';
import { DotLottieComponent } from './dotlottie.component';
import { DotLottieDirective } from './dotlottie.directive';

/**
 * `DotLottieModule` — convenience NgModule for applications that are NOT using
 * Angular's standalone component model.
 *
 * Import this once in your `AppModule` (or a shared feature module):
 *
 * ```ts
 * @NgModule({
 *   imports: [DotLottieModule],
 * })
 * export class AppModule {}
 * ```
 *
 * For standalone-first apps you can import `DotLottieComponent` and
 * `DotLottieDirective` directly in the `imports` array of your component.
 */
@NgModule({
  imports: [DotLottieComponent, DotLottieDirective],
  exports: [DotLottieComponent, DotLottieDirective],
})
export class DotLottieModule {}
