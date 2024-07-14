import json
from pathlib import Path

from PIL import Image
from PIL.ExifTags import IFD

f = Path.open("./exifmate/editable_metadata.json")
EDITABLE_METADATA = json.load(f)
f.close()


class Metadata:
  def __init__(self, image: Image) -> None:
    self.image = image
    self.exif = self.image.getexif()

  def read(self, tag_name: str) -> str:
    tag = EDITABLE_METADATA["exif"][tag_name]
    base_value = self.exif.get(tag["tag_id"])

    if base_value is None:
      base_value = self.exif.get_ifd(IFD.Exif).get(tag["tag_id"])

    if "value_to_human" in tag:
      return tag["value_to_human"].get(base_value) or base_value

    if isinstance(base_value, bytes):
      return base_value.decode("utf8")

    return base_value
