import * as Cesium from "cesium";
import {
  groupDownAnimation,
  groupUpAnimation,
  hoverToOpacityChange,
} from "../handler/cesium/ModelEventHandler";

export default class ModelEvent {
  constructor({ viewer, modelGroup, modelGroupInfo, clickInnerModelHandler }) {
    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    this.modelGroup = modelGroup;
    this.modelGroupInfo = modelGroupInfo;
    this.upState = false;
    this.clickInnerModelHandler = clickInnerModelHandler;

    this.onLeftClick = this.onLeftClick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
  }

  startEvent() {
    this.handler.setInputAction(
      this.onLeftClick,
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    );
    this.handler.setInputAction(
      this.onMouseMove,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE,
    );
  }

  stopEvent() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  onLeftClick(click) {
    const pickedObject = this.viewer.scene.pick(click.position);
    if (!Cesium.defined(pickedObject)) return;

    const modelUpHandler = () => {
      groupUpAnimation(this.modelGroupInfo);
      // this.viewer.trackedEntity = this.modelGroup.outerModel;
      this.upState = true;
    };

    const modelDownHandler = () => {
      groupDownAnimation(this.modelGroupInfo);
      // this.viewer.trackedEntity = undefined;
      this.upState = false;
    };

    if (pickedObject.id === this.modelGroup.outerModel) {
      // outer model click
      if (!this.upState) modelUpHandler();
      else modelDownHandler();
    } else if (this.modelGroup.innerModel.includes(pickedObject.id)) {
      // inner model click
      const uri = pickedObject.id.model.uri.getValue();
      if (!uri) return;
      this.clickInnerModelHandler(uri);
    }
  }

  onMouseMove(movement) {
    hoverToOpacityChange({
      viewer: this.viewer,
      movement,
      modelGroup: this.modelGroup,
    });
  }
}
