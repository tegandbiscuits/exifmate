from PySide6.QtQml import QmlElement
from PySide6.QtCore import QObject, Slot
# from glob import glob
from pathlib import Path, PosixPath

QML_IMPORT_NAME = "exifmate"
QML_IMPORT_MAJOR_VERSION = 1

SUPPORTED_TYPES = {
  '.jpg',
  '.JPG',
  '.jpeg',
  '.JPEG',
}

@QmlElement
class Bridge(QObject):
  def __to_image_list(self, image_path: PosixPath):
    return {
      "imageName": image_path.name,
      "imagePath": str(image_path),
    }

  @Slot(str, result=list)
  def find_images(self, directory):
    image_paths = (p.resolve() for p in Path(directory).glob("*") if p.suffix in SUPPORTED_TYPES)
    # image_paths = Path(directory).glob("*")

    image_list = map(self.__to_image_list, image_paths)
    return list(image_list)
