import {
  Caption1,
  Field,
  Input,
  MessageBar,
  Spinner,
  Subtitle1,
  Toolbar,
  ToolbarButton,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { ImageEditRegular } from '@fluentui/react-icons';
import { invoke } from '@tauri-apps/api/core';
import { useCallback, useEffect, useState } from 'react';
import type { ImageInfo } from './file-manager';
import { readMetadata, updateMetadata } from './metadata-handler';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  titlebar: {
    padding: tokens.spacingHorizontalL,
    borderBottomColor: tokens.colorNeutralStroke3,
    borderBottomWidth: tokens.strokeWidthThin,
    borderBottomStyle: 'solid',
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  editor: {
    padding: tokens.spacingHorizontalL,
    flexGrow: '1',
  },
  toolbar: {
    justifyContent: 'space-between',
    boxShadow: tokens.shadow2,
    borderRadius: tokens.borderRadiusSmall,
  },
});

interface Props {
  image?: ImageInfo;
}

function MetadataEditor({ image }: Props) {
  const styles = useStyles();
  const [loadingStatus, setLoadingStatus] = useState<
    'idle' | 'loading' | 'errored'
  >('idle');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  const [exif, setExif] = useState<any>({});

  useEffect(() => {
    if (!image) {
      return;
    }

    setLoadingStatus('loading');

    readMetadata(image.filename, image.path)
      .then((res) => {
        setLoadingStatus('idle');
        setExif(res);
      })
      .catch((err) => {
        setLoadingStatus('errored');
      });
  }, [image]);
  
  const saveMetadata = useCallback(() => {
    if (!image) {
      return;
    }

    console.log('starting save');

    setIsEditing(false);
    updateMetadata(image.filename, image.path, { DateTimeOriginal: exif.DateTimeOriginal })
      .then(() => {
        console.log('yayyy! :D');
      })
      .catch((err) => {
        console.error('oh no :(', err);
      });
  }, [image, exif]);

  if (!image) {
    return (
      <div className={styles.container}>
        <div className={styles.centered}>
          <Caption1>No Image Selected</Caption1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.titlebar}>
        <Subtitle1>{image.filename}</Subtitle1>
      </div>

      {loadingStatus !== 'idle' ? (
        <div className={styles.centered}>
          {loadingStatus === 'loading' && (
            <div className={styles.loader}>
              <Spinner />
              <Caption1>Loading Metadata...</Caption1>
            </div>
          )}

          {loadingStatus === 'errored' && (
            <MessageBar intent="error">Error Loading Metadata</MessageBar>
          )}
        </div>
      ) : (
        <div className={styles.editor}>
          <Field label="Date/Time Original">
            <Input
              disabled={!isEditing}
              value={exif.DateTimeOriginal}
              onChange={(e) => {
                setExif((prev: any) => ({
                  ...prev,
                  DateTimeOriginal: e.target.value,
                }));
              }}
            />
          </Field>
        </div>
      )}

      <Toolbar className={styles.toolbar}>
        {!isEditing && (
          <ToolbarButton
            aria-description="Edit"
            icon={<ImageEditRegular />}
            onClick={() => setIsEditing(true)}
          />
        )}

        {isEditing && (
          <>
            <ToolbarButton onClick={() => setIsEditing(false)}>
              Cancel
            </ToolbarButton>
            <ToolbarButton appearance="primary" onClick={() => saveMetadata()}>
              Save
            </ToolbarButton>
          </>
        )}
      </Toolbar>
    </div>
  );
}

export default MetadataEditor;
