import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import SenderSchema from 'store/schemas/Boxes/Sender';
import routes from 'routes';

import { generatePath, Link } from 'react-router-dom';
import { senderMatchesIdentityId } from 'helpers/sender';
import isNil from '@misakey/helpers/isNil';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItemMember from 'components/dumb/ListItem/Member';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// COMPONENTS
const ListItemMemberPublicLink = ({ component: Component, member, ...props }) => {
  const myIdentityId = useSelector(IDENTITY_ID_SELECTOR);

  const isMe = useMemo(
    () => senderMatchesIdentityId(member, myIdentityId),
    [member, myIdentityId],
  );

  const { id } = useSafeDestr(member);

  const identityPublicTo = useMemo(
    () => (isNil(id)
      ? null
      : generatePath(routes.identities.public, { id })),
    [id],
  );

  const listItemProps = useMemo(
    () => (isMe || isNil(identityPublicTo)
      ? {}
      : {
        button: true,
        to: identityPublicTo,
        component: Link,
      }),
    [isMe, identityPublicTo],
  );

  return (
    <Component
      member={member}
      {...listItemProps}
      {...props}
    />
  );
};

ListItemMemberPublicLink.propTypes = {
  component: PropTypes.elementType,
  member: PropTypes.shape(SenderSchema.propTypes).isRequired,
};

ListItemMemberPublicLink.defaultProps = {
  component: ListItemMember,
};

export default ListItemMemberPublicLink;
