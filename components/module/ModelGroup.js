class ModelGroup {
  constructor(outerModel, innerModel = []) {
    this.outerModel = outerModel;
    this.innerModel = innerModel;
  }
}

class ModelGroupInfo {
  constructor(modelGroup, downPositionObj, upPositionObj, upState, downState) {
    if (
      !modelGroup ||
      !downPositionObj ||
      !upPositionObj ||
      !upState ||
      !downState
    ) {
      throw new Error("모든 매개변수는 필수입니다.");
    }

    this.modelGroup = modelGroup;
    this.downPositionObj = downPositionObj;
    this.upPositionObj = upPositionObj;
    this.upState = upState;
    this.downState = downState;
  }
}

export { ModelGroup, ModelGroupInfo };
