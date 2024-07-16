from pathlib import Path, PosixPath

from PySide6.QtCore import QObject, Slot
from PySide6.QtQml import QmlElement
from exifmate.metadata import Metadata


QML_IMPORT_NAME = "exifmate"
QML_IMPORT_MAJOR_VERSION = 1

SUPPORTED_TYPES = {
  ".jpg",
  ".JPG",
  ".jpeg",
  ".JPEG",
}


@QmlElement
class Bridge(QObject):
  def __to_image_list(self, image_path: PosixPath) -> dict:
    return {
      "imageName": image_path.name,
      "imagePath": str(image_path),
    }

  @Slot(str, result=list)
  def find_images(self, directory: str) -> list:
    image_paths = (
      p.resolve() for p in Path(directory).glob("*") if p.suffix in SUPPORTED_TYPES
    )

    image_list = map(self.__to_image_list, image_paths)
    return list(image_list)

  @Slot(str, result=dict)
  def get_meta(self, image_path: str) -> dict:
    return Metadata.read_all(image_path)
