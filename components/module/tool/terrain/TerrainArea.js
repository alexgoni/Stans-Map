import AreaDrawer from "../measurement/Area";
import * as Cesium from "cesium";

export default class TerrainAreaDrawer extends AreaDrawer {
  constructor(viewer) {
    super(viewer);
  }

  startDrawing() {
    this.viewer.container.style.cursor = "crosshair";

    this.handler.setInputAction(
      this.onLeftClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    this.handler.setInputAction(
      this.onMouseMove,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
    this.handler.setInputAction(
      this.onRightClick,
      Cesium.ScreenSpaceEventType.RIGHT_CLICK,
    );
  }

  stopDrawing() {
    this.viewer.container.style.cursor = "default";

    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  getSelectedPositions() {
    if (this.areaGroupArr.length === 0) return;
    return this.areaGroupArr[this.areaGroupArr.length - 1].pointPositionArr;
  }

  afterEditTerrain() {
    this.startDrawing();
    // this.clearAreaGroupArr();
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;
    this.areaGroup.removeLastPointPosition();

    const removeInvalidEntitiesFromPolygon = () => {
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[0]);
      this.viewer.entities.remove(this.areaGroup.pointEntityArr[1]);
      this.viewer.entities.remove(this.areaGroup.label);
    };

    const areaGroupEndEvent = () => {
      this.areaGroup.addPolygonToViewer();
      this.areaGroup.calculateAreaAndUpdateLabel();
      this.areaGroupArr.push(this.areaGroup);
    };

    if (this.areaGroup.pointEntityNum <= 2) {
      removeInvalidEntitiesFromPolygon();
      this.resetAreaGroup();
      return;
    }

    areaGroupEndEvent();
    this.stopDrawing();
    this.resetAreaGroup();
  }
}
