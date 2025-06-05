import { makeStyles, Title1, tokens } from '@fluentui/react-components';
import ImageGrid from './ImageGrid';

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
  editor: {
    backgroundColor: tokens.colorNeutralBackground1,
    padding: tokens.spacingHorizontalL,
  }
});

function App() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div className={styles.imageSelection}>
        <Title1>Images</Title1>

        <ImageGrid />
      </div>

      <div className={styles.editor}>
        Metadata goes here
      </div>
    </div>
  );
}

export default App
