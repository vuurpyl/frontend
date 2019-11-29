import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import RatingSchema from 'store/schemas/Rating';
import routes from 'routes';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';

import Button from '@material-ui/core/Button';
import Card from 'components/dumb/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Rating from '@material-ui/lab/Rating';
import Typography from '@material-ui/core/Typography';

// CONSTANTS
const DISABLED_RATING = null;

// HELPERS
const commentProp = propOr('', 'comment');
const valueProp = propOr(DISABLED_RATING, 'value');

// HOOKS
const useStyles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.palette.common.white,
  },
  feedbackLink: {
    textAlign: 'center',
    margin: 'auto',
    display: 'block',
  },
  cardContentRoot: {
    padding: '0 1rem',
  },
  comment: {
    display: 'block',
  },
  commentTypography: {
    whiteSpace: 'pre-wrap',
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  ratingRoot: {
    fontSize: theme.typography.h2.fontSize,
  },
  actionButton: {
    marginLeft: 'auto',
  },
}));

// COMPONENTS
const MyFeedbackCard = ({ mainDomain, rating, t }) => {
  const disabled = useMemo(
    () => isNil(rating),
    [rating],
  );

  const classes = useStyles(disabled);

  const value = useMemo(
    () => valueProp(rating),
    [rating],
  );

  const comment = useMemo(
    () => commentProp(rating),
    [rating],
  );

  const feedbackKey = useMemo(() => (disabled ? 'give' : 'edit'), [disabled]);

  const linkTo = useMemo(
    () => generatePath(routes.citizen.application.feedback.me, { mainDomain }),
    [mainDomain],
  );

  return (
    <Card classes={{ root: classes.card }}>
      <CardHeader
        title={t('common:feedback.me')}
        action={(disabled) ? null : (
          <Rating
            value={value}
            readOnly
            disabled={disabled}
            size="large"
            classes={{ iconFilled: classes.ratingIconFilled }}
          />
        )}
      />
      <CardContent classes={{ root: classes.cardContentRoot }}>

        <div className={classes.comment}>
          {disabled ? (
            <Link to={linkTo} className={classes.feedbackLink}>
              <Rating
                value={value}
                size="large"
                classes={{ root: classes.ratingRoot, iconFilled: classes.ratingIconFilled }}
              />
            </Link>
          ) : (
            <Typography
              variant="body2"
              color="textSecondary"
              className={classes.commentTypography}
            >
              {comment}
            </Typography>
          )}
        </div>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="secondary"
          to={linkTo}
          component={Link}
          aria-label={t(`common:feedback.${feedbackKey}`)}
          classes={{ root: classes.actionButton }}
        >
          {t(`common:feedback.${feedbackKey}`)}
        </Button>
      </CardActions>
    </Card>

  );
};

MyFeedbackCard.propTypes = {
  mainDomain: PropTypes.string.isRequired,
  rating: PropTypes.shape(RatingSchema.propTypes),
  t: PropTypes.func.isRequired,
};

MyFeedbackCard.defaultProps = {
  rating: null,
};

export default withTranslation('common')(MyFeedbackCard);
