import { setupGlobal } from '@affine/env/global';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { atomEffect } from 'jotai-effect';

setupGlobal();

export type DateFormats =
  | 'MM/dd/YYYY'
  | 'dd/MM/YYYY'
  | 'YYYY-MM-dd'
  | 'YYYY.MM.dd'
  | 'YYYY/MM/dd'
  | 'dd-MMM-YYYY'
  | 'dd MMMM YYYY';

export type AppSetting = {
  clientBorder: boolean;
  fullWidthLayout: boolean;
  windowFrameStyle: 'frameless' | 'NativeTitleBar';
  fontStyle: FontFamily;
  dateFormat: DateFormats;
  startWeekOnMonday: boolean;
  enableBlurBackground: boolean;
  enableNoisyBackground: boolean;
  autoCheckUpdate: boolean;
  autoDownloadUpdate: boolean;
  enableMultiView: boolean;
};
export const windowFrameStyleOptions: AppSetting['windowFrameStyle'][] = [
  'frameless',
  'NativeTitleBar',
];

export const dateFormatOptions: DateFormats[] = [
  'MM/dd/YYYY',
  'dd/MM/YYYY',
  'YYYY-MM-dd',
  'YYYY.MM.dd',
  'YYYY/MM/dd',
  'dd-MMM-YYYY',
  'dd MMMM YYYY',
];

export type FontFamily = 'Sans' | 'Serif' | 'Mono';

export const fontStyleOptions = [
  { key: 'Sans', value: 'var(--affine-font-sans-family)' },
  { key: 'Serif', value: 'var(--affine-font-serif-family)' },
  { key: 'Mono', value: 'var(--affine-font-mono-family)' },
] satisfies {
  key: FontFamily;
  value: string;
}[];

const appSettingBaseAtom = atomWithStorage<AppSetting>('affine-settings', {
  clientBorder: environment.isDesktop && !environment.isWindows,
  fullWidthLayout: false,
  windowFrameStyle: 'frameless',
  fontStyle: 'Sans',
  dateFormat: dateFormatOptions[0],
  startWeekOnMonday: false,
  enableBlurBackground: true,
  enableNoisyBackground: true,
  autoCheckUpdate: true,
  autoDownloadUpdate: true,
  enableMultiView: false,
});

type SetStateAction<Value> = Value | ((prev: Value) => Value);

const appSettingEffect = atomEffect(get => {
  const settings = get(appSettingBaseAtom);
  // some values in settings should be synced into electron side
  if (environment.isDesktop) {
    console.log('set config', settings);
    // this api type in @affine/electron-api, but it is circular dependency this package, use any here
    (window as any).apis?.updater
      .setConfig({
        autoCheckUpdate: settings.autoCheckUpdate,
        autoDownloadUpdate: settings.autoDownloadUpdate,
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
});

export const appSettingAtom = atom<
  AppSetting,
  [SetStateAction<Partial<AppSetting>>],
  void
>(
  get => {
    get(appSettingEffect);
    return get(appSettingBaseAtom);
  },
  (_get, set, apply) => {
    set(appSettingBaseAtom, prev => {
      const next = typeof apply === 'function' ? apply(prev) : apply;
      return { ...prev, ...next };
    });
  }
);
