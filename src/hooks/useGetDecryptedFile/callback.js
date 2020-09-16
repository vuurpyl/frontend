import decryptFile from '@misakey/crypto/box/decryptFile';
import { getEncryptedFileBuilder } from '@misakey/helpers/builder/files';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

// HOOKS
export default ({ encryptedFileId, encryption, fileName }, onDownloadError) => {
  const { t } = useTranslation('common');

  const { enqueueSnackbar } = useSnackbar();

  return useCallback(
    () => {
      if (!isNil(encryptedFileId)) {
        return getEncryptedFileBuilder(encryptedFileId)
          .then((response) => decryptFile(response.blob, { encryption, fileName }))
          .catch(() => {
            enqueueSnackbar(t('common:fileDownload.errors.get'), { variant: 'error' });
            if (isFunction(onDownloadError)) {
              return onDownloadError();
            }
            return Promise.reject();
          });
      }
      return Promise.reject();
    }, [encryptedFileId, encryption, enqueueSnackbar, fileName, onDownloadError, t],
  );
};