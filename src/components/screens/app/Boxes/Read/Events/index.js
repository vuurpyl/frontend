import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import ElevationScroll from 'components/dumb/ElevationScroll';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import useCreateBoxInvitationLink from 'hooks/useCreateBoxInvitationLink';
import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';

import BoxEventsAccordingToType from 'components/smart/Box/Event';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import BoxEventsFooter from './Footer';

const APPBAR_HEIGHT = 64;

const useStyles = makeStyles(() => ({
  content: ({ headerHeight }) => ({
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    height: `calc(100vh - ${headerHeight}px)`,
  }),
  thread: {
    overflow: 'auto',
  },
}));

function BoxEvents({
  drawerWidth, isDrawerOpen, toggleDrawer, box, t, showWarning, belongsToCurrentUser,
}) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const lastEventRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(APPBAR_HEIGHT);
  const classes = useStyles({ headerHeight });

  const { events: boxEvents, members, title, publicKey, id } = useMemo(() => box, [box]);
  const { accountId } = useSelector(getCurrentUserSelector) || {};
  const {
    canShare,
    canInvite,
    onShare,
    onCopyLink,
  } = useCreateBoxInvitationLink(id, title, publicKey, t);

  const eventsByDate = useGroupEventsByDate(boxEvents);

  const isTheOnlyMember = useMemo(
    () => members.length === 1 && belongsToCurrentUser,
    [belongsToCurrentUser, members.length],
  );

  const headerRef = (ref) => {
    if (ref) { setHeaderHeight(ref.clientHeight); }
  };

  const scrollToBottom = useCallback(() => {
    if (!isNil(lastEventRef) && !isNil(lastEventRef.current)) {
      lastEventRef.current.scrollIntoView();
    }
  }, []);

  useEffect(scrollToBottom, [eventsByDate]);

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer
          drawerWidth={drawerWidth}
          toolbarProps={{ px: 0 }}
          offsetHeight={headerHeight}
        >
          <Box ref={headerRef} display="flex" flexDirection="column" width="100%">
            <Box display="flex">
              {!isDrawerOpen && (
                <Box display="flex" pl={2} pr={1}>
                  <IconButtonAppBar
                    color="inherit"
                    aria-label={t('common:openAccountDrawer')}
                    edge="start"
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButtonAppBar>
                </Box>
              )}
              <BoxEventsAppBar box={box} belongsToCurrentUser={belongsToCurrentUser} />
            </Box>

            {showWarning && (
              <Alert
                severity="warning"
                action={(
                  <ButtonWithDialogPassword
                    standing={BUTTON_STANDINGS.TEXT}
                    text={isNil(accountId)
                      ? t('common:save')
                      : t('common:add')}
                  />
                )}
              >
                {t('boxes:read.warning.saveInBackup')}
              </Alert>
            )}

            {isTheOnlyMember && canInvite && (
              <Alert
                severity="info"
                action={(
                  <Button
                    onClick={canShare ? onShare : onCopyLink}
                    standing={BUTTON_STANDINGS.TEXT}
                    text={t('common:share')}
                  />
                )}
              >
                {t('boxes:read.info.share')}
              </Alert>
            )}
          </Box>
        </AppBarDrawer>
      </ElevationScroll>
      <Box className={classes.content}>
        <Box p={2} ref={(ref) => setContentRef(ref)} flexGrow="1" className={classes.thread}>
          {eventsByDate.map(({ date, events }) => (
            <Box display="flex" flexDirection="column" py={1} key={date}>
              <Typography component={Box} alignSelf="center">{date}</Typography>
              {
                events.map((event) => (
                  <BoxEventsAccordingToType event={event} key={event.id} boxID={id} />
                ))
              }
              <div ref={lastEventRef} />
            </Box>
          ))}
        </Box>
        <BoxEventsFooter
          box={box}
          drawerWidth={drawerWidth}
          isDrawerOpen={isDrawerOpen}
        />
      </Box>
    </>

  );
}

BoxEvents.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  belongsToCurrentUser: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  showWarning: PropTypes.bool,
};

BoxEvents.defaultProps = {
  showWarning: false,
};

export default withTranslation(['common', 'boxes'])(BoxEvents);
