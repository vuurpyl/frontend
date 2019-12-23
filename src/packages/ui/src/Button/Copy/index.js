import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';
import isNil from '@misakey/helpers/isNil';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import CopyIcon from '@material-ui/icons/FilterNone';

// CONSTANTS
export const MODE = {
  icon: 'icon',
  text: 'text',
};
export const MODES = Object.values(MODE);

// COMPONENTS
const ContainedButton = Button;
ContainedButton.defaultProps = {
  variant: 'contained',
  color: 'secondary',
};

const ButtonCopy = ({ value, mode, t, ...props }) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = useCallback(() => {
    copy(value);
    const text = t('copied', 'Copied!');
    enqueueSnackbar(text, { variant: 'success' });
  }, [enqueueSnackbar, t, value]);

  const hasNoValue = useMemo(() => isNil(value), [value]);
  const isIcon = useMemo(() => mode === MODE.icon, [mode]);
  const Wrapper = useMemo(() => (mode === MODE.icon ? IconButton : ContainedButton), [mode]);

  return (
    <Wrapper
      disabled={hasNoValue}
      onClick={handleCopy}
      {...omit(props, ['i18n', 'tReady'])}
    >
      {isIcon ? <CopyIcon /> : t('copy', 'Copy')}
    </Wrapper>
  );
};

ButtonCopy.propTypes = {
  mode: PropTypes.oneOf(MODES),
  t: PropTypes.func,
  value: PropTypes.string,
};

ButtonCopy.defaultProps = {
  value: null,
  mode: MODE.text,
  t: tDefault,

};

export default withTranslation()(ButtonCopy);
