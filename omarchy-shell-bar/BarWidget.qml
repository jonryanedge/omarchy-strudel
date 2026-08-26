import QtQuick
import QtQuick.Layouts

Item {
  property var bar
  property string moduleName
  property var settings

  implicitWidth: 28
  implicitHeight: bar ? bar.barSize : 26

  property string displayText: "󰝟"
  property string tooltipText: "omarchy-strudel"
  property string widgetClass: "stopped"

  function refreshStatus() {
    var cmd = "omarchy-strudel status 2>/dev/null || echo '{\"ok\":false}'";
    Util.exec(cmd, function(stdout) {
      try {
        var data = JSON.parse(stdout.trim());
        if (!data.ok) {
          displayText = "󰝟";
          tooltipText = "omarchy-strudel (no daemon)";
          widgetClass = "error";
          return;
        }
        if (!data.enabled) {
          displayText = "mute";
          tooltipText = "omarchy-strudel (disabled)";
          widgetClass = "disabled";
        } else if (data.state === "playing") {
          displayText = "󰝚";
          tooltipText = (data.song || "") + (data.artist ? " — " + data.artist : "");
          widgetClass = "playing";
        } else if (data.state === "paused") {
          displayText = "󰏥";
          tooltipText = (data.song || "") + " (paused)";
          widgetClass = "paused";
        } else {
          displayText = "󰝟";
          tooltipText = "omarchy-strudel (stopped)";
          widgetClass = "stopped";
        }
      } catch(e) {
        displayText = "󰝟";
        tooltipText = "omarchy-strudel (error)";
        widgetClass = "error";
      }
    });
  }

  Timer {
    interval: 2000
    running: true
    repeat: true
    onTriggered: refreshStatus()
  }

  Component.onCompleted: refreshStatus()

  Text {
    anchors.centerIn: parent
    text: displayText
    color: bar ? bar.foreground : "white"
    font.family: bar ? bar.fontFamily : "monospace"
    font.pixelSize: 14
  }

  MouseArea {
    anchors.fill: parent
    hoverEnabled: true
    acceptedButtons: Qt.LeftButton | Qt.RightButton | Qt.MiddleButton

    onEntered: if (bar) bar.showTooltip(parent, tooltipText)
    onExited: if (bar) bar.hideTooltip(parent)

    onClicked: function(mouse) {
      if (mouse.button === Qt.LeftButton) {
        if (bar) bar.run("omarchy-strudel-menu")
      } else if (mouse.button === Qt.RightButton) {
        if (bar) bar.run("omarchy-strudel play")
      } else if (mouse.button === Qt.MiddleButton) {
        if (bar) bar.run("omarchy-strudel stop")
      }
    }

    onWheel: function(wheel) {
      if (wheel.angleDelta.y > 0) {
        if (bar) bar.run("omarchy-strudel volume 0.8")
      } else {
        if (bar) bar.run("omarchy-strudel volume 0.6")
      }
    }
  }
}
