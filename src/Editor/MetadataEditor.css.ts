import { style } from '@vanilla-extract/css';

export const formContainerStyles = style({
  flexGrow: 1,
  overflow: 'clip',
});

export const formStyles = style({
  flexGrow: 1,
  overflow: 'auto',
});

export const tabContainerStyles = style({
  overflow: 'clip',
});

export const tabContentStyles = style({
  overflow: 'auto',
  height: '100%',
});
