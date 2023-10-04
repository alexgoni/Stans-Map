import * as Cesium from "cesium";

const DURATION = 1.0;
const UP_HEIGHT = 40;

function getPositionObj(modelGroup) {
  const innerPositionArray = modelGroup.innerModel.map((element) =>
    element.position.getValue(Cesium.JulianDate.now()),
  );

  const downPositionObj = {
    outerPosition: modelGroup.outerModel.position.getValue(
      Cesium.JulianDate.now(),
    ),
    innerPosition: innerPositionArray,
  };

  const upPositionObj = {
    outerPosition: Cesium.Cartesian3.fromDegrees(
      Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(downPositionObj.outerPosition)
          .longitude,
      ),
      Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(downPositionObj.outerPosition)
          .latitude,
      ),
      Cesium.Cartographic.fromCartesian(downPositionObj.outerPosition).height +
        UP_HEIGHT,
    ),
    innerPosition: innerPositionArray.map((element) => {
      return Cesium.Cartesian3.fromDegrees(
        Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(element).longitude,
        ),
        Cesium.Math.toDegrees(
          Cesium.Cartographic.fromCartesian(element).latitude,
        ),
        Cesium.Cartographic.fromCartesian(element).height + UP_HEIGHT,
      );
    }),
  };

  return { downPositionObj, upPositionObj };
}

function upAnimation({
  originalPosition,
  upTargetPosition,
  model,
  upState,
  downState,
}) {
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
    } else if (upState && downState) {
      upState.current = true;
      downState.current = false;
    }
  }

  requestAnimationFrame(animate);
}

function downAnimation({
  originalPosition,
  downTargetPosition,
  model,
  upState,
  downState,
}) {
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
    } else if (upState && downState) {
      upState.current = false;
      downState.current = true;
    }
  }

  requestAnimationFrame(animate);
}

function groupUpAnimation({
  modelGroup,
  downPositionObj,
  upPositionObj,
  upState,
  downState,
}) {
  upAnimation({
    originalPosition: downPositionObj.outerPosition,
    upTargetPosition: upPositionObj.outerPosition,
    model: modelGroup.outerModel,
    upState,
    downState,
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

function groupDownAnimation({
  modelGroup,
  downPositionObj,
  upPositionObj,
  upState,
  downState,
}) {
  downAnimation({
    originalPosition: upPositionObj.outerPosition,
    downTargetPosition: downPositionObj.outerPosition,
    model: modelGroup.outerModel,
    upState,
    downState,
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

function leftClickToUp({
  pickedObject,
  modelGroup,
  downPositionObj,
  upPositionObj,
  upState,
  downState,
}) {
  if (
    Cesium.defined(pickedObject) &&
    pickedObject.id === modelGroup.outerModel &&
    !upState.current
  ) {
    groupUpAnimation({
      modelGroup,
      downPositionObj,
      upPositionObj,
      upState,
      downState,
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

function rightClickToDown({
  pickedObject,
  modelGroup,
  downPositionObj,
  upPositionObj,
  upState,
  downState,
}) {
  if (
    Cesium.defined(pickedObject) &&
    pickedObject.id === modelGroup.outerModel &&
    !downState.current
  ) {
    groupDownAnimation({
      modelGroup,
      downPositionObj,
      upPositionObj,
      upState,
      downState,
    });
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
      element.model.color = Cesium.Color.fromAlpha(Cesium.Color.YELLOW, 1.0);
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
  rightClickToDown,
  leftClickToUp,
  isInnerModelClicked,
  hoverToOpacityChange,
  holdView,
  unholdView,
};
