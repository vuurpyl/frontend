import { useState, useRef, useMemo, useCallback, useEffect } from 'react';

import eventGetFile from '@misakey/helpers/event/getFile';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import debounce from '@misakey/helpers/debounce';

// CONSTANTS
const FILE_READER = new FileReader();

const PROGRESS_MAX = 100;

// HELPERS
const computeProgress = ({ loaded, total }) => (loaded / total) * PROGRESS_MAX;

const eventMatchFile = (event, { name }) => {
  const { name: eventFileName } = eventGetFile(event);
  return name === eventFileName;
};

// HOOKS
const useEndProgress = (setProgress) => useMemo(
  () => debounce(() => setProgress(undefined)), [setProgress],
);

const useOnLoadStart = (setProgress, onLoadStart) => useCallback((event) => {
  setProgress(0);
  if (isFunction(onLoadStart)) {
    onLoadStart(event);
  }
}, [setProgress, onLoadStart]);

const useOnProgress = (setProgress, onProgress) => useCallback((event) => {
  setProgress(computeProgress(event));
  if (isFunction(onProgress)) {
    onProgress(event);
  }
}, [onProgress, setProgress]);

const useOnClearProgress = (setProgress) => useCallback(
  () => {
    setProgress(undefined);
  }, [setProgress],
);

const useOnReset = (setFile, setPreview) => useCallback(
  () => {
    setFile(undefined);
    setPreview(undefined);
  },
  [setFile, setPreview],
);


export default ({ onLoadStart, onProgress, onLoad, onError }) => {
  const [progress, setProgress] = useState();
  const [file, setFile] = useState();
  const [preview, setPreview] = useState();
  const changeEvent = useRef();
  const loadFinished = useRef();

  const endProgress = useEndProgress(setProgress);

  const handleLoadStart = useOnLoadStart(setProgress, onLoadStart);
  const handleProgress = useOnProgress(setProgress, onProgress);

  const handleLoad = useCallback(
    () => {
      const { result } = FILE_READER;
      setPreview(result);
      endProgress();
      const { current } = changeEvent;
      if (!isNil(current) && eventMatchFile(current, file)) {
        onLoad(current, { file, preview: result });
      }
      const { current: loadFinishedCurrent } = loadFinished;
      if (!isNil(loadFinishedCurrent)) {
        loadFinishedCurrent();
      }
    },
    [endProgress, file, onLoad, changeEvent, loadFinished],
  );

  const handleFileError = useCallback((event) => {
    if (isFunction(onError)) {
      onError(event);
    }
  }, [onError]);

  const onClearProgress = useOnClearProgress(setProgress);
  const onChange = useCallback(
    (event) => {
      event.persist(); // @TODO remove when upgrading to React 17
      const eventFile = eventGetFile(event);
      if (!isNil(eventFile)) {
        changeEvent.current = event;
        setFile(eventFile);
        FILE_READER.readAsDataURL(eventFile);
      }
      return new Promise((resolve) => {
        loadFinished.current = resolve;
      });
    },
    [setFile, changeEvent],
  );

  const onReset = useOnReset(setFile, setPreview);

  useEffect(
    () => {
      FILE_READER.onloadstart = handleLoadStart;
      FILE_READER.onprogress = handleProgress;
      FILE_READER.onload = handleLoad;
      FILE_READER.onerror = handleFileError;
    },
    [handleFileError, handleLoad, handleLoadStart, handleProgress],
  );



  return [{ file, preview, progress }, { onChange, onClearProgress, onReset }];
};
