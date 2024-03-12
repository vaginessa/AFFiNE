// TODO: Temporary solution to enable multi-view for testing purposes, remove this after multi-view control is implemented

const TEMP_KEY = '__enableMultiView__';

function enableMultiView() {
  localStorage.setItem(TEMP_KEY, 'true');
  location.reload();
}

function disableMultiView() {
  localStorage.removeItem(TEMP_KEY);
  location.reload();
}

function isMultiViewEnabled() {
  return localStorage.getItem(TEMP_KEY) === 'true';
}

if (environment.isDesktop) {
  (window as any).enableMultiView = enableMultiView;
  (window as any).disableMultiView = disableMultiView;
}

export const multiViewEnabled = isMultiViewEnabled();
