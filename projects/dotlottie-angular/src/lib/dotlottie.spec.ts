import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { DotLottieComponent } from './dotlottie.component';
import { DotLottieDirective } from './dotlottie.directive';
import { DotLottieService } from './dotlottie.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock @lottiefiles/dotlottie-web to avoid loading real WASM and making real network requests
vi.mock('@lottiefiles/dotlottie-web', () => {
  return {
    DotLottie: class MockDotLottie {
      constructor(public config: any) {}
      load = vi.fn();
      setSpeed = vi.fn();
      setLoop = vi.fn();
      setMode = vi.fn();
      setBackgroundColor = vi.fn();
      setUseFrameInterpolation = vi.fn();
      setSegment = vi.fn();
      setLayout = vi.fn();
      setTheme = vi.fn();
      addEventListener = vi.fn();
      destroy = vi.fn();
    }
  };
});

@Component({
  standalone: true,
  imports: [DotLottieComponent],
  template: `
    <dot-lottie
      src="test.lottie"
      [loop]="true"
      [autoplay]="false"
    ></dot-lottie>
  `
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [DotLottieDirective],
  template: `
    <canvas
      dotLottie
      src="test.lottie"
      [loop]="false"
    ></canvas>
  `
})
class TestDirectiveHostComponent {}

describe('dotlottie-angular library', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DotLottieComponent,
        DotLottieDirective,
        TestHostComponent,
        TestDirectiveHostComponent
      ],
      providers: [DotLottieService]
    }).compileComponents();
  });

  describe('DotLottieComponent', () => {
    it('should be created successfully', () => {
      const fixture = TestBed.createComponent(TestHostComponent);
      expect(fixture).toBeDefined();
      fixture.detectChanges();
      const component = fixture.debugElement.query(
        (el) => el.componentInstance instanceof DotLottieComponent
      );
      expect(component).toBeTruthy();
    });
  });

  describe('DotLottieDirective', () => {
    it('should be created successfully on canvas', () => {
      const fixture = TestBed.createComponent(TestDirectiveHostComponent);
      expect(fixture).toBeDefined();
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    });
  });

  describe('DotLottieService', () => {
    it('should be injectable and defined', () => {
      const service = TestBed.inject(DotLottieService);
      expect(service).toBeDefined();
      expect(service.create).toBeDefined();
    });
  });
});
