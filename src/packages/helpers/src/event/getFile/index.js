import getTargetOrCurrentTarget from '@misakey/helpers/event/targetOrCurrentTarget/get';
import path from '@misakey/helpers/path';
import compose from '@misakey/helpers/compose';

// HELPERS
const filePath = path(['files', '0']);

export default compose(
  filePath,
  getTargetOrCurrentTarget,
);
