import sys
import random
from PySide6 import QtCore, QtWidgets, QtGui

class MyWidget(QtWidgets.QWidget):
    def __init__(self):
        super().__init__()

        self.hello = ["Hallo Welt", "Hei maailma", "Hola Mundo", "Привет мир"]

        self.button = QtWidgets.QPushButton("Click me!")
        self.text = QtWidgets.QLabel("Hello World",
                                     alignment=QtCore.Qt.AlignCenter)

        self.layout = QtWidgets.QVBoxLayout(self)
        self.layout.addWidget(self.text)
        self.layout.addWidget(self.button)

        self.button.clicked.connect(self.magic)


    @QtCore.Slot()
    def magic(self):
        self.text.setText(random.choice(self.hello))

def open_file():
  dir = QtWidgets.QFileDialog.getExistingDirectory(None, "Open Directory")
  print(f"here: {dir}")

if __name__ == "__main__":
    app = QtWidgets.QApplication([])

    menu = QtWidgets.QMenuBar()
    file_menu = menu.addMenu("File")
    open_action = QtGui.QAction("Open")
    open_action.setShortcut(QtGui.QKeySequence.StandardKey.Open)
    open_action.triggered.connect(open_file)

    file_menu.addAction(open_action)

    widget = MyWidget()
    widget.resize(800, 600)
    widget.show()

    sys.exit(app.exec())
