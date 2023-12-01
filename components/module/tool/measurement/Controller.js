import { cursorHandler } from "@/components/handler/cesium/Viewer";
import AreaController from "./Area";
import CircleController from "./Circle";
import LineController from "./Line";

export default class MeasureController {
  constructor(viewer) {
    this.viewer = viewer;

    this.lineController = new LineController(viewer);
    this.circleController = new CircleController(viewer);
    this.areaController = new AreaController(viewer);
  }

  setWidgetState(widgetStateObj) {
    this.distanceWidgetOpen = widgetStateObj.distanceWidgetOpen;
    this.radiusWidgetOpen = widgetStateObj.radiusWidgetOpen;
    this.areaWidgetOpen = widgetStateObj.areaWidgetOpen;

    cursorHandler(this.viewer, widgetStateObj);
  }

  lineControllerHandler() {
    if (this.distanceWidgetOpen) {
      this.lineController.startDrawing();
    } else {
      this.lineController.stopDrawing();
    }
  }

  circleControllerHandler() {
    if (this.radiusWidgetOpen) {
      this.circleController.startDrawing();
    } else {
      this.circleController.stopDrawing();
    }
  }

  areaControllerHandler() {
    if (this.areaWidgetOpen) {
      this.areaController.startDrawing();
    } else {
      this.areaController.stopDrawing();
    }
  }

  handleAllShapes() {
    this.lineControllerHandler();
    this.circleControllerHandler();
    this.areaControllerHandler();
  }

  cleanUpDrawing() {
    this.circleController.stopDrawing();
    this.areaController.stopDrawing();
    this.lineController.stopDrawing();
  }
}
