import React, { lazy } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import { Route, Switch } from 'react-router-dom';

import Home from 'components/newScreens/Home';
import NotFound from 'components/screens/NotFound';
import Requests from 'components/screens/DPO/Service/Requests/Read';

import Redirect from 'components/dumb/Redirect';
import RedirectAuthCallback from '@misakey/auth/components/Redirect/AuthCallbackWrapper';
import RoutePrivate from '@misakey/auth/components/Route/Private';
import RouteAccessRequest from 'components/smart/Route/AccessRequest';
import SeclevelWarningAlert from 'components/smart/Alert/SeclevelWarning';
import Landing from 'components/screens/Landing';

// LAZY
const Account = lazy(() => import('components/screens/Account'));
const Admin = lazy(() => import('components/screens/Admin'));
const DPO = lazy(() => import('components/screens/DPO'));
const Citizen = lazy(() => import('components/screens/Citizen'));
const Auth = lazy(() => import('components/screens/Auth'));

// CONSTANTS
const REFERRERS = {
  success: routes._,
  error: routes._,
};

// COMPONENTS
const TRedirectAuthCallback = withTranslation('common')(RedirectAuthCallback);

const App = ({ t }) => (
  <>
    <SeclevelWarningAlert />
    <Switch>
      <Route exact path={routes._} component={Landing} />
      {/* LEGALS */}
      <Route
        exact
        path={routes.legals.tos}
        render={(routerProps) => <Redirect to={t('components:footer.links.tos.href')} {...routerProps} />}
      />
      <Route
        exact
        path={routes.legals.privacy}
        render={(routerProps) => <Redirect to={t('components:footer.links.privacy.href')} {...routerProps} />}
      />
      {/* AUTH and ACCOUNT */}
      <Route path={routes.auth._} component={Auth} />
      <RoutePrivate path={routes.account._} component={Account} />
      <Route
        exact
        path={routes.auth.callback}
        render={(routerProps) => (
          <TRedirectAuthCallback fallbackReferrers={REFERRERS} t={t} {...routerProps} />
        )}
      />

      {/* WORKSPACES */}
      <Route path={routes.admin._} component={Admin} />
      <Route path={routes.citizen._} component={Citizen} />
      <Route path={routes.dpo._} component={DPO} />

      <Route path={[routes.boxes._, routes.accounts._]} component={Home} />

      {/* REQUESTS */}
      <RouteAccessRequest exact path={routes.requests} component={Requests} />

      {/* DEFAULT */}
      <Route component={NotFound} />
    </Switch>
  </>
);

App.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('components')(App);
