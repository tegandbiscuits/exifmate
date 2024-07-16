from pathlib import Path, PosixPath

from PySide6.QtCore import QObject, Slot
from PySide6.QtQml import QmlElement
from exifmate.metadata import Metadata


QML_IMPORT_NAME = "exifmate"
QML_IMPORT_MAJOR_VERSION = 1


@QmlElement
class Bridge(QObject):
  @Slot(str, result=list)
  def find_images(self, directory: str) -> list:
    extensions = Metadata.supported_extensions()
    images = []
    for p in Path(directory).glob("*"):
      if p.suffix.lower() in extensions:
        images.append({
          "imageName": p.name,
          "imagePath": str(p),
        })
    return images

  @Slot(str, result=dict)
  def get_meta(self, image_path: str) -> dict:
    return Metadata.read_all(image_path)
