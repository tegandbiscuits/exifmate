import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Item {
  id: root

  property ListModel model: imageList.model
  signal imageSelect(string imagePath)

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
      root.imageSelect(item.imagePath);
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
