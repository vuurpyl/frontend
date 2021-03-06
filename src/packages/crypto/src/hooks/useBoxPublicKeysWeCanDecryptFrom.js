import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  keyPairFromSecretKey,
} from '../crypto';

const pubkeyCache = new Map();

/**
 * Memoized public key computation
 * @param {string} secretKey
 */
function publicKeyFromSecretKey(secretKey) {
  if (!pubkeyCache.has(secretKey)) {
    const { publicKey } = keyPairFromSecretKey(secretKey);
    pubkeyCache.set(secretKey, publicKey);
  }

  return pubkeyCache.get(secretKey);
}

/**
 * This should not be imported in application code;
 * However it is used in some places of the crypto package,
 * for instance in action `loadSecrets.js`.
 * All this will change when the pubkey→seckey mapping will be stored in the secret backup
 * (see https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
 * @param {object} cryptoSecrets must be a list of asymetric secret keys
 */
export function publicKeysWeCanDecryptFrom(secretKeys) {
  return new Map(secretKeys.map(
    (secretKey) => [publicKeyFromSecretKey(secretKey), secretKey],
  ));
}

/**
 * A React hook that computes a mapping
 * from any public key we can decrypt from
 * to the corresponding secret key to use for decryption.
 *
 * It uses two layers of memoization:
 * one regarding the entire set of secret keys in the store,
 * and a second one for the individual computation of public keys.
 */
export default function useBoxPublicKeysWeCanDecryptFrom() {
  const secretKeys = useSelector(cryptoSelectors.getBoxSecretKeys);

  return useMemo(
    () => publicKeysWeCanDecryptFrom(secretKeys),
    [secretKeys],
  );
}
