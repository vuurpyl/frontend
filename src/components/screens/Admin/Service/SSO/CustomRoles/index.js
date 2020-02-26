import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';


import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import BoxSection from '@misakey/ui/Box/Section';
import ScreenAction from 'components/dumb/Screen/Action';

const PARENT_ROUTE = routes.admin.service.sso._;

// COMPONENTS
const SSOCustomRoles = ({ appBarProps, t, service }) => {
  const [roles] = useState([]);

  const rolesEmpty = useMemo(() => roles.length === 0, [roles]);

  const homePath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  return (
    <ScreenAction
      navigationProps={{ homePath }}
      appBarProps={appBarProps}
      title={t('admin__new:sso.customRoles.title')}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('admin__new:sso.customRoles.subtitle')}
        </Typography>
        {rolesEmpty && (
          <BoxSection className="box" mt={3}>
            <Typography variant="h6" color="textPrimary" className="title" gutterBottom>
              {t('fields__new:customRoles.empty.label')}
            </Typography>
            <Box mt={3} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled
              >
                {t('fields__new:customRoles.empty.action')}
              </Button>
            </Box>
          </BoxSection>
        )}
      </Container>
    </ScreenAction>
  );
};

SSOCustomRoles.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape({ mainDomain: PropTypes.string }),
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
};

SSOCustomRoles.defaultProps = {
  appBarProps: null,
  service: null,
};

export default withTranslation(['admin__new', 'fields__new'])(SSOCustomRoles);
