import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import Avatar from '@misakey/ui/Avatar';
import getBackgroundAndColorFromString from '@misakey/helpers/getBackgroundAndColorFromString';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  avatarColorized: ({ backgroundColor }) => ({
    border: `2px solid #${backgroundColor}`,
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.secondary,
    boxSizing: 'border-box',
  }),
}));


/**
 * Colorized Avatar is a circular avatar that will display image if set and
 * first letter of text (name / email) if not set.
 * If displaying text, will generate a color from a hash of the text.
 */
const AvatarColorized = ({ text, image, classes, ...rest }) => {
  const { backgroundColor } = useMemo(
    () => getBackgroundAndColorFromString(text),
    [text],
  );

  const displayText = useMemo(() => text.charAt(0).toUpperCase(), [text]);

  const internalClasses = useStyles({ backgroundColor });

  if (image) {
    return (
      <Avatar
        classes={{ colorDefault: internalClasses.avatarColorized, ...classes }}
        src={image}
        alt={text}
        {...rest}
      />
    );
  }

  return (
    <Avatar
      classes={{ colorDefault: internalClasses.avatarColorized, ...classes }}
      alt={text}
      {...rest}
    >
      {displayText}
    </Avatar>
  );
};

AvatarColorized.propTypes = {
  /** The image to use as avatar. If not present, will use first letter of text */
  image: PropTypes.string,
  /** The text to derivate the color from, and to extract the first letter. */
  text: PropTypes.string.isRequired,
  classes: PropTypes.object,
};

AvatarColorized.defaultProps = {
  image: '',
  classes: {},
};

export default AvatarColorized;
