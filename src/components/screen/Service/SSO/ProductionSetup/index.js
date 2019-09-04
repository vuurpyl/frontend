import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { useSnackbar } from 'notistack';

import makeStyles from '@material-ui/core/styles/makeStyles';

import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import ServiceSchema from 'store/schemas/Service';
import API from '@misakey/api';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import Navigation from 'components/dumb/Navigation';
import BoxSection from '@misakey/ui/Box/Section';
import ButtonCopy from '@misakey/ui/Button/Copy';
import ButtonProgress from 'components/dumb/Button/Progress';
import FieldTextPasswordRevealable, { ADORNMENT_POSITION } from 'components/dumb/Field/Text/Password/Revealable';
import ScreenError from 'components/screen/Error';


// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
  maxWidth: 'sm',
  component: Container,
};

// @FIXME js-common
const SSO_CREATE_SECRET_ENDPOINT = {
  method: 'POST',
  path: '/sso-clients/:id/secret',
  auth: true,
};

const PARENT_ROUTE = routes.service.sso._;

const EMPTY_SECRET = '';

// HELPERS
const createSSOSecret = id => API
  .use(SSO_CREATE_SECRET_ENDPOINT)
  .build({ id })
  .send();

// HOOKS
const useStyles = makeStyles(theme => ({
  box: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    width: '100%',
  },
}));

const useOnGenerateSecret = (
  service,
  setClientSecret,
  setError,
  setSubmitting,
  enqueueSnackbar,
  t,
) => useCallback(
  () => createSSOSecret(service.id)
    .then((response) => {
      const { clientSecret } = objectToCamelCase(response.body);
      enqueueSnackbar(t('service:sso.productionSetup.clientSecret.success'), { variant: 'success' });
      setClientSecret(clientSecret);
    })
    .catch((error) => {
      const httpStatus = error.httpStatus ? error.httpStatus : 500;
      setError(httpStatus);
    })
    .finally(() => { setSubmitting(false); }),
  [service, setClientSecret, setError, setSubmitting, enqueueSnackbar, t],
);


// COMPONENTS
const SSOProductionSetup = ({
  t,
  service,
  history,
}) => {
  const classes = useStyles();

  const [error, setError] = useState();
  const [isSubmitting, setSubmitting] = useState();
  const [clientSecret, setClientSecret] = useState(EMPTY_SECRET);
  const [prodStatus, setProdStatus] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onGenerateSecret = useOnGenerateSecret(
    service, setClientSecret, setError, setSubmitting, enqueueSnackbar, t,
  );

  const onSwitchProdStatus = useCallback(() => {
    setProdStatus(status => !status);
    enqueueSnackbar(t(`service:sso.productionSetup.production.success.${!prodStatus}`), { variant: 'success' });
  }, [prodStatus, setProdStatus, enqueueSnackbar, t]);

  const pushPath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <>
      <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={pushPath} hideBackButton={false} title={t('service:sso.productionSetup.title')} />
      <Container maxWidth="sm" className="screen">
        <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
          {t('service:sso.productionSetup.subtitle')}
        </Typography>
        <BoxSection className={clsx(classes.box, 'box')} bgcolor={prodStatus ? 'text.disabled' : 'inherit'}>
          <Typography variant="h6" color="textPrimary" align="left" className="title">
            {t('service:sso.productionSetup.clientSecret.title')}
          </Typography>
          {prodStatus ? (
            <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
              {t('service:sso.productionSetup.clientSecret.disabled.subtitle')}
            </Typography>
          )
            : (
              <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
                {t('service:sso.productionSetup.clientSecret.subtitle')}
              </Typography>
            )}
          <Box mt={3} className="form">
            <FieldTextPasswordRevealable
              className="field"
              name="clientSecret"
              label={t('fields:clientSecret.label')}
              adornmentPosition={ADORNMENT_POSITION.start}
              disabled={prodStatus}
              forceHide={prodStatus}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <ButtonCopy
                      color="default"
                      mode="icon"
                      edge="end"
                      value={clientSecret}
                      disabled={prodStatus}
                    />

                  </InputAdornment>
                ),
              }}
              value={clientSecret}
            />
            <div className="controls">
              <ButtonProgress
                isProgressing={isSubmitting}
                onClick={onGenerateSecret}
                disabled={prodStatus}
                variant="text"
              >
                {t('common:regenerate', 'Regenerate')}
              </ButtonProgress>
              <ButtonProgress
                isProgressing={isSubmitting}
                onClick={onSwitchProdStatus}
              >
                {prodStatus ? t('common:leaveFromProd', 'Leave from production') : t('common:goToProd', 'Go to production')}
              </ButtonProgress>
            </div>
          </Box>
        </BoxSection>
      </Container>
    </>
  );
};

SSOProductionSetup.propTypes = {
  service: PropTypes.shape(ServiceSchema.propTypes),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
};

SSOProductionSetup.defaultProps = {
  service: null,
};

export default withTranslation(['service', 'fields', 'common'])(SSOProductionSetup);