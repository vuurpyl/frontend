import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateIdentity } from '@misakey/auth/store/actions/auth';
import { selectors } from '@misakey/auth/store/reducers/auth';
import { normalize } from 'normalizr';
import { receiveEntities } from '@misakey/store/actions/entities';
import IdentitySchema from 'store/schemas/Identity';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import isEmpty from '@misakey/helpers/isEmpty';
import { getIdentity as getIdentityBuilder } from '@misakey/auth/builder/identities';


// HOOKS
/**
 * @returns {Object} identityMetadata
 * @returns {string} identityMetadata.isAuthenticated
 *          isAuthenticated
 * @returns {string} identityMetadata.identityId
 *          id of identity
 * @returns {Object} identityMetadata.identity
 *          identity
 * @returns {Object} identityMetadata.data
 *          data returned by fetch
 * @returns {Object} identityMetadata.error
 *          error returned by fetch
 * @returns {boolean} identityMetadata.isFetching
 *          fetching status returned by fetch
 */
export default () => {
  // SELECTORS
  const isAuthenticated = useSelector(selectors.isAuthenticated);
  const identity = useSelector(selectors.identity);
  const identityId = useSelector(selectors.identityId);

  const dispatch = useDispatch();

  const onLoadIdentity = useCallback(
    (nextIdentity) => {
      const normalized = normalize(nextIdentity, IdentitySchema.entity);
      const { entities } = normalized;
      return Promise.all([
        dispatch(updateIdentity(nextIdentity)),
        dispatch(receiveEntities(entities)),
      ]);
    },
    [dispatch],
  );

  const shouldFetch = useMemo(
    () => isEmpty(identity) && !isEmpty(identityId) && isAuthenticated,
    [isAuthenticated, identity, identityId],
  );

  const getIdentity = useCallback(
    () => getIdentityBuilder(identityId),
    [identityId],
  );

  const fetchData = useFetchEffect(getIdentity, { shouldFetch }, { onSuccess: onLoadIdentity });

  return useMemo(
    () => ({
      isAuthenticated,
      identity,
      identityId,
      shouldFetch,
      ...fetchData,
    }),
    [fetchData, shouldFetch, identity, identityId, isAuthenticated],
  );
};
