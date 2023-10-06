class ModelGroup {
  constructor(outerModel, innerModel = []) {
    this.outerModel = outerModel;
    this.innerModel = innerModel;
  }
}

class ModelGroupInfo {
  constructor(modelGroup, downPositionObj, upPositionObj) {
    if (!modelGroup || !downPositionObj || !upPositionObj) {
      throw new Error("모든 매개변수는 필수입니다.");
    }

    this.modelGroup = modelGroup;
    this.downPositionObj = downPositionObj;
    this.upPositionObj = upPositionObj;
  }
}

export { ModelGroup, ModelGroupInfo };
