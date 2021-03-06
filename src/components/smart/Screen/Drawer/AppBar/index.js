import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { SIDES } from '@misakey/ui/constants/drawers';

import { makeStyles } from '@material-ui/core/styles';
import AppBar, { PROP_TYPES } from '@misakey/ui/AppBar';
import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

const useStyles = makeStyles((theme) => ({
  appBarLeft: {
    width: '100%',
    left: 0,
  },
  appBarRight: {
    width: '100%',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

function AppBarDrawer({
  children,
  className,
  side,
  ...props
}) {
  const classes = useStyles();

  const { isDrawerOpen } = useScreenDrawerContext();

  return (
    <AppBar
      position="absolute"
      className={clsx(className, {
        [classes.appBarLeft]: side === SIDES.LEFT,
        [classes.appBarRight]: side === SIDES.RIGHT,
        [classes.appBarShift]: side === SIDES.RIGHT && isDrawerOpen,
      })}
      {...props}
    >
      {children}
    </AppBar>
  );
}

AppBarDrawer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  side: PropTypes.oneOf(Object.values(SIDES)),
  ...PROP_TYPES,
};

AppBarDrawer.defaultProps = {
  className: '',
  children: null,
  side: SIDES.RIGHT,
};

export default AppBarDrawer;
