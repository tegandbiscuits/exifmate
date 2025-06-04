import { Image, makeStyles, Title1, tokens } from '@fluentui/react-components';
import { useEffect, useState } from 'react'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    maxHeight: '100vh',
    overflow: 'clip',
  },
  imageSelection: {
    backgroundColor: tokens.colorNeutralBackground2,
    width: '60vw',
    overflowY: 'scroll',
    padding: tokens.spacingHorizontalL,
  },
  imageGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  image: {
    width: '200px',
    height: '200px',
  },
  editor: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingHorizontalL,
  }
});

function App() {
  const styles = useStyles();
  const [imageList, setImageList] = useState<string[]>([]);
  
  useEffect(() => {
    // @ts-expect-error electron bits
    window.electronAPI.onOpenDirectory((imagePaths) => {
      setImageList(imagePaths);
    });
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.imageSelection}>
        <Title1>Images</Title1>

        <div className={styles.imageGrid}>
          {imageList.map((path) => (
            <Image
              key={path}
              src={path}
              fit="contain"
              className={styles.image}
            />
          ))}
        </div>
      </div>

      <div className={styles.editor}>
        Metadata goes here
      </div>
    </div>
  );
}

export default App
