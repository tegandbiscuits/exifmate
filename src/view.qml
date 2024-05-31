import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Window
import Qt.labs.platform as Platform
import QtQuick.Dialogs

import exifmate

ApplicationWindow {
  id: page
  width: 900
  height: 600
  visible: true

  Platform.MenuBar {
    Platform.Menu {
      title: "File"

      Platform.MenuItem {
        shortcut: "Ctrl+O"
        text: "Open"
        onTriggered: {
          fileDialog.open()
        }
      }
    }
  }

  FolderDialog {
    id: fileDialog
    onAccepted: {
      const url = new URL(fileDialog.selectedFolder);
      const images = bridge.find_images(url.pathname);
      imageList.model.clear();
      images.forEach((image) => {
        imageList.model.append(image);
      });
    }
  }

  Bridge {
    id: bridge
  }

  GridView {
    id: imageList
    cellWidth: 300
    cellHeight: 300
    anchors.fill: parent
    focus: true

    model: ListModel { }

    ScrollBar.vertical: ScrollBar {}

    onCurrentIndexChanged: {
      const item = imageList.model.get(imageList.currentIndex);
      console.log('Gonna activate', item.imagePath)
    }

    highlight: Rectangle { color: "lightsteelblue"; radius: 5 }
    delegate: AbstractButton {
      width: imageList.cellWidth
      height: imageList.cellHeight

      onClicked: {
        imageList.currentIndex = index
      }

      Column {
        anchors.fill: parent
        Image {
          asynchronous: true
          source: imagePath
          sourceSize.width: 300
          sourceSize.height: 200
          anchors.horizontalCenter: parent.horizontalCenter
        }
        Label {
          text: imageName
          anchors.horizontalCenter: parent.horizontalCenter
        }
      }
    }
  }
}
