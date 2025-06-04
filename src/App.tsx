import { useEffect, useState } from 'react'

function App() {
  const [imageList, setImageList] = useState<string[]>([]);
  
  useEffect(() => {
    // @ts-expect-error electron bits
    window.electronAPI.onOpenDirectory((imagePaths) => {
      setImageList(imagePaths);
    });
  }, []);

  return (
    <div>
      Images

      <div>
        {imageList.map((path) => (
          <img
            key={path}
            src={path}
            width="200"
          />
        ))}
      </div>
    </div>
  );
}

export default App
