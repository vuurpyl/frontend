import { selectors } from '@misakey/auth/store/reducers/auth';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import asyncBatch from 'helpers/batch/async';

import {
  listCryptoActions,
  deleteCryptoaction,
} from '@misakey/crypto/HttpApi';

import processSetBoxKeyShareCryptoAction from './processSetBoxKeyShareCryptoAction';
import updateBackup from './updateBackup';

const { accountId: getAccountId } = selectors;

/**
 * pullCryptoactions fetches the cryptoactions for the current account
 * and applies all the ones that can be applied immediately
 * (an example of cryptoaction that cannot be applied automatically
 * are auto invitations because the user must consent to joining the box
 * before we apply it).
 *
 * The name “pull” is a reference to `git pull` that fetches new commits
 * *and* applies them (merges the remote branch into the local one).
 */
export default ({ boxSecretKeysByPublicKeys }) => (
  async (dispatch, getState) => {
    const state = getState();
    const accountId = getAccountId(state);

    // cryptoactions is supposed to be an array
    const cryptoactions = await listCryptoActions({ accountId });

    let isBackupUpdateNeeded = false;
    const processedIds = [];
    await asyncBatch(async () => {
      // If we want to process cryptoactions one after the other
      // we have to use a `for` loop with `await` in it
      /* eslint-disable no-restricted-syntax, no-await-in-loop */
      for (const cryptoaction of cryptoactions) {
        const { id, type } = cryptoaction;

        // `wasProcessed` is true unless we set it to `false`.
        // This way we don't have to add `wasProcessed = true`
        // every time there is a new type of cryptoaction we handle in this action
        let wasProcessed = true;

        try {
          switch (type) {
            case 'set_box_key_share':
              await dispatch(processSetBoxKeyShareCryptoAction({
                cryptoaction,
                boxSecretKeysByPublicKeys,
              }));
              break;
            default:
              wasProcessed = false;
              break;
          }
        } catch (error) {
          logSentryException(error, 'processing cryptoaction', { crypto: true });
          wasProcessed = false;
        }

        if (wasProcessed) {
          processedIds.push(id);
          // will be true if one or more cryptoactions were processed
          isBackupUpdateNeeded = true;
        }
      }
      /* eslint-enable no-restricted-syntax, no-await-in-loop */

      if (isBackupUpdateNeeded) {
        await dispatch(updateBackup());
      }
    });

    // TODO use batch deletion when backend supports it
    processedIds.forEach((id) => {
      // no need to await the deletion of cryptoactions
      deleteCryptoaction({ accountId, cryptoactionId: id });
    });
  }
);
