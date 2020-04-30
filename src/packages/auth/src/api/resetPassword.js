import API from '@misakey/api';

import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

import hashPassword from '../passwordHashing/hashPassword';
import genParams from '../passwordHashing/genParams';

export default async function resetPassword({
  email,
  confirmationCode,
  newPassword,
  dispatchHardPasswordChange,
  auth = false,
}) {
  const [
    { backupData, pubkeys },
    newPasswordHash,
  ] = await Promise.all([
    dispatchHardPasswordChange(newPassword),
    hashPassword({ password: newPassword, pwdHashParams: genParams() }),
  ]);

  const payload = objectToSnakeCaseDeep({
    // passed through directly from input
    email,
    otp: confirmationCode, // API still uses old term "OTP"
    // computed
    backupData,
    pubkeys,
    // new password hash is inserted later
    // because "snake case" helper does not work well on it
    // ("base64" is turned into "base_64")
  });

  payload.new_password_hash = newPasswordHash;

  const endpoint = API.endpoints.user.password.reset;
  if (!auth) { endpoint.auth = false; }
  return API.use(endpoint).build(undefined, payload).send();
}