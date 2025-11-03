import {
  Component,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { FavoritesProduct } from '../../core/models/product.model';
import { SliderService } from './slider.service';
import { IMAGE_MAP } from '../../core/constants/image-map';
import { take } from 'rxjs';

const SCROLL_TIME = 5000;

interface SliderState {
  position: number;
  currentSlide: number;
  slidesCount: number;
  widthVisible: number;
  autoScrollTime: number;
  remainingTime: number;
  progressStartTime: number;
  isPaused: boolean;
  autoScrollTimeout?: number;
}

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
})
export class SliderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('slider', { static: true }) sliderRef!: ElementRef<HTMLDivElement>;
  @ViewChild('sliderRow', { static: true }) sliderRowRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('control') controlRefs!: QueryList<ElementRef<HTMLElement>>;

  private readonly sliderService = inject(SliderService);
  private readonly cdr = inject(ChangeDetectorRef);

  dataSet: FavoritesProduct[] = [];
  isLoading = signal(true);
  loadError = signal('');

  state: SliderState = {
    position: 0,
    currentSlide: 0,
    slidesCount: 0,
    widthVisible: 0,
    autoScrollTime: SCROLL_TIME,
    remainingTime: SCROLL_TIME,
    progressStartTime: 0,
    isPaused: false,
  };

  private startX = 0;
  private currentX = 0;
  private isSwiping = false;

  ngAfterViewInit(): void {
    this.state.widthVisible = this.sliderRef.nativeElement.offsetWidth;
    this.loadData();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  private loadData(): void {
    this.isLoading.set(true);

    this.sliderService
      .getFavorites<FavoritesProduct>('/products/favorites')
      .then((response) => {
        const dataSet: FavoritesProduct[] = response.data;
        console.log(dataSet);

        this.dataSet = dataSet.map((p) => ({
          ...p,
          image:
            '/assets/img/menu/' + (IMAGE_MAP[p.name as keyof typeof IMAGE_MAP] ?? 'coffee-1.png'),
        }));

        this.state.slidesCount = this.dataSet.length;
        this.isLoading.set(false);

        if (!this.sliderRowRef?.nativeElement) return;
        this.cdr.detectChanges();

        this.state.widthVisible = this.sliderRef.nativeElement.offsetWidth;
        this.state.position = 0;

        const controls = this.controlRefs?.toArray() ?? [];
        if (controls.length > 0) {
          this.finishInitAfterRender();
          return;
        }

        this.controlRefs.changes.pipe(take(1)).subscribe(() => {
          this.cdr.detectChanges();
          this.finishInitAfterRender();
        });
      })
      .catch(() => {
        this.loadError.set('Something went wrong. Please, refresh the page.');
        this.isLoading.set(false);
        this.dataSet = [];

        this.cdr.detectChanges(); // to show error message
      });
  }

  private finishInitAfterRender(): void {
    if (!this.sliderRowRef?.nativeElement) return;

    this.state.widthVisible = this.sliderRef.nativeElement.offsetWidth;
    this.state.position = 0;

    if (this.dataSet.length > 0) {
      this.resetProgress();
      this.updateControls();
      this.startAutoScroll();
    }
  }

  private getStep(): number {
    const section = this.sliderRowRef.nativeElement;
    const cards = section.querySelectorAll<HTMLElement>('.slider-card');
    if (!cards || cards.length === 0) return 0;
    const style = window.getComputedStyle(this.sliderRef.nativeElement);
    const gap = parseInt(style.gap || '0', 10);
    return cards[0].offsetWidth + gap;
  }

  private updateControls(): void {
    const controls = this.controlRefs.toArray();
    controls.forEach((cRef, i) => {
      const el = cRef.nativeElement;
      if (i === this.state.currentSlide) {
        el.classList.add('slider-control-activ');
      } else {
        el.classList.remove('slider-control-activ');
        const pb = el.querySelector<HTMLElement>('.slider-progress');
        if (pb) {
          pb.style.transition = 'none';
          pb.style.width = '0%';
        }
      }
    });
  }

  private resetProgress(): void {
    this.state.remainingTime = this.state.autoScrollTime;
    this.state.isPaused = false;
    this.controlRefs.forEach((cRef) => {
      const progressBar = cRef.nativeElement.querySelector<HTMLElement>('.slider-progress');
      if (progressBar) {
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
      }
    });
  }

  private startProgress(): void {
    if (this.state.isPaused) return;
    const controls = this.controlRefs.toArray();
    const active = controls[this.state.currentSlide];
    if (!active) return;
    const progressBar = active.nativeElement.querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;

    const duration = this.state.remainingTime || this.state.autoScrollTime;
    progressBar.style.transition = 'none';
    void progressBar.offsetWidth; // force reflow
    progressBar.style.transition = `width ${duration}ms linear`;
    progressBar.style.width = '100%';
    this.state.progressStartTime = Date.now();
  }

  private stopAutoScroll(): void {
    if (this.state.autoScrollTimeout) {
      clearTimeout(this.state.autoScrollTimeout);
      this.state.autoScrollTimeout = undefined;
    }
  }

  private startAutoScroll(): void {
    this.stopAutoScroll();
    if (this.state.isPaused) return;
    this.resetProgress();
    this.startProgress();
    this.state.autoScrollTimeout = window.setTimeout(() => this.right(), this.state.remainingTime);
  }

  right(): void {
    this.stopAutoScroll();
    const step = this.getStep();
    if (this.state.slidesCount === 0 || step === 0) return;
    this.state.currentSlide = (this.state.currentSlide + 1) % this.state.slidesCount;
    this.state.position = -this.state.currentSlide * step;
    this.applyTransform();
    this.state.isPaused = false;
    this.updateControls();
    this.startAutoScroll();
  }

  left(): void {
    this.stopAutoScroll();
    const step = this.getStep();
    if (this.state.slidesCount === 0 || step === 0) return;
    this.state.currentSlide =
      (this.state.currentSlide - 1 + this.state.slidesCount) % this.state.slidesCount;
    this.state.position = -this.state.currentSlide * step;
    this.applyTransform();
    this.state.isPaused = false;
    this.updateControls();
    this.startAutoScroll();
  }

  private applyTransform(): void {
    const slider = this.sliderRowRef.nativeElement.querySelector<HTMLElement>('.slider-slider');
    if (slider) {
      slider.style.transform = `translateX(${this.state.position}px)`;
    }
  }

  @HostListener('window:resize')
  resize(): void {
    this.state.widthVisible = this.sliderRef.nativeElement.offsetWidth;
    const step = this.getStep();
    this.state.position = -this.state.currentSlide * step;
    this.applyTransform();
    this.updateControls();
  }

  pauseProgress = (): void => {
    if (this.state.isPaused) return;
    this.stopAutoScroll();
    const controls = this.controlRefs.toArray();
    const active = controls[this.state.currentSlide];
    if (!active) return;
    const progressBar = active.nativeElement.querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;

    const elapsed = Date.now() - this.state.progressStartTime;
    this.state.remainingTime = Math.max(0, this.state.autoScrollTime - elapsed);
    const currentWidth = window.getComputedStyle(progressBar).width;
    progressBar.style.transition = 'none';
    progressBar.style.width = currentWidth;
    this.state.isPaused = true;
  };

  resumeProgress = (): void => {
    if (!this.state.isPaused) return;
    this.state.isPaused = false;
    const controls = this.controlRefs.toArray();
    const active = controls[this.state.currentSlide];
    if (!active) return;
    const progressBar = active.nativeElement.querySelector<HTMLElement>('.slider-progress');
    if (!progressBar) return;

    progressBar.style.transition = `width ${this.state.remainingTime}ms linear`;
    progressBar.style.width = '100%';
    this.state.progressStartTime =
      Date.now() - (this.state.autoScrollTime - this.state.remainingTime);
    this.state.autoScrollTimeout = window.setTimeout(() => this.right(), this.state.remainingTime);
  };

  handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    this.pauseProgress();
    this.startX = e.touches[0].clientX;
    this.currentX = this.startX;
    this.isSwiping = true;
  }

  handleTouchMove(e: TouchEvent): void {
    if (!this.isSwiping) return;
    e.preventDefault();
    this.currentX = e.touches[0].clientX;
  }

  handleTouchEnd(e?: TouchEvent): void {
    if (!this.isSwiping) return;
    if (e) e.preventDefault();
    const diffX = this.startX - this.currentX;
    const minSwipe = 50;

    if (Math.abs(diffX) < minSwipe) this.resumeProgress();
    else if (diffX > 0) this.right();
    else this.left();

    this.isSwiping = false;
  }
}
