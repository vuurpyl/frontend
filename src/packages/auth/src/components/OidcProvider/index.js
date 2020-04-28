import React, { useMemo, useEffect, createContext, useCallback, useState, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { loadUserThunk, authReset, loadUserRolesThunk } from '@misakey/auth/store/actions/auth';

import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pick from '@misakey/helpers/pick';
import parseJwt from '@misakey/helpers/parseJwt';
import { getRolesBuilder } from '@misakey/helpers/builder/roles';
import createUserManager from '@misakey/auth/helpers/userManager';

import OidcProviderSplash from '@misakey/auth/components/OidcProvider/Splash';

// HELPERS
const pickUserProps = pick(['token', 'id']);

const getUser = ({
  profile: { acr, sco: scope, auth_time: authenticatedAt } = {},
  expires_at: expiryAt,
  access_token: token,
  id_token: id,
}) => ({
  expiryAt,
  token,
  id,
  authenticatedAt,
  scope,
  isAuthenticated: !!token,
  acr: !isEmpty(acr) ? parseInt(acr, 10) : null,
});

// CONTEXT
export const UserManagerContext = createContext({
  userManager: null,
});

// COMPONENTS
function OidcProvider({ store, children, config }) {
  const userManager = useMemo(
    () => createUserManager(config),
    [config],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [tempUser, setTempUser] = useState();

  const userProps = useMemo(
    () => (isNil(tempUser)
      ? {}
      : pickUserProps(tempUser)),
    [tempUser],
  );

  const fetchUserRoles = useCallback(
    (userId) => getRolesBuilder({ userId })
      .then((roles) => store.dispatch(loadUserRolesThunk(roles))),
    [store],
  );

  const dispatchWindowStorageEvent = useCallback(
    () => {
      const userHasChangedEvent = new StorageEvent('userHasChanged', { bubbles: true });
      window.dispatchEvent(userHasChangedEvent);
    },
    [],
  );

  const dispatchLoadUser = useCallback(
    (user, userId) => store.dispatch(loadUserThunk({
      ...getUser(user),
      userId,
    })),
    [store],
  );

  const dispatchStoreUpdate = useCallback(
    (user) => {
      if (isNil(store)) {
        return Promise.resolve();
      }

      const { auth: { roles } } = store.getState();

      const userId = parseJwt(user.id_token).sub;
      return isNil(roles)
        ? Promise.all([
          dispatchLoadUser(user, userId),
          fetchUserRoles(userId),
        ])
        : Promise.resolve(dispatchLoadUser(user, userId));
    },
    [dispatchLoadUser, fetchUserRoles, store],
  );

  // event callback when the user has been loaded (on silent renew or redirect)
  const onUserLoaded = useCallback((user) => {
    log('User is loaded !');

    // the access_token is still valid so we load the user in the store
    if (user && !user.expired) {
      // PLUGIN
      dispatchWindowStorageEvent();

      return dispatchStoreUpdate(user);
    }
    return Promise.resolve();
  }, [dispatchStoreUpdate, dispatchWindowStorageEvent]);

  // event callback when silent renew errored
  const onSilentRenewError = useCallback(() => {
    log('Fail to renew token silently...');
    if (store) {
      store.dispatch(authReset());
    }
  }, [store]);

  // event callback when the access token expired
  const onAccessTokenExpired = useCallback(() => {
    log('User token is expired !');
    // @TODO could be removed when https://github.com/IdentityModel/oidc-client-js/issues/787
    // will be implemented
    if (userManager.settings.automaticSilentRenew) {
      userManager.signinSilent().then(() => {
        log('OidcProvider.onAccessTokenExpired: Silent token renewal successful');
      }, (err) => {
        log(`OidcProvider.onAccessTokenExpired: Error from signinSilent: ${err.message}`);
      });
    }
  }, [userManager]);

  const loadUserAtMount = useCallback(() => {
    setIsLoading(true);

    // Load user on store when the app is opening
    userManager.getUser()
      .then((user) => {
        if (!isNil(user)) {
          setTempUser(getUser(user));
          return onUserLoaded(user);
        }

        return Promise.resolve();
      })
      .finally(() => {
        setIsLoading(false);
        setTempUser();
      });
  }, [onUserLoaded, userManager]);

  useEffect(() => {
    // register the event callbacks
    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addSilentRenewError(onSilentRenewError);
    userManager.events.addAccessTokenExpired(onAccessTokenExpired);

    loadUserAtMount();

    // Remove from store eventual dead signIn request key
    // (it happens when an error occurs in the flow and the backend response
    // doesn't send back the state so we can't remove it with the signInRequestCallback )
    userManager.clearStaleState();

    return function cleanup() {
      // unregister the event callbacks
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeSilentRenewError(onSilentRenewError);
      userManager.events.removeAccessTokenExpired(onAccessTokenExpired);
    };
  }, [
    userManager,
    onUserLoaded,
    onSilentRenewError,
    onAccessTokenExpired,
    loadUserAtMount,
  ]);


  return (
    <UserManagerContext.Provider value={{ userManager }}>
      {isLoading ? (
        <OidcProviderSplash userProps={userProps} />
      ) : children}
    </UserManagerContext.Provider>
  );
}

OidcProvider.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape({
    authority: PropTypes.string.isRequired,
    automaticSilentRenew: PropTypes.bool,
    client_id: PropTypes.string.isRequired,
    loadUserInfo: PropTypes.bool,
    redirect_uri: PropTypes.string.isRequired,
    response_type: PropTypes.string,
    scope: PropTypes.string,
  }),
  store: PropTypes.object,
};

OidcProvider.defaultProps = {
  children: null,
  config: {
    response_type: 'code',
    scope: 'openid user',
    automaticSilentRenew: true,
    loadUserInfo: false,
  },
  store: null,
};

export const withUserManager = (Component) => forwardRef((props, ref) => (
  <UserManagerContext.Consumer>
    {(context) => <Component {...props} {...context} ref={ref} />}
  </UserManagerContext.Consumer>
));

export default OidcProvider;
