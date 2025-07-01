import { style } from '@vanilla-extract/css';
import { vars } from '../theme.css';

export const rootStyles = style({
  display: 'flex',
  paddingTop: 'env(safe-area-inset-top)',
});

export const imageSelectionStyles = style({
  display: 'flex',
  flexDirection: 'column',
});

export const editorPanelStyles = style({
  paddingBottom: 'env(safe-area-inset-bottom)',
  [vars.darkSelector]: {
    backgroundColor: vars.colors.dark.light,
  },
});

export const titlebarStyles = style({
  paddingTop: vars.spacing.xs,
  paddingBottom: vars.spacing.xs,
  paddingLeft: vars.spacing.md,
  paddingRight: vars.spacing.md,
});

export const imageGridPanelStyles = style({
  overflow: 'auto',
  flexGrow: 1,
  [vars.lightSelector]: {
    backgroundColor: vars.colors.gray.light,
  },
});
