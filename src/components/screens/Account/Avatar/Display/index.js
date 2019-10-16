import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from '@misakey/ui/Navigation';
import Button from '@material-ui/core/Button';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import BoxSection from '@misakey/ui/Box/Section';

import routes from 'routes';

import FormImage from './image';

import 'components/screens/Account/Avatar/Display/index.scss';

// COMPONENTS
const AccountAvatarDisplay = ({
  t,
  isSubmitting,
  isValid,
  displayName,
  avatarUri,
  name,
  previewName,
  ...rest
}) => (
  <div className="Display">
    <Navigation pushPath={routes.account._} title={t('profile:avatar.title')} />
    <Container maxWidth="md" className="content">
      <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
        {t('profile:avatar.subtitle')}
      </Typography>
      <BoxSection>
        <FormImage
          previewName={previewName}
          name={name}
          text={displayName}
          {...rest}
        />

        <div className="controls">
          <Button
            color="secondary"
            to={routes.account.profile.avatar.upload}
            component={Link}
            aria-label={t('edit')}
          >
            {t('edit')}
          </Button>
          <ButtonSubmit isSubmitting={isSubmitting} isValid={isValid} aria-label={t('submit')}>
            {t('submit')}
          </ButtonSubmit>
        </div>
      </BoxSection>

    </Container>
  </div>
);

AccountAvatarDisplay.propTypes = {
  t: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  displayName: PropTypes.string,
  avatarUri: PropTypes.string,
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
};

AccountAvatarDisplay.defaultProps = {
  displayName: '',
  avatarUri: '',
};

export default withTranslation()(AccountAvatarDisplay);
