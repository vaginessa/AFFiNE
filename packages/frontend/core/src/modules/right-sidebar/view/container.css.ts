import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const sidebarContainerInner = style({
  display: 'flex',
  background: cssVar('backgroundPrimaryColor'),
  flexDirection: 'column',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  borderRadius: 'inherit',
});

export const sidebarContainer = style({
  display: 'flex',
  flexShrink: 0,
  height: '100%',
  selectors: {
    [`&[data-client-border=true]`]: {
      paddingLeft: 8,
      borderRadius: 6,
    },
    [`&[data-client-border=false]`]: {
      borderLeft: `1px solid ${cssVar('borderColor')}`,
    },
  },
});

export const sidebarBodyTarget = style({
  flex: 1,
  width: '100%',
  minWidth: '320px',
  overflow: 'hidden',
  selectors: {
    [`&[data-client-border=true]`]: {
      paddingLeft: 9,
    },
    [`&[data-client-border=false]`]: {
      borderLeft: `1px solid ${cssVar('borderColor')}`,
    },
  },
});
