import { style } from '@vanilla-extract/css';
import { vars } from './theme.css';

export const rootStyles = style({
  display: 'flex',
});

export const imageSelectionStyles = style({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

export const editorPanelStyles = style({
  height: '100vh',
});

export const titlebarStyles = style({
  paddingTop: vars.spacing.xs,
  paddingBottom: vars.spacing.xs,
  paddingLeft: vars.spacing.md,
  paddingRight: vars.spacing.md,
});

export const imageGridPanelStyles = style({
  overflow: 'auto',
});
