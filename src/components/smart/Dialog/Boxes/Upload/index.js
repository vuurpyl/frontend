import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import { useSnackbar } from 'notistack';
import { withTranslation, Trans } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import { removeEntities } from '@misakey/store/actions/entities';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { boxFileUploadValidationSchema } from 'constants/validationSchemas/boxes';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import fileToBlob from '@misakey/helpers/fileToBlob';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import log from '@misakey/helpers/log';
import uniqBy from '@misakey/helpers/uniqBy';
import partition from '@misakey/helpers/partition';
import promiseAllNoFailFast from '@misakey/helpers/promiseAllNoFailFast';
import { createBoxEncryptedFileWithProgressBuilder } from '@misakey/helpers/builder/boxes';
import encryptFile from '@misakey/crypto/box/encryptFile';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import FormHelperText from '@material-ui/core/FormHelperText';
import DialogContentText from '@material-ui/core/DialogContentText';
import FieldFiles from 'components/dumb/Form/Field/Files';
import BoxControls from '@misakey/ui/Box/Controls';
import Link from '@material-ui/core/Link';
import FieldBlobs from './BlobsField';

// CONSTANTS
export const BLOBS_FIELD_NAME = 'files';
const BLOBS_FIELD_PREFIX = 'blobs_';
export const INITIAL_VALUES = { [BLOBS_FIELD_NAME]: [] };
export const INITIAL_STATUS = {};
const { conflict } = errorTypes;

// HELPERS
const errorPropNil = compose(
  (e) => isNil(e),
  prop('error'),
);

const uniqBlob = (list) => uniqBy(list, 'key');

// HOOKS
const useStyles = makeStyles((theme) => ({
  mkAgentLink: {
    fontWeight: 'bold',
    color: 'inherit',
  },
  dialogContentRoot: {
    padding: theme.spacing(3),
  },
  dialogContentTextRoot: {
    textAlign: 'center',
  },
}));

function UploadDialog({
  box,
  t,
  onClose,
  onSuccess,
  open,
  initialValues,
  fileTransform,
  autoFocus,
}) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const [blobsUploadStatus, setBlobsUploadStatus] = useState({});

  const setBlobUploadStatus = useCallback(
    (index, value) => setBlobsUploadStatus((previousProgress) => ({
      ...previousProgress,
      [index]: value,
    })),
    [setBlobsUploadStatus],
  );

  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { publicKey, id: boxId } = box;

  const handleUpload = useCallback(
    async (file, index) => {
      const onProgress = (progress) => setBlobUploadStatus(index, { type: 'upload', progress });

      setBlobUploadStatus(index, { type: 'encryption' });
      const { encryptedFile, encryptedMessageContent } = await encryptFile(file, publicKey);
      onProgress(0);
      setBlobUploadStatus(index, { type: 'upload', progress: 0 });


      const formData = new FormData();
      formData.append('encrypted_file', encryptedFile);
      formData.append('msg_encrypted_content', encryptedMessageContent);
      formData.append('msg_public_key', publicKey);

      try {
        const response = await createBoxEncryptedFileWithProgressBuilder(
          boxId, formData, onProgress,
        );
        // const response = await createBoxEncryptedFileBuilder(boxId, formData);
        setBlobUploadStatus(index, { type: 'upload', progress: 100 });

        if (isFunction(onSuccess)) {
          onSuccess(response);
        }

        return response;
      } catch (error) {
        if (error.code === conflict) {
          const { details = {} } = error;
          if (details.lifecycle === conflict) {
            dispatch(removeEntities([{ id: boxId }], BoxesSchema));
            enqueueSnackbar(t('boxes:read.events.create.error.lifecycle'), { variant: 'error' });
          }
        }
        throw error;
      }
    },
    [publicKey, boxId, dispatch, onSuccess, enqueueSnackbar, setBlobUploadStatus, t],
  );

  const getOnReset = useCallback(
    (resetForm) => () => {
      resetForm({ values: INITIAL_VALUES });
      onClose();
    },
    [onClose],
  );

  const onSubmit = useCallback(
    async (form, { resetForm, setStatus }) => {
      const blobs = form[BLOBS_FIELD_NAME];
      setBlobsUploadStatus({});

      // Could be improved later with a backend endpoint to upload several files at a time
      const newBlobList = await promiseAllNoFailFast(
        blobs
          .map(async ({ blob, ...rest }, index) => {
            try {
              const response = await handleUpload(blob, index);
              return { ...response, ...rest, blob, isSent: true };
            } catch (e) {
              log(e, 'error');
              return { ...rest, blob, error: true };
            }
          }),
      );

      const [, errors] = partition(newBlobList, errorPropNil);

      resetForm();
      setBlobsUploadStatus({});

      if (isEmpty(errors)) {
        const text = t('boxes:read.upload.success');
        enqueueSnackbar(text, { variant: 'success' });
        onClose();
      } else {
        setStatus({ [BLOBS_FIELD_NAME]: newBlobList });
      }
    },
    [handleUpload, t, enqueueSnackbar, onClose],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-labelledby="upload-dialog-title"
      aria-describedby="upload-dialog-description"
    >
      <Formik
        validationSchema={boxFileUploadValidationSchema}
        initialValues={initialValues}
        initialStatus={INITIAL_STATUS}
        onSubmit={onSubmit}
      >
        {({ resetForm }) => (
          <Form>
            <DialogTitleWithClose onClose={getOnReset(resetForm)}>
              <BoxControls
                ml="auto"
                alignItems="center"
                primary={{
                  type: 'submit',
                  text: t('common:send'),
                }}
                formik
              />
            </DialogTitleWithClose>
            <DialogContent className={classes.dialogContentRoot}>
              <FieldFiles
                name={BLOBS_FIELD_NAME}
                prefix={BLOBS_FIELD_PREFIX}
                labelText={t('boxes:read.upload.dialog.label')}
                renderItem={(props) => <FieldBlobs {...props} />}
                fileTransform={fileTransform}
                uniqFn={uniqBlob}
                uploadStatus={blobsUploadStatus}
                emptyTitle={(
                  <DialogContentText
                    classes={{ root: classes.dialogContentTextRoot }}
                    id="upload-dialog-description"
                  >
                    {t('boxes:read.upload.dialog.text')}
                  </DialogContentText>
                )}
                autoFocus={autoFocus}
              />
              <FormHelperText>
                <Trans i18nKey={t('boxes:read.upload.dialog.helperText')}>
                  Déposer le fichier que vous souhaitez chiffrer.
                  {' '}
                  <Link
                    href={t('boxes:read.upload.dialog.helperLink')}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="secondary"
                  >
                    En savoir plus
                  </Link>
                </Trans>
              </FormHelperText>
            </DialogContent>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}

UploadDialog.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  fileTransform: PropTypes.func,
  autoFocus: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {
  // request: null,
  open: false,
  initialValues: INITIAL_VALUES,
  fileTransform: fileToBlob,
  autoFocus: false,
};

export default withTranslation(['common', 'boxes'])(UploadDialog);
