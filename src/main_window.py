from PySide6 import QtCore, QtWidgets
from file_list_widget import FileListWidget

class MainWindow(QtWidgets.QWidget):
  def __init__(self):
    super().__init__()
    self.text = QtWidgets.QLabel("Hello World",
                                  alignment=QtCore.Qt.AlignCenter)

    self.file_list = FileListWidget()

    split = QtWidgets.QSplitter(self)
    split.addWidget(self.file_list)
    split.addWidget(self.text)

    self.layout = QtWidgets.QVBoxLayout(self)
    self.layout.addWidget(split)
  
  @QtCore.Slot(str)
  def set_directory(self, path):
    self.file_list.list_images(path)
