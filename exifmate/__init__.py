import sys

from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtQuickControls2 import QQuickStyle
from PySide6.QtWidgets import QApplication

from exifmate import bridge

__all__ = ["bridge"]


def main() -> None:
  app = QApplication(sys.argv)

  QQuickStyle.setStyle("macOS")
  engine = QQmlApplicationEngine("exifmate/view.qml")

  if not engine.rootObjects():
    sys.exit(1)

  sys.exit(app.exec())
