import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import { IDENTIFIER as USER_TYPE, EMAIL_DOMAIN as DOMAIN_TYPE } from '@misakey/ui/constants/accessTypes';

import isEmpty from '@misakey/helpers/isEmpty';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import emailToDisplayName from '@misakey/helpers/emailToDisplayName';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';


import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import TextField from '@misakey/ui/TextField';
import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemDomain from '@misakey/ui/ListItem/Domain';
import AutocompleteWhitelistPaper from '@misakey/ui/Autocomplete/Whitelist/Paper';
import IconButtonSubmit from '@misakey/ui/IconButton/Submit';
import Tooltip from '@material-ui/core/Tooltip';
import ChipUser from '@misakey/ui/Chip/User';
import ChipDomain from '@misakey/ui/Chip/Domain';

import CheckIcon from '@material-ui/icons/Check';

// CONSTANTS
const INPUT_SEPARATORS = [',', ';'];
const DOMAIN_WILDCARD = '*@';
const TYPES = [DOMAIN_TYPE, USER_TYPE];

const WHITELISTED_EL_PROP_TYPE = {
  type: PropTypes.oneOf(TYPES).isRequired,
  displayName: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  identifierValue: PropTypes.string.isRequired,
};

const SUBMIT_INDICATOR_PADDING = 4;

const INPUT_EMPTY_REGEX = new RegExp(`^[${INPUT_SEPARATORS} ]*$`);

// HELPERS
const filterOptions = createFilterOptions();
const identifierValueProp = prop('identifierValue');

const isInputEmpty = (inputValue) => INPUT_EMPTY_REGEX.test(inputValue);

const inputEndsWithSeparator = (inputValue) => INPUT_SEPARATORS
  .some((separator) => inputValue.endsWith(separator));

const isDomainString = (string) => string.startsWith(DOMAIN_WILDCARD);

const valueToUserValue = (value) => ({
  type: USER_TYPE,
  displayName: emailToDisplayName(value),
  identifierValue: value,
});

// HOOKS
const useStyles = makeStyles((theme) => ({
  // styles applied to submit indicator to look similar to other autocomplete indicators
  // see https://github.com/mui-org/material-ui/blob/master/packages/material-ui-lab/src/Autocomplete/Autocomplete.js#L152
  submitIndicator: {
    // same padding as other indicators
    padding: SUBMIT_INDICATOR_PADDING,
    position: 'absolute',
    right: 52, // next to other indicators
  },
  // styles applied to inputRoot to handle extra padding from submitIndicator
  // see https://github.com/mui-org/material-ui/blob/master/packages/material-ui-lab/src/Autocomplete/Autocomplete.js#L50
  autocompleteHasPopupIcon: {
    '.MuiAutocomplete-inputRoot': {
      // add padding for submitIndicator (= 2 buttons + 1 padding)
      paddingRight: 52 + 4,
    },
  },
  autocompleteHasClearIcon: {
    '.MuiAutocomplete-inputRoot': {
      // add padding for submitIndicator (= 2 buttons + 1 padding)
      paddingRight: 52 + 4,
    },
    '&.MuiAutocomplete-hasPopupIcon .MuiAutocomplete-inputRoot': {
    // add padding for submitIndicator (= 3 buttons + 2 paddings)
      paddingRight: 78 + 8,
    },
  },
  autocompleteInputRoot: {
    '& .MuiAutocomplete-input': {
      minWidth: '50%',
      [theme.breakpoints.only('xs')]: {
        minWidth: '100%',
      },
    },
  },
}));

