import { makePaginationReducer } from 'store/reducers/helpers/pagination';

import path from '@misakey/helpers/path';
// CONSTANTS
export const REDUCER_KEY = 'savedFilesPagination';

// HELPERS
export const getState = () => path([REDUCER_KEY]);

// FACTORY CALLS
export const {
  actions,
  actionCreators,
  selectors,
  reducer,
} = makePaginationReducer('SAVED_FILES', getState());

// REDUCER
export default {
  [REDUCER_KEY]: reducer,
};
