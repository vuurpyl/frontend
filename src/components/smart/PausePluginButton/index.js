import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Tooltip from '@material-ui/core/Tooltip';

import { sendMessage } from 'background';
import { GET_BLOCKER_STATE, TOGGLE_BLOCKED_STATE } from 'background/messages';

function PausePluginButton({ t }) {
  const options = [
    {
      label: t('plugin:time.minute', { count: 30 }),
      value: 30,
    },
    {
      label: t('plugin:time.hour', { count: 1 }),
      value: 60,
    },
    {
      label: t('plugin:time.hour', { count: 24 }),
      value: 1440,
    },
  ];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [paused, setPaused] = React.useState(null);
  const [pausedTime, setPausedTime] = React.useState(null);

  function getData() {
    sendMessage(GET_BLOCKER_STATE).then((response) => {
      setPaused(response.paused);
      setPausedTime(response.pausedTime);
    });
  }

  function getPlannedDate() {
    const date = new Date(pausedTime);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`;
  }

  function pause(time = null) {
    const deadline = time ? Date.now() + (time * 60 * 1000) : null;
    sendMessage(TOGGLE_BLOCKED_STATE, { time: deadline }).then((response) => {
      setPausedTime(response.pausedTime);
      setPaused(response.paused);
    });
  }

  function handleChoice(value) {
    pause(value);
    setAnchorEl(null);
  }

  React.useEffect(getData);

  return (
    <>
      <Tooltip title={paused
        ? `${pausedTime ? t('plugin:resume.plannedResume', { planned: getPlannedDate() }) : t('plugin:resume.description')}`
        : t('plugin:pause.description')}
      >
        <ButtonGroup size="small" color="secondary" aria-label="split button">

          <Button size="small" onClick={() => pause()}>
            {paused ? t('plugin:resume.title') : t('plugin:pause.title')}
          </Button>
          <Button
            size="small"
            aria-owns={anchorEl ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={(event) => { setAnchorEl(event.currentTarget); }}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      </Tooltip>

      <Menu
        id="pause-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => { setAnchorEl(null); }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} onClick={() => handleChoice(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

PausePluginButton.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation(['plugin'])(PausePluginButton);