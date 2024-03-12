import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';

export const indicatorWrapper = style({
  position: 'absolute',
  zIndex: 4,
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '50%',
  maxWidth: 300,
  minWidth: 120,
  height: 15,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ['WebkitAppRegion' as string]: 'no-drag',
});

export const indicator = style({
  width: 29,
  height: 15,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'grab',
  ['WebkitAppRegion' as string]: 'no-drag',
  color: cssVar('placeholderColor'),

  selectors: {
    '&:hover, &:active, &[data-active="true"]': {
      color: cssVar('brandColor'),
    },
  },
});

export const indicatorInner = style({
  width: 25,
  height: 5,
  borderRadius: 10,
  backgroundColor: 'currentColor',
});
