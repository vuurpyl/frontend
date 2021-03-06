import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { MSG_FILE, MSG_TXT } from 'constants/app/boxes/events';
import browserNotify from '@misakey/helpers/browserNotify';
import { isTabVisible } from 'packages/helpers/src/visibilityChange';

export default () => {
  const { t } = useTranslation('boxes');

  return useCallback(
    (event, boxTitle) => {
      const { type, sender } = event;
      const { displayName } = sender;
      if (!isTabVisible()) {
        const isMessageFile = type === MSG_FILE;
        if (isMessageFile || type === MSG_TXT) {
          return browserNotify(
            `${boxTitle || t('boxes:notifications.browser.events.defaultTile')}`,
            {
              badge: '/favicon.ico',
              icon: '/favicon.ico',
              body: t(`boxes:notifications.browser.events.body.${isMessageFile ? 'file' : 'text'}`, { displayName }),
            },
          );
        }
        return null;
      }
      return null;
    },
    [t],
  );
};
