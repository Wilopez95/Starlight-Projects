import cssTransition from '../utils/cssTransition';

const Bounce = cssTransition({
  enter: 'sl-notif__bounce-enter',
  exit: 'sl-notif__bounce-exit',
  appendPosition: true,
});

const Slide = cssTransition({
  enter: 'sl-notif__slide-enter',
  exit: 'sl-notif__slide-exit',
  duration: [450, 750],
  appendPosition: true,
});

const Zoom = cssTransition({
  enter: 'sl-notif__zoom-enter',
  exit: 'sl-notif__zoom-exit',
});

const Flip = cssTransition({
  enter: 'sl-notif__flip-enter',
  exit: 'sl-notif__flip-exit',
});

export { Bounce, Slide, Zoom, Flip };
