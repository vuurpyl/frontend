import { createSelector } from 'reselect';
import { denormalize } from 'normalizr';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import pluck from '@misakey/helpers/pluck';
import filter from '@misakey/helpers/filter';
import mapKeys from '@misakey/helpers/mapKeys';
import rangeRight from '@misakey/helpers/rangeRight';
import max from '@misakey/helpers/max';
import isNil from '@misakey/helpers/isNil';

import {
  SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY,
  SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  SET_LAST_NOTIFICATION_BY_IDENTITY,
  DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  RESET_NOTIFICATIONS_BY_IDENTITY,
  ADD_NOTIFICATION_ID_BY_IDENTITY,
} from 'store/actions/identity/notifications';

import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';

// CONSTANTS
const REDUCER_KEY = 'notificationsByIdentity';

// HELPERS
const safeDecrement = (target, amount) => {
  const result = (target || 0) - amount;
  return result < 0 ? 0 : result;
};
const getIds = pluck('id');

// SELECTORS
export const makeGetUserNotificationsNotAckSelector = () => createSelector(
  (state) => state.entities,
  (_, ids) => ids,
  (entities, ids) => {
    const notifications = denormalize(ids, IdentityNotificationsSchema.collection, entities);
    const notificationsToAck = filter(notifications, ['acknowledgedAt', null]);
    return getIds(notificationsToAck);
  },
);

export const getNewCountSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (items) => items.newCount,
);
export const getLastNotificationSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (state) => state.entities,
  (items, entities) => (isNil(items.lastNotification)
    ? items.lastNotification
    : denormalize(items.lastNotification, IdentityNotificationsSchema.entity, entities)
  ),
);

export const getPaginationSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (items) => ({ hasNextPage: items.hasNextPage, items: items.notifications }),
);

const initialState = {
  notifications: null,
  newCount: null,
  lastNotification: undefined,
  hasNextPage: false,
};

const setPaginationNotifications = (state, { newNotifications, hasNextPage }) => {
  const numberOfNew = newNotifications.length;
  const paginatedRange = rangeRight(0, numberOfNew);
  const nextItems = paginatedRange.reduce((aggr, key, index) => ({
    ...aggr,
    [key]: newNotifications[index],
  }), {});

  const oldItems = state.notifications || {};

  return {
    ...state,
    hasNextPage,
    notifications: {
      ...(mapKeys(oldItems, (_, key) => parseInt(key, 10) + numberOfNew)),
      ...nextItems,
    },
  };
};

const addPaginatedNotificationId = (state, { newNotificationId }) => {
  const { notifications, newCount } = state;
  if (isNil(notifications)) {
    if (isNil(state.lastNotification)) { return state; }
    return {
      ...state,
      newCount: isNil(newCount) ? newCount : newCount + 1,
      lastNotification: newNotificationId,
    };
  }

  const currentItems = state.notifications || {};
  const maxIndex = max(Object.keys(currentItems).map((key) => parseInt(key, 10)));
  const newLastIndex = maxIndex + 1;
  const nextItems = { [newLastIndex]: newNotificationId };

  return {
    ...state,
    newCount: state.newCount + 1,
    lastNotification: newNotificationId,
    notifications: {
      ...currentItems,
      ...nextItems,
    },
  };
};

const setNewCount = (state, { newCount }) => ({ ...state, newCount });

const decrementNewCount = (state, { decrement }) => ({
  ...state,
  newCount: safeDecrement(state.newCount, decrement),
});

const setLastNotification = (state, { lastNotification }) => ({ ...state, lastNotification });

const resetNotifications = () => initialState;

export default {
  [REDUCER_KEY]: createResetOnSignOutReducer(initialState, {
    [SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY]: setPaginationNotifications,
    [SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY]: setNewCount,
    [SET_LAST_NOTIFICATION_BY_IDENTITY]: setLastNotification,
    [DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY]: decrementNewCount,
    [RESET_NOTIFICATIONS_BY_IDENTITY]: resetNotifications,
    [ADD_NOTIFICATION_ID_BY_IDENTITY]: addPaginatedNotificationId,
  }),
};
