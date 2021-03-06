import React, { useCallback, useMemo } from 'react';

import routes from 'routes';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { createSavedFile } from '@misakey/helpers/builder/vault';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { encryptFileMetadataForVault } from '@misakey/crypto/vault';
import ensureVaultKeyExists from '@misakey/crypto/store/actions/ensureVaultKeyExists';
import { addSavedFile } from 'store/reducers/files/saved';
import { conflict } from '@misakey/ui/constants/errorTypes';
import SnackbarActionSee from 'components/dumb/Snackbar/Action/See';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import isNil from '@misakey/helpers/isNil';

// HOOKS
export default () => {
  const identityId = useSelector(authSelectors.identityId);
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('components');

  const seeAction = useMemo(
    () => <SnackbarActionSee to={routes.documents.vault} />,
    [],
  );

  const onCreateFileInVault = useCallback(
    (encryptedFileId, encryptedMetadata, keyFingerprint) => createSavedFile({
      encryptedFileId,
      encryptedMetadata,
      keyFingerprint,
      identityId,
    })
      .then((response) => {
        dispatch(addSavedFile(identityId, response));
        enqueueSnackbar(t('components:saveInVault.success'), { variant: 'success', action: seeAction });
        return response;
      })
      .catch((err) => {
        if (err.code === conflict) {
          enqueueSnackbar(t('components:saveInVault.error.conflict'), { variant: 'info', action: seeAction });
        } else {
          enqueueSnackbar(t('components:saveInVault.error.default'), { variant: 'error' });
        }
      }),
    [dispatch, enqueueSnackbar, identityId, seeAction, t],
  );

  const onEncryptMetadataForVault = useCallback(
    async (fileMetadata) => {
      try {
        const vaultKey = await Promise.resolve(dispatch(ensureVaultKeyExists()));
        return encryptFileMetadataForVault(fileMetadata, vaultKey);
      } catch (err) {
        logSentryException(err, 'useSaveFileInVault: could not encrypt metadata', { crypto: true });
        enqueueSnackbar(t('components:saveInVault.error.default'), { variant: 'error' });
        return Promise.resolve({});
      }
    },
    [dispatch, enqueueSnackbar, t],
  );

  const onSaveInVault = useCallback(
    async (fileMetadata, encryptedFileId) => {
      const { encryptedMetadata, keyFingerprint } = await onEncryptMetadataForVault(fileMetadata);
      if (isNil(encryptedMetadata)) { return null; }
      return onCreateFileInVault(encryptedFileId, encryptedMetadata, keyFingerprint);
    },
    [onCreateFileInVault, onEncryptMetadataForVault],
  );

  return onSaveInVault;
};
