class ModelGroup {
  constructor(outerModel, innerModel = []) {
    this.outerModel = outerModel;
    this.innerModel = innerModel;
  }
}

class ModelGroupInfo {
  constructor(modelGroup, downPositionObj, upPositionObj) {
    this.modelGroup = modelGroup;
    this.downPositionObj = downPositionObj;
    this.upPositionObj = upPositionObj;
  }
}

export { ModelGroup, ModelGroupInfo };
