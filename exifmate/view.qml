import QtQuick
import QtQuick.Layouts
import QtQuick.Controls
import QtQuick.Window
import Qt.labs.platform as Platform
import QtQuick.Dialogs

import exifmate
import "./components"

ApplicationWindow {
  id: page
  width: 1020
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

  SplitView {
    anchors.fill: parent

    ImageGrid {
      id: imageList
      SplitView.fillWidth: true
      onImageSelect: (imagePath) => {
        const info = bridge.get_meta(imagePath);
        infoList.model.clear();
        Object.keys(info).forEach((sectionTitle) => {
          infoList.model.append({ sectionTitle, values: info[sectionTitle] });
        });
      }
    }


    ListView {
      id: infoList
      SplitView.preferredWidth: 300
      model: ListModel { }
      delegate: InfoSection { }
    }
  }
}
