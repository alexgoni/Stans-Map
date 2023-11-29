import * as Cesium from "cesium";

class ShapeGroup {
  constructor(viewer) {
    this.viewer = viewer;
    this.pointEntityArr = [];
    this.pointPositionArr = [];
    this.label = null;
    this.value = 0;
  }

  get pointEntityNum() {
    return this.pointEntityArr.length;
  }
}

class ShapeLayer {
  static OFFSET = [0, -90, 800];

  constructor(viewer) {
    this.viewer = viewer;
    this._readData = null;
    this.dataStack = [];
  }

  /**
   * @param {function} handler
   */
  set readData(handler) {
    this._readData = handler;
  }
}

class ShapeController {
  static nextId = 1;

  constructor(viewer) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.floatingPoint = null;

    this.onLeftClick = this.onLeftClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onRightClick = this.onRightClick.bind(this);
  }

  startDrawing() {
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

  onLeftClick() {}
  onMouseMove() {}
  onRightClick() {}
}

export { ShapeGroup, ShapeLayer, ShapeController };
