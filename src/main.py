import sys
from PySide6 import QtWidgets, QtGui
from main_window import MainWindow

if __name__ == "__main__":
  app = QtWidgets.QApplication([])

  widget = MainWindow()
  widget.resize(800, 600)
  widget.show()

  menu = QtWidgets.QMenuBar()

  def open_file():
    dir = QtWidgets.QFileDialog.getExistingDirectory(None, "Open Directory")
    widget.set_directory(dir)

  open_action = QtGui.QAction("Open")
  open_action.setShortcut(QtGui.QKeySequence.StandardKey.Open)
  open_action.triggered.connect(open_file)

  file_menu = menu.addMenu("File")
  file_menu.addAction(open_action)

  sys.exit(app.exec())
