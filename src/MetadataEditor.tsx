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
import { useCallback, useEffect, useState } from 'react';
import MapField from './MapField';
import type { ImageInfo } from './file-manager';
import {
  type ExifData,
  exifData,
  readMetadata,
  updateMetadata,
} from './metadata-handler';

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
  formFields: {
    padding: tokens.spacingHorizontalL,
    overflow: 'scroll',
  },
  editForm: {
    flexGrow: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'clip',
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

  const [exif, setExif] = useState<ExifData | null>(null);

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
      .catch(() => {
        setLoadingStatus('errored');
      });
  }, [image]);

  const saveMetadata = useCallback(() => {
    if (!image || !exif) {
      return;
    }

    console.log('starting save');

    setIsEditing(false);
    updateMetadata(image.filename, image.path, exif)
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

      {loadingStatus === 'loading' && (
        <div className={styles.centered}>
          <div className={styles.loader}>
            <Spinner />
            <Caption1>Loading Metadata...</Caption1>
          </div>
        </div>
      )}

      {loadingStatus === 'errored' && (
        <div className={styles.centered}>
          <MessageBar intent="error">Error Loading Metadata</MessageBar>
        </div>
      )}

      {loadingStatus === 'idle' && exif !== null && (
        <form
          className={styles.editForm}
          onSubmit={(e) => {
            e.preventDefault();
            saveMetadata();
          }}
        >
          <div className={styles.formFields}>
            <MapField
              latitude={exif.GPSLatitude}
              longitude={exif.GPSLongitude}
              disabled={!isEditing}
              onPositionChange={([lat, lon]) => {
                setExif((prev) => {
                  if (!prev) return null;

                  return {
                    ...prev,
                    GPSLatitude: lat,
                    GPSLongitude: lon,
                  };
                });
              }}
            />

            {exifData.keyof().options.map((tagName) => (
              <Field
                key={tagName}
                label={tagName}
                hint={exifData.shape[tagName].meta()?.realTag}
              >
                <Input
                  disabled={!isEditing}
                  value={String(exif[tagName])}
                  onChange={(e) => {
                    setExif((prev) => {
                      if (prev !== null) {
                        return {
                          ...prev,
                          [tagName]: e.target.value,
                        };
                      }
                      return null;
                    });
                  }}
                />
              </Field>
            ))}
          </div>

          <Toolbar className={styles.toolbar}>
            {!isEditing && (
              <ToolbarButton
                type="button"
                aria-description="Edit"
                icon={<ImageEditRegular />}
                onClick={() => setIsEditing(true)}
              />
            )}

            {isEditing && (
              <>
                <ToolbarButton
                  onClick={() => setIsEditing(false)}
                  type="button"
                >
                  Cancel
                </ToolbarButton>
                <ToolbarButton type="submit" appearance="primary">
                  Save
                </ToolbarButton>
              </>
            )}
          </Toolbar>
        </form>
      )}
    </div>
  );
}

export default MetadataEditor;
