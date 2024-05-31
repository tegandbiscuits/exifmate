import sys
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt, QCoreApplication
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtQuickControls2 import QQuickStyle

# used in QML
import bridge

if __name__ == "__main__":
  app = QApplication(sys.argv)

  QQuickStyle.setStyle("macOS")
  engine = QQmlApplicationEngine("src/view.qml")

  sys.exit(app.exec())
