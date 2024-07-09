import json
from pathlib import Path 
from PIL import Image
from PIL.ExifTags import IFD

f = Path.open("./exifmate/editable_metadata.json")
EDITABLE_METADATA = json.load(f)
f.close()

class Metadata:
  def __init__(self, image: Image):
    self.image = image
    self.exif = self.image.getexif()
    # incomplete_exif = self.image.getexif()
    # self.exif = incomplete_exif.get_ifd(IFD.Exif)

  def read(self, tag_name: str) -> str:
    tag_id = EDITABLE_METADATA["exif"][tag_name]["tag_id"]
    return self.exif.get(tag_id)

  # @staticmethod
  # def editable_metadata():
  #   f = Path.open("./exifmate/editable_metadata.json")
  #   return json.load(f)
