import packageInfo from '../../package.json';

const AIT_BUILD_LABEL = 'iap2';

export const APP_VERSION = packageInfo.version;
export const APP_VERSION_LABEL = `v${APP_VERSION}-${AIT_BUILD_LABEL}`;
