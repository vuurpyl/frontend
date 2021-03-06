import React, { useContext } from 'react';


import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useSignOut from '@misakey/auth/hooks/useSignOut';
import { useSelector } from 'react-redux';

import ChipUser from '@misakey/ui/Chip/User';

// CONSTANTS
const { identity: IDENTITY_SELECTOR } = authSelectors;


// COMPONENTS
// @UNUSED
const ChipUserMeLogout = (props) => {
  const { userManager } = useContext(UserManagerContext);
  const onDelete = useSignOut(userManager);

  const identity = useSelector(IDENTITY_SELECTOR);
  const { displayName, avatarUrl } = useSafeDestr(identity);

  return (
    <ChipUser
      displayName={displayName}
      avatarUrl={avatarUrl}
      onDelete={onDelete}
      {...props}
    />
  );
};

export default ChipUserMeLogout;
