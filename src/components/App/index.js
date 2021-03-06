import React, { lazy, Suspense } from 'react';

import { withTranslation } from 'react-i18next';

import routes from 'routes';

import retry from '@misakey/helpers/retry';

import { Route, Switch } from 'react-router-dom';
import OfflineAlert from 'components/smart/Context/Offline/Alert';
import RedirectToSignIn from 'components/dumb/Redirect/ToSignIn';
import Screen from '@misakey/ui/Screen';

import './App.scss';

// LAZY
const Auth = lazy(() => retry(() => import('components/screens/Auth')));
const BoxesApp = lazy(() => retry(() => import('components/screens/app')));
const RedirectAuthCallback = lazy(() => retry(() => import('@misakey/auth/components/Redirect/AuthCallbackWrapper')));

// CONSTANTS
const REFERRER = routes._;

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = () => (
  <Suspense fallback={<Screen isLoading hideFooter />}>
    <OfflineAlert position="absolute" top={0} zIndex="snackbar" width="100%" />
    <Switch>
      {/* AUTH */}
      <Route
        path={routes.auth._}
        component={Auth}
      />
      <Route
        exact
        path={routes.auth.callback}
        render={(routerProps) => (
          <TRedirectAuthCallback
            fallbackReferrer={REFERRER}
            loadingPlaceholder={<Screen isLoading />}
            {...routerProps}
          />
        )}
      />
      {/* REDIRECT TO SIGN IN */}
      <Route
        exact
        path={routes.auth.redirectToSignIn}
        component={RedirectToSignIn}
      />
      {/* BOXES APP */}
      <Route component={BoxesApp} />
    </Switch>
  </Suspense>
);

export default App;
