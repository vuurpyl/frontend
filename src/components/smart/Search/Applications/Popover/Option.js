import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';
import { ROLE_LABELS } from 'constants/Roles';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';


import ApplicationListItem from 'components/dumb/ListItem/Application';

const Option = ({ application, ...rest }) => {
  const role = useLocationWorkspace();

  const mainDomain = useMemo(
    () => application.mainDomain,
    [application.mainDomain],
  );

  const itemLinkTo = useMemo(
    () => {
      if (isNil(mainDomain)) {
        return null;
      }
      // This default route is going to change with https://gitlab.misakey.dev/misakey/frontend/issues/484
      let linkTo = routes.citizen.application.vault;
      if (role === ROLE_LABELS.DPO) {
        linkTo = routes.dpo.service._;
      } else if (role === ROLE_LABELS.ADMIN) {
        linkTo = routes.admin.service._;
      }
      return generatePath(linkTo, { mainDomain });
    },
    [mainDomain, role],
  );

  return (
    <ApplicationListItem
      button
      component={Link}
      to={itemLinkTo}
      application={application}
      {...rest}
    />
  );
};

Option.propTypes = {
  application: PropTypes.shape({
    ...ApplicationSchema.propTypes,
    mainDomain: PropTypes.string,
  }).isRequired,
};

export default Option;
