import { Menu, type MenuProps } from '@affine/component';
import clsx from 'clsx';
import {
  forwardRef,
  type HTMLAttributes,
  memo,
  type MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as styles from './indicator.css';

export interface SplitViewMenuProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  open?: boolean;
  onOpenMenu?: () => void;
}

export const SplitViewMenuIndicator = memo(
  forwardRef<HTMLDivElement, SplitViewMenuProps>(
    function SplitViewMenuIndicator(
      { className, active, open, onOpenMenu, ...attrs }: SplitViewMenuProps,
      ref
    ) {
      const onMouseUp: MouseEventHandler = useCallback(() => {
        !open && onOpenMenu?.();
      }, [onOpenMenu, open]);

      return (
        <div
          ref={ref}
          data-active={active}
          className={clsx(className, styles.indicator)}
          onClick={onMouseUp}
          {...attrs}
        >
          <div className={styles.indicatorInner} />
        </div>
      );
    }
  )
);

interface SplitViewIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  isDragging?: boolean;
  isActive?: boolean;
  menuItems?: React.ReactNode;
  // import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities' is not allowed
  listeners?: any;
}
export const SplitViewIndicator = ({
  isDragging,
  isActive,
  menuItems,
  listeners,
}: SplitViewIndicatorProps) => {
  const active = isActive || isDragging;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isDragging) {
      setMenuOpen(false);
    }
  }, [isDragging]);

  // prevent menu from opening when dragging
  const setOpenMenuManually = useCallback((open: boolean) => {
    if (open) return;
    setMenuOpen(open);
  }, []);
  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const menuRootOptions = useMemo(
    () =>
      ({
        open: menuOpen,
        onOpenChange: setOpenMenuManually,
      }) satisfies MenuProps['rootOptions'],
    [menuOpen, setOpenMenuManually]
  );
  const menuContentOptions = useMemo(
    () =>
      ({
        align: 'center',
      }) satisfies MenuProps['contentOptions'],
    []
  );

  return (
    <div className={styles.indicatorWrapper}>
      <Menu
        contentOptions={menuContentOptions}
        items={menuItems}
        rootOptions={menuRootOptions}
      >
        <SplitViewMenuIndicator
          open={menuOpen}
          onOpenMenu={openMenu}
          active={active}
          {...listeners}
        />
      </Menu>
    </div>
  );
};
