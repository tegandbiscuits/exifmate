import QtQuick
import QtQuick.Layouts
import QtQuick.Controls

Pane {
  required property string sectionTitle
  required property ListModel values

  // TODO: when this is a material design it should be in a card

  Column {
    spacing: 5

    Label {
      text: sectionTitle
      font.bold: true
    }
    
    Column {
      Repeater {
        model: values

        Row {
          spacing: 8

          Label {
            text: `${key}:`
            opacity: 0.8
          }
          Label {
            text: value
          }
        }
      }
    }
  }
}
