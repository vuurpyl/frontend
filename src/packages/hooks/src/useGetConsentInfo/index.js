import { getInfo } from '@misakey/auth/builder/consent';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

export default (consentChallenge) => {
  const dispatch = useDispatch();

  return useCallback(
    (accessToken) => getInfo({ consentChallenge }, accessToken)
      .then(
        (response) => Promise.resolve(dispatch(ssoUpdate(response))),
      ),
    [consentChallenge, dispatch],
  );
};
