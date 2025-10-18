export interface SliderElements {
  section: HTMLElement;
  slider: HTMLElement;
  btnLeft: HTMLElement;
  btnRight: HTMLElement;
  controls: NodeListOf<HTMLElement>;
}

export interface SliderState {
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

export interface FavoritesCoffee {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string;
  category: string;
  image?: string;
}

export type ApiResponse<T> = {
  data: T[];
  message: string;
  error: string;
};
