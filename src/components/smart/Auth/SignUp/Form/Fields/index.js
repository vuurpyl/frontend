import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation, Trans } from 'react-i18next';

import FieldText from '@misakey/ui/Form/Field/Text';
import FieldCheckbox from '@misakey/ui/Form/Field/Checkbox';
import Fields from '@misakey/ui/Form/Fields';

import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const defaultProps = {
  email: { component: FieldText, type: 'email' },
  displayName: { component: FieldText },
  password: { component: FieldText, type: 'password' },
  tos: { component: FieldCheckbox },
};

const SignUpFormFields = ({ t, i18n, tReady, ...fields }) => {
  const tosCheckboxLabel = (
    <Typography>
      <Trans i18nKey="auth:signUp.form.privacyPolicyCheckboxLabel">
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        {'J\'accepte les '}
        <Link
          href={t('footer.links.tos.href')}
          color="textSecondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          CGUs
        </Link>
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        {', et la '}
        <Link
          href={t('footer.links.privacy.href')}
          color="textSecondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          politique de confidentialité
        </Link>
        {/* eslint-disable-next-line react/jsx-curly-brace-presence */}
        {' de Misakey.'}
      </Trans>
    </Typography>
  );

  const defaultFields = defaultProps;
  defaultFields.tos.label = tosCheckboxLabel;

  return (<Fields fields={fields} prefix="signUp." defaultFields={defaultFields} />);
};

SignUpFormFields.defaultProps = defaultProps;

SignUpFormFields.propTypes = {
  t: PropTypes.func.isRequired,
  i18n: PropTypes.object.isRequired,
  tReady: PropTypes.bool.isRequired,
  email: PropTypes.object,
  displayName: PropTypes.object,
  password: PropTypes.object,
  tos: PropTypes.object,
};

export default withTranslation('', 'auth')(SignUpFormFields);
