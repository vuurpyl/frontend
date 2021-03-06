import { useCallback } from 'react';

import { isAuthStepAlreadyExistsConflict } from '@misakey/auth/helpers/errors';
import renewAuthStepBuilder from '@misakey/auth/builder/renewAuthStep';

import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useTranslation } from 'react-i18next';


// HOOKS
/**
 * @param {Object} params
 * @param {string} params.loginChallenge login challenge
 * @param {string} params.identityId identity ID for which authentication step will be initialized
 * @param {string} params.methodName method used by authentication step
 */
export default (params) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('auth');
  const handleHttpErrors = useHandleHttpErrors();

  return useCallback(
    (cbArgs) => renewAuthStepBuilder({ ...params, ...cbArgs })
      .then(() => {
        enqueueSnackbar(
          t('auth:login.form.action.getANewCode.success'), { variant: 'success' },
        );
      })
      .catch((error) => {
        if (isAuthStepAlreadyExistsConflict(error)) {
          enqueueSnackbar(t('auth:login.form.error.conflict'), { variant: 'warning' });
        } else {
          handleHttpErrors(error);
        }
      }),
    [params, enqueueSnackbar, t, handleHttpErrors],
  );
};
