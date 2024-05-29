from PySide6 import QtCore, QtWidgets
import os
import glob

class FileListWidget(QtWidgets.QListWidget):
  @QtCore.Slot(str)
  def list_images(self, path):
    search_path = os.path.join(path, "*.jpg")
    files = glob.glob(search_path)
    self.addItems(files)
