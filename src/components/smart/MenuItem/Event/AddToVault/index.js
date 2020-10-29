import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddToVaultIcon from '@material-ui/icons/LibraryAdd';
import withDialogPassword from 'components/smart/Dialog/Password/with';

const ContextMenuItemACR2Required = withDialogPassword(ContextMenuItem);

// COMPONENTS
const MenuItemAddFileToVault = forwardRef(({ t, onSave, disabled }, ref) => (
  <ContextMenuItemACR2Required ref={ref} onClick={onSave} disabled={disabled}>
    <ListItemIcon>
      <AddToVaultIcon />
    </ListItemIcon>
    <ListItemText primary={t('common:addToVault')} />
  </ContextMenuItemACR2Required>
));

MenuItemAddFileToVault.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

MenuItemAddFileToVault.defaultProps = {
  disabled: false,
};

export default withTranslation('common', { withRef: true })(MenuItemAddFileToVault);
