import json
from pathlib import Path
from pillow_heif import register_heif_opener

from PIL import Image
from PIL.ExifTags import IFD

register_heif_opener()

f = Path.open("./exifmate/editable_metadata.json")
EDITABLE_METADATA = json.load(f)
f.close()

SUPPORTED_FORMATS = ["JPEG", "JPEG2000", "PNG", "TIFF", "HEIF"]

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
      return tag["value_to_human"].get(str(base_value)) or base_value

    if isinstance(base_value, bytes):
      return base_value.decode("utf8")

    if base_value is not None:
      return str(base_value)
    else:
      return None

  @staticmethod
  def read_all(image_path: str) -> dict:
    image = Image.open(image_path)
    md_reader = Metadata(image)

    exif_values = [
      {"key": tag_name, "value": (md_reader.read(tag_name) or "")}
      for tag_name in EDITABLE_METADATA["exif"]
    ]

    image.close()
    return { "exif": exif_values }

  @staticmethod
  def supported_extensions() -> list:
    registered = Image.registered_extensions()
    return [ext for ext in registered if registered[ext] in SUPPORTED_FORMATS] 
