import { cursorHandler } from "@/components/handler/cesium/Viewer";
import AreaDrawer from "./Area";
import CircleDrawer from "./Circle";
import LineDrawer from "./Line";

export default class Drawer {
  constructor(viewer) {
    this.viewer = viewer;

    this.lineDrawer = new LineDrawer(viewer);
    this.circleDrawer = new CircleDrawer(viewer);
    this.areaDrawer = new AreaDrawer(viewer);
  }

  setWidgetState(widgetStateObj) {
    this.distanceWidgetOpen = widgetStateObj.distanceWidgetOpen;
    this.radiusWidgetOpen = widgetStateObj.radiusWidgetOpen;
    this.areaWidgetOpen = widgetStateObj.areaWidgetOpen;

    cursorHandler(this.viewer, widgetStateObj);
  }

  lineDrawerHandler() {
    if (this.distanceWidgetOpen) {
      this.lineDrawer.startDrawing();
    } else {
      this.lineDrawer.onRightClick();
      this.lineDrawer.stopDrawing();
      this.lineDrawer.clearLineGroupArr();
    }
  }

  circleDrawerHandler() {
    if (this.radiusWidgetOpen) {
      this.circleDrawer.startDrawing();
    } else {
      this.circleDrawer.stopDrawing();
      this.circleDrawer.clearCircleGroupArr();
      this.circleDrawer.forceReset();
    }
  }

  areaDrawerHandler() {
    if (this.areaWidgetOpen) {
      this.areaDrawer.startDrawing();
    } else {
      this.areaDrawer.onRightClick();
      this.areaDrawer.stopDrawing();
      this.areaDrawer.clearAreaGroupArr();
    }
  }

  drawingHandler() {
    this.lineDrawerHandler();
    this.circleDrawerHandler();
    this.areaDrawerHandler();
  }

  cleanUpDrawer() {
    this.circleDrawer.stopDrawing();
    this.areaDrawer.stopDrawing();
    this.lineDrawer.stopDrawing();
  }
}
