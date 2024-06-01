import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Window
import Qt.labs.platform as Platform
import QtQuick.Dialogs

import exifmate

ApplicationWindow {
  id: page
  width: 920
  height: 700
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

  SystemPalette {
    id: pallette
    colorGroup: SystemPalette.Active
  }

  GridView {
    id: imageList
    cellWidth: 300
    cellHeight: 300
    anchors.fill: parent
    topMargin: 10
    bottomMargin: 10
    leftMargin: 10
    rightMargin: 10
    anchors.horizontalCenter: parent.horizontalCenter
    focus: true

    model: ListModel { }

    ScrollBar.vertical: ScrollBar {}

    onCurrentIndexChanged: {
      const item = imageList.model.get(imageList.currentIndex);
      console.log('Gonna activate', item.imagePath)
    }

    highlight: Rectangle {
      color: pallette.highlight
      radius: 5
    }
    delegate: AbstractButton {
      width: imageList.cellWidth
      height: imageList.cellHeight

      onClicked: {
        imageList.currentIndex = index
      }

      Column {
        anchors.verticalCenter: parent.verticalCenter
        anchors.horizontalCenter: parent.horizontalCenter

        Image {
          asynchronous: true
          source: imagePath
          sourceSize.width: imageList.cellWidth - 20
          sourceSize.height: imageList.cellHeight - nameLabel.height - 20
          anchors.horizontalCenter: parent.horizontalCenter
        }
        Label {
          id: nameLabel
          text: imageName
          maximumLineCount: 1
          elide: Text.ElideRight
          horizontalAlignment: Text.AlignHCenter
          anchors.horizontalCenter: parent.horizontalCenter
          width: parent.width
          topPadding: 8
        }
      }
    }
  }
}
