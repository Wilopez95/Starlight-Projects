export interface IBaseCarousel {
  children: React.ReactNode;
  className?: string;
}

export interface IBaseCarouselHandle {
  next(): void;
  prev(): void;
}
