import * as Cesium from "cesium";

const DIRECTION_NONE = -1;
const DIRECTION_FORWARD = 0;
const DIRECTION_BACKWARD = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_RIGHT = 3;
const HUMAN_WALKING_SPEED = 1.5;
const HUMAN_EYE_HEIGHT = 1.65;
const MAX_PITCH_IN_DEGREE = 88;
const ROTATE_SPEED = -5;

class CesiumFirstPersonCameraController {
  constructor(options) {
    this._enabled = false;
    this._cesiumViewer = options.cesiumViewer;
    this._canvas = this._cesiumViewer.canvas;
    w;
    this._camera = this._cesiumViewer.camera;
    this._direction = DIRECTION_NONE;
    this._looking = false;
    this._mousePosition = new Cesium.Cartesian2();
    this._startMousePosition = new Cesium.Cartesian2();
    this._heading = 0.0;

    this._connectEventHandlers();
  }

  _connectEventHandlers() {
    const canvas = this._cesiumViewer.canvas;

    this._screenSpaceEventHandler = new Cesium.ScreenSpaceEventHandler(
      this._canvas,
    );

    this._screenSpaceEventHandler.setInputAction(
      this._onMouseLButtonClicked.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_DOWN,
    );
    this._screenSpaceEventHandler.setInputAction(
      this._onMouseUp.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_UP,
    );
    this._screenSpaceEventHandler.setInputAction(
      this._onMouseMove.bind(this),
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
    this._screenSpaceEventHandler.setInputAction(
      this._onMouseLButtonDoubleClicked.bind(this),
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
    );

    canvas.setAttribute("tabindex", "0");

    canvas.onclick = function () {
      canvas.focus();
    };

    canvas.addEventListener("keydown", this._onKeyDown.bind(this));
    canvas.addEventListener("keyup", this._onKeyUp.bind(this));

    this._disconectOnClockTick =
      this._cesiumViewer.clock.onTick.addEventListener(
        this._onClockTick.bind(this),
      );
  }

  _onMouseLButtonClicked(movement) {
    this._looking = true;
    this._mousePosition = this._startMousePosition = Cesium.Cartesian3.clone(
      movement.position,
    );
  }

  _onMouseLButtonDoubleClicked(movement) {
    this._looking = true;
    this._mousePosition = this._startMousePosition = Cesium.Cartesian3.clone(
      movement.position,
    );
  }

  _onMouseUp(position) {
    this._looking = false;
  }

  _onMouseMove(movement) {
    this._mousePosition = movement.endPosition;
  }

  _onKeyDown(event) {
    const keyCode = event.keyCode;

    this._direction = DIRECTION_NONE;

    switch (keyCode) {
      case "W".charCodeAt(0):
        this._direction = DIRECTION_FORWARD;
        return;
      case "S".charCodeAt(0):
        this._direction = DIRECTION_BACKWARD;
        return;
      case "D".charCodeAt(0):
        this._direction = DIRECTION_RIGHT;
        return;
      case "A".charCodeAt(0):
        this._direction = DIRECTION_LEFT;
        return;
      case 90: // z
        return;
      default:
        return;
    }
  }

  _onKeyUp() {
    this._direction = DIRECTION_NONE;
  }

  _changeHeadingPitch(dt) {
    let width = this._canvas.clientWidth;
    let height = this._canvas.clientHeight;

    // Coordinate (0.0, 0.0) will be where the mouse was clicked.
    let deltaX = (this._mousePosition.x - this._startMousePosition.x) / width;
    let deltaY = -(this._mousePosition.y - this._startMousePosition.y) / height;

    let currentHeadingInDegree = Cesium.Math.toDegrees(this._camera.heading);
    let deltaHeadingInDegree = deltaX * ROTATE_SPEED;
    let newHeadingInDegree = currentHeadingInDegree + deltaHeadingInDegree;

    let currentPitchInDegree = Cesium.Math.toDegrees(this._camera.pitch);
    let deltaPitchInDegree = deltaY * ROTATE_SPEED;
    let newPitchInDegree = currentPitchInDegree + deltaPitchInDegree;

    console.log(
      "rotationSpeed: " +
        ROTATE_SPEED +
        " deltaY: " +
        deltaY +
        " deltaPitchInDegree" +
        deltaPitchInDegree,
    );

    if (
      newPitchInDegree > MAX_PITCH_IN_DEGREE * 2 &&
      newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE
    ) {
      newPitchInDegree = 360 - MAX_PITCH_IN_DEGREE;
    } else {
      if (
        newPitchInDegree > MAX_PITCH_IN_DEGREE &&
        newPitchInDegree < 360 - MAX_PITCH_IN_DEGREE
      ) {
        newPitchInDegree = MAX_PITCH_IN_DEGREE;
      }
    }

    this._camera.setView({
      orientation: {
        heading: Cesium.Math.toRadians(newHeadingInDegree),
        pitch: Cesium.Math.toRadians(newPitchInDegree),
        roll: this._camera.roll,
      },
    });
  }

  _onClockTick(clock) {
    if (!this._enabled) return;

    let dt = clock._clockStep;

    if (this._looking) this._changeHeadingPitch(dt);

    if (this._direction === DIRECTION_NONE) return;

    let distance = this._walkingSpeed() * dt;

    if (this._direction === DIRECTION_FORWARD)
      Cartesian3.multiplyByScalar(
        this._camera.direction,
        1,
        scratchCurrentDirection,
      );
    else if (this._direction === DIRECTION_BACKWARD)
      Cartesian3.multiplyByScalar(
        this._camera.direction,
        -1,
        scratchCurrentDirection,
      );
    else if (this._direction === DIRECTION_LEFT)
      Cartesian3.multiplyByScalar(
        this._camera.right,
        -1,
        scratchCurrentDirection,
      );
    else if (this._direction === DIRECTION_RIGHT)
      Cartesian3.multiplyByScalar(
        this._camera.right,
        1,
        scratchCurrentDirection,
      );

    Cartesian3.multiplyByScalar(
      scratchCurrentDirection,
      distance,
      scratchDeltaPosition,
    );

    let currentCameraPosition = this._camera.position;

    Cartesian3.add(
      currentCameraPosition,
      scratchDeltaPosition,
      scratchNextPosition,
    );

    // consider terrain height

    let globe = this._cesiumViewer.scene.globe;
    let ellipsoid = globe.ellipsoid;

    // get height for next update position
    ellipsoid.cartesianToCartographic(
      scratchNextPosition,
      scratchNextCartographic,
    );

    let height = globe.getHeight(scratchNextCartographic);

    if (height === undefined) {
      console.warn("height is undefined!");
      return;
    }

    if (height < 0) {
      console.warn(`height is negative!`);
    }

    scratchNextCartographic.height = height + HUMAN_EYE_HEIGHT;

    ellipsoid.cartographicToCartesian(
      scratchNextCartographic,
      scratchTerrainConsideredNextPosition,
    );

    this._camera.setView({
      destination: scratchTerrainConsideredNextPosition,
      orientation: new Cesium.HeadingPitchRoll(
        this._camera.heading,
        this._camera.pitch,
        this._camera.roll,
      ),
      endTransform: Cesium.Matrix4.IDENTITY,
    });
  }

  _walkingSpeed() {
    return HUMAN_WALKING_SPEED;
  }

  _enableDefaultScreenSpaceCameraController(enabled) {
    const scene = this._cesiumViewer.scene;

    scene.screenSpaceCameraController.enableRotate = enabled;
    scene.screenSpaceCameraController.enableTranslate = enabled;
    scene.screenSpaceCameraController.enableZoom = enabled;
    scene.screenSpaceCameraController.enableTilt = enabled;
    scene.screenSpaceCameraController.enableLook = enabled;
  }

  start() {
    this._enabled = true;

    this._enableDefaultScreenSpaceCameraController(false);

    let currentCameraPosition = this._camera.position;

    let cartographic = new Cesium.Cartographic();

    let globe = this._cesiumViewer.scene.globe;

    globe.ellipsoid.cartesianToCartographic(
      currentCameraPosition,
      cartographic,
    );

    let height = globe.getHeight(cartographic);

    if (height === undefined) return false;

    if (height < 0) {
      console.warn(`height is negative`);
    }

    cartographic.height = height + HUMAN_EYE_HEIGHT;

    let newCameraPosition = new Cartesian3();

    globe.ellipsoid.cartographicToCartesian(cartographic, newCameraPosition);

    let currentCameraHeading = this._camera.heading;

    this._heading = currentCameraHeading;

    this._camera.flyTo({
      destination: newCameraPosition,
      orientation: {
        heading: currentCameraHeading,
        pitch: Cesium.Math.toRadians(0),
        roll: 0.0,
      },
    });

    return true;
  }

  stop() {
    this._enabled = false;

    this._enableDefaultScreenSpaceCameraController(false);
  }
}

export default CesiumFirstPersonCameraController;
