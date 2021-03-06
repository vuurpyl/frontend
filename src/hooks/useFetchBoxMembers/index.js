import BoxesSchema from 'store/schemas/Boxes';
import SenderSchema from 'store/schemas/Boxes/Sender';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { normalize } from 'normalizr';

import { getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { getBoxById } from 'store/reducers/box';
import isEmpty from '@misakey/helpers/isEmpty';

// HOOKS
// @UNUSED
export default (boxId) => {
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();
  const { hasAccess, ...rest } = useSelector((state) => getBoxById(state, boxId) || {});

  const dispatchReceiveBoxMembers = useCallback(
    (members) => {
      const normalized = normalize(
        members,
        SenderSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id: boxId, changes: { members: result } }], BoxesSchema)),
      ]);
    },
    [boxId, dispatch],
  );

  return useCallback(
    () => {
      if (!hasAccess || isEmpty(rest)) {
        return Promise.resolve();
      }
      return getBoxMembersBuilder(boxId)
        .then((result) => dispatchReceiveBoxMembers(result))
        .catch(handleHttpErrors);
    },
    [boxId, dispatchReceiveBoxMembers, handleHttpErrors, hasAccess, rest],
  );
};
