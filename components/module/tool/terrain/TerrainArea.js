import AreaController from "../measurement/Area";
import * as Cesium from "cesium";

export default class TerrainAreaDrawer extends AreaController {
  static nextId = 1;

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
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  }

  getSelectedPositions() {
    if (this.areaGroupArr.length === 0) return;
    return this.areaGroupArr[this.areaGroupArr.length - 1].pointPositionArr;
  }

  onRightClick() {
    if (!Cesium.defined(this.floatingPoint)) return;
    this.areaGroup.removeLastPointPosition();

    if (this.areaGroup.pointEntityNum <= 2) {
      this.#removeInvalidEntitiesFromPolygon();
    } else {
      this.#areaGroupEndEvent();
      this.stopDrawing();
    }

    this.resetAreaGroup();
  }

  popAreaGroupArr() {
    const lastAreaGroup = this.areaGroupArr.pop();
    lastAreaGroup.polygonArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    lastAreaGroup.pointEntityArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.viewer.entities.remove(lastAreaGroup.label);

    TerrainAreaDrawer.nextId--;
  }

  #removeInvalidEntitiesFromPolygon() {
    this.viewer.entities.remove(this.areaGroup.pointEntityArr[0]);
    this.viewer.entities.remove(this.areaGroup.pointEntityArr[1]);
    this.viewer.entities.remove(this.areaGroup.label);
  }

  #areaGroupEndEvent() {
    this.areaGroup.addPolygonToViewer();
    this.areaGroup.calculateAreaAndUpdateLabel();
    this.areaGroup.id = TerrainAreaDrawer.nextId;
    this.areaGroup.name = `Terrain Area ${TerrainAreaDrawer.nextId++}`;
    this.areaGroupArr.push(this.areaGroup);
  }
}
