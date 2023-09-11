export interface ISlide {
  carouselRef: React.RefObject<HTMLDivElement>;
  index: number;
  onUpdate(index: number, visible: false | number): void;
}
