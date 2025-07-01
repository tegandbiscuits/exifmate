import { style } from '@vanilla-extract/css';
import { vars } from '../theme.css';

export const containerStyles = style({
  userSelect: 'none',
});

export const selectedCardStyles = style({
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray[4],
  },
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark.lightColor,
  },
});
