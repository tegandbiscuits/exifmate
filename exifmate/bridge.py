import json
from pathlib import Path, PosixPath

from PIL import Image
from PIL.ExifTags import IFD
from pillow_heif import register_heif_opener
from PySide6.QtCore import QObject, Slot
from PySide6.QtQml import QmlElement

register_heif_opener()

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

  @Slot(str)
  def get_meta(self, image_path: str) -> None:
    image = Image.open(image_path)
    exifdata = image.getexif()
    more = exifdata.get_ifd(IFD.Exif)

    f = Path.open("./exifmate/editable_metadata.json")
    data = json.load(f)

    for tag_label in data["exif"]:
      tag_id = data["exif"][tag_label]["tag_id"]
      value = more.get(tag_id)

      display_value = value
      if "value_to_human" in data["exif"][tag_label]:
        real_value = value
        if type(value).__name__ == "bytes":
          real_value = int.from_bytes(value, "little")

        try:
          display_value = data["exif"][tag_label]["value_to_human"][str(real_value)]
        except KeyError:
          print(f"!!! {tag_label} is missing a thing {real_value}")

      if "is_byte_string" in data["exif"][tag_label]:
        display_value = value.decode("utf8")

      if "is_byte_int_array" in data["exif"][tag_label]:
        display_value = [int(byte) for byte in value]

      print(f"{tag_label:25}: {display_value}")


p = "/Users/tegan/Downloads/IMG_8755.heif"
b = Bridge()
b.get_meta(p)
