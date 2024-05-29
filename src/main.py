import sys
from PySide6 import QtWidgets, QtGui
from main_window import MainWindow
from state import selected_dir

def open_file():
  dir = QtWidgets.QFileDialog.getExistingDirectory(None, "Open Directory")
  selected_dir.on_next(dir)

if __name__ == "__main__":
  app = QtWidgets.QApplication([])

  menu = QtWidgets.QMenuBar()
  file_menu = menu.addMenu("File")
  open_action = QtGui.QAction("Open")
  open_action.setShortcut(QtGui.QKeySequence.StandardKey.Open)
  open_action.triggered.connect(open_file)

  file_menu.addAction(open_action)

  selected_dir.subscribe(lambda v: print(f"gonna open {v}"))

  widget = MainWindow()
  widget.resize(800, 600)
  widget.show()

  sys.exit(app.exec())