// COMPONENTS
const AutocompleteWhitelist = ({
  onChange, getOptionDisabled,
  textFieldProps, name, value, ...props
}) => {
  const classes = useStyles();
  const { t } = useTranslation(['components', 'common']);

  const [inputValue, setInputValue] = useState('');

  const inputEmpty = useMemo(
    () => isEmpty(inputValue),
    [inputValue],
  );

  const valueToDomainValue = useCallback(
    (valueToTransform) => ({
      type: DOMAIN_TYPE,
      displayName: t('components:whitelist.domainTitle'),
      identifierValue: valueToTransform.replace('*@', ''),
    }),
    [t],
  );

  const handleGetOptionDisabled = useCallback(
    (option) => {
      const { identifierValue } = option;
      const isInValue = value
        .some(({
          identifierValue: itemIdentifierValue,
        }) => itemIdentifierValue === identifierValue);
      if (isInValue) {
        return true;
      }
      if (isFunction(getOptionDisabled)) {
        return getOptionDisabled(option);
      }
      return false;
    },
    [getOptionDisabled, value],
  );

  const onInputChange = useCallback(
    (event, nextValue, reason) => {
      const nextValueTrimmed = nextValue.trim();
      const isNextValueEmpty = isInputEmpty(nextValueTrimmed);
      if (isNextValueEmpty) {
        setInputValue('');
      } else {
        setInputValue(nextValueTrimmed);
        if (reason === 'input' && inputEndsWithSeparator(nextValueTrimmed)) {
          const inputValueWithoutSeparator = nextValueTrimmed.slice(0, -1);
          const newValue = isDomainString(inputValueWithoutSeparator)
            ? valueToDomainValue(inputValueWithoutSeparator)
            : valueToUserValue(inputValueWithoutSeparator);
          if (!handleGetOptionDisabled(newValue)) {
            onChange(event, value.concat([newValue]), 'select-option');
          }
        }
      }
    },
    [onChange, value, handleGetOptionDisabled, valueToDomainValue],
  );

  const handleFilterOptions = useCallback(
    (options, params) => {
      const filtered = filterOptions(options, params);
      const { inputValue: filterInputValue } = params;
      if (!isEmpty(filterInputValue)) {
        if (isDomainString(filterInputValue)) {
          filtered.push(valueToDomainValue(filterInputValue));
          return filtered;
        }
        filtered.push(valueToUserValue(filterInputValue));
      }
      return filtered;
    },
    [valueToDomainValue],
  );

  const getOptionLabel = useCallback(
    (option) => {
      if (isEmpty(option)) {
        return '';
      }
      return identifierValueProp(option);
    },
    [],
  );

  const renderOption = useCallback(
    ({ type, avatarUrl, identifierValue, ...rest }) => {
      if (type === DOMAIN_TYPE) {
        return (
          <ListItemDomain
            component="div"
            disableGutters
            identifier={identifierValue}
            {...rest}
          />
        );
      }
      return (
        <ListItemUser
          component="div"
          disableGutters
          avatarUrl={avatarUrl}
          identifier={identifierValue}
          {...rest}
        />
      );
    },
    [],
  );

  const renderTags = useCallback(
    (tags, getTagProps) => (tags || []).map(({ identifierValue, type, ...rest }, index) => {
      if (type === DOMAIN_TYPE) {
        return (
          <Tooltip
            key={identifierValue}
            title={identifierValue}
          >
            <ChipDomain
              key={identifierValue}
              identifier={identifierValue}
              {...rest}
              {...getTagProps(index)}
            />
          </Tooltip>
        );
      }
      return (
        <Tooltip
          key={identifierValue}
          title={identifierValue}
        >
          <ChipUser
            key={identifierValue}
            identifier={identifierValue}
            {...rest}
            {...getTagProps(index)}
          />
        </Tooltip>
      );
    }),
    [],
  );

  return (
    <Autocomplete
      classes={{
        hasPopupIcon: classes.autocompleteHasPopupIcon,
        hasClearIcon: classes.autocompleteHasClearIcon,
        inputRoot: classes.autocompleteInputRoot,
        input: classes.autocompleteInput,
      }}
      name={name}
      value={value}
      onChange={onChange}
      onInputChange={onInputChange}
      filterOptions={handleFilterOptions}
      renderOption={renderOption}
      getOptionLabel={getOptionLabel}
      getOptionDisabled={handleGetOptionDisabled}
      inputValue={inputValue}
      renderTags={renderTags}
      renderInput={({ InputProps: { endAdornment, ...InputPropsRest }, ...params }) => (
        <TextField
          variant="standard"
          name={name}
          InputProps={{
            endAdornment: (
              <>
                {!isEmpty(value) && inputEmpty && (
                  <Tooltip title={t('common:submit')}>
                    <IconButtonSubmit
                      classes={{ root: classes.submitIndicator }}
                    >
                      <CheckIcon />
                    </IconButtonSubmit>
                  </Tooltip>
                )}
                {endAdornment}
              </>
            ),
            ...InputPropsRest,
          }}
          {...params}
          {...textFieldProps}
        />
      )}
      noOptionsText={null}
      PaperComponent={AutocompleteWhitelistPaper}
      autoHighlight
      clearOnBlur
      clearOnEscape
      selectOnFocus
      handleHomeEndKeys
      multiple
      {...props}
    />
  );
};

AutocompleteWhitelist.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape(WHITELISTED_EL_PROP_TYPE)),
  name: PropTypes.string.isRequired,
  value: PropTypes.arrayOf(PropTypes.shape(WHITELISTED_EL_PROP_TYPE)),
  textFieldProps: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  getOptionDisabled: PropTypes.func,
};

AutocompleteWhitelist.defaultProps = {
  options: [],
  value: [],
  textFieldProps: {},
  getOptionDisabled: null,
};

export default AutocompleteWhitelist;
