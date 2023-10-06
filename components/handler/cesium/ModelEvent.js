import * as Cesium from "cesium";

const DURATION = 1.0;
const UP_HEIGHT = 40;

function getPositionObj(modelGroup) {
  const calculatePosition = (position) => {
    const cartographic = Cesium.Cartographic.fromCartesian(position);
    return Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      cartographic.height + UP_HEIGHT,
    );
  };

  const downPositionObj = {
    outerPosition: modelGroup.outerModel.position.getValue(
      Cesium.JulianDate.now(),
    ),
    innerPosition: modelGroup.innerModel.map((element) =>
      element.position.getValue(Cesium.JulianDate.now()),
    ),
  };

  const upPositionObj = {
    outerPosition: calculatePosition(downPositionObj.outerPosition),
    innerPosition: downPositionObj.innerPosition.map(calculatePosition),
  };

  return { downPositionObj, upPositionObj };
}

function upAnimation({ originalPosition, upTargetPosition, model }) {
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const progress = (time - startTime) / (DURATION * 1000);

    if (progress < 1) {
      const newPosition = new Cesium.Cartesian3();
      Cesium.Cartesian3.lerp(
        originalPosition,
        upTargetPosition,
        progress,
        newPosition,
      );
      model.position.setValue(newPosition);
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function downAnimation({ originalPosition, downTargetPosition, model }) {
  let startTime = null;

  function animate(time) {
    if (!startTime) startTime = time;
    const progress = (time - startTime) / (DURATION * 1000);

    if (progress < 1) {
      const newPosition = new Cesium.Cartesian3();
      Cesium.Cartesian3.lerp(
        originalPosition,
        downTargetPosition,
        progress,
        newPosition,
      );
      model.position.setValue(newPosition);
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

function groupUpAnimation(modelGroupInfo) {
  const { modelGroup, downPositionObj, upPositionObj } = modelGroupInfo;

  upAnimation({
    originalPosition: downPositionObj.outerPosition,
    upTargetPosition: upPositionObj.outerPosition,
    model: modelGroup.outerModel,
  });

  if (modelGroup.innerModel.length > 0) {
    modelGroup.innerModel.forEach((element, idx) => {
      upAnimation({
        originalPosition: downPositionObj.innerPosition[idx],
        upTargetPosition: upPositionObj.innerPosition[idx],
        model: element,
      });
    });
  }
}

function groupDownAnimation(modelGroupInfo) {
  const { modelGroup, downPositionObj, upPositionObj } = modelGroupInfo;

  downAnimation({
    originalPosition: upPositionObj.outerPosition,
    downTargetPosition: downPositionObj.outerPosition,
    model: modelGroup.outerModel,
  });

  if (modelGroup.innerModel.length > 0) {
    modelGroup.innerModel.forEach((element, idx) => {
      downAnimation({
        originalPosition: upPositionObj.innerPosition[idx],
        downTargetPosition: downPositionObj.innerPosition[idx],
        model: element,
      });
    });
  }
}

function isInnerModelClicked({
  pickedObject,
  innerModel,
  setModalIsOpen,
  setUri,
}) {
  if (Cesium.defined(pickedObject) && innerModel.includes(pickedObject.id)) {
    const uri = pickedObject.id.model.uri.getValue();

    if (uri) {
      setModalIsOpen(true);
      setUri(uri);
    }
  }
}

function hoverToOpacityChange({ viewer, movement, modelGroup }) {
  /* 
    hover event
    
    1) outerModel hover
    outer 0.7 / innerAll 1.0
    2) innerModel hover
    outer 0.7 / each inner 1.0
    3) else (default)
    outer 1.0 / each inner 0.0
    
  */
  const pickedObject = viewer.scene.pick(movement.endPosition);
  if (
    Cesium.defined(pickedObject) &&
    pickedObject.id === modelGroup.outerModel
  ) {
    modelGroup.outerModel.model.color = Cesium.Color.fromAlpha(
      Cesium.Color.WHITE,
      0.7,
    );
    modelGroup.innerModel.map((element) => {
      element.model.color = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 1.0);
    });
  } else if (
    Cesium.defined(pickedObject) &&
    modelGroup.innerModel.includes(pickedObject.id)
  ) {
    modelGroup.outerModel.model.color = Cesium.Color.fromAlpha(
      Cesium.Color.WHITE,
      0.7,
    );
    modelGroup.innerModel.map((element) => {
      if (element === pickedObject.id) {
        element.model.color = Cesium.Color.fromAlpha(Cesium.Color.YELLOW, 1.0);
      } else {
        element.model.color = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 1.0);
      }
    });
  } else {
    modelGroup.outerModel.model.color = Cesium.Color.fromAlpha(
      Cesium.Color.WHITE,
      1.0,
    );
    modelGroup.innerModel.map((element) => {
      element.model.color = Cesium.Color.fromAlpha(Cesium.Color.WHITE, 0.0);
    });
  }
}

/**
 *
 * @description : 모델 클릭 시 시점 고정
 *
 * @param  viewer
 * @param  pickedObject
 * @param  outerModel
 *
 * @return void
 */
function holdView(viewer, pickedObject, outerModel) {
  if (Cesium.defined(pickedObject) && pickedObject.id === outerModel) {
    viewer.trackedEntity = outerModel;
    return;
  }
  viewer.trackedEntity = undefined;
}

function unholdView(viewer, pickedObject, outerModel) {
  if (!Cesium.defined(pickedObject) || pickedObject.id !== outerModel) return;
  viewer.trackedEntity = undefined;
}

export {
  upAnimation,
  downAnimation,
  getPositionObj,
  groupDownAnimation,
  groupUpAnimation,
  isInnerModelClicked,
  hoverToOpacityChange,
  holdView,
  unholdView,
};
