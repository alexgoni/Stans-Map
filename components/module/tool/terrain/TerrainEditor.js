import { ShapeLayer } from "../measurement/Shape";
import TerrainAreaDrawer from "./TerrainArea";
import * as Cesium from "cesium";

class TerrainStack extends ShapeLayer {
  constructor(viewer) {
    super(viewer);
    this.dataStack = {};
  }

  updateData() {
    if (!this._readData) return;
    this._readData([...Object.values(this.dataStack)]);
  }

  toggleShowTerrainGroup(areaGroupArr, id, showState) {
    areaGroupArr.forEach((areaGroup) => {
      if (areaGroup.id !== id) return;
      areaGroup.toggleShow(showState);
    });
  }

  zoomToTerrainGroup(areaGroupArr, id) {
    areaGroupArr.forEach((areaGroup) => {
      if (areaGroup.id !== id) return;
      const offset = new Cesium.HeadingPitchRange(...ShapeLayer.OFFSET);
      this.viewer.zoomTo(areaGroup.label, offset);
      this.#highlightLabel(areaGroup);
    });
  }

  deleteTerrainGroup(areaGroupArr, id) {
    return areaGroupArr.filter((areaGroup) => {
      if (areaGroup.id !== id) return true;
      else {
        this.#deleteAreaGroupEntities(areaGroup);
        return false;
      }
    });
  }

  #deleteAreaGroupEntities(areaGroup) {
    areaGroup.polygonArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    areaGroup.pointEntityArr.forEach((entity) => {
      this.viewer.entities.remove(entity);
    });
    this.viewer.entities.remove(areaGroup.label);
  }

  #highlightLabel(areaGroup) {
    areaGroup.label.label.backgroundColor = new Cesium.Color(
      ...ShapeLayer.HIGHLIGHT,
    );

    setTimeout(() => {
      areaGroup.label.label.backgroundColor = new Cesium.Color(
        ...ShapeLayer.BG_DEFAULT,
      );
    }, ShapeLayer.DURATION);
  }
}

export default class TerrainEditor {
  static nextId = 1;

  constructor(viewer) {
    this.viewer = viewer;
    this.terrainAreaDrawer = new TerrainAreaDrawer(viewer);
    this.terrainStack = new TerrainStack(viewer);
  }

  startDraw() {
    this.viewer.container.style.cursor = "crosshair";
    this.terrainAreaDrawer.startDrawing();
  }

  stopDraw() {
    this.viewer.container.style.cursor = "default";
    this.terrainAreaDrawer.stopDrawing();
  }

  widgetSwitch() {
    this.terrainAreaDrawer.stopDrawing();
    this.#clearNotModifiedTerrainEntity();
  }

  getSelectedPositions(id) {
    // 현재 edit 진행 중인 terrainArea의 positions를 return
    if (id) return this.terrainStack.dataStack[id]?.positions || [];
    // edit 중이 아니라면 가장 최근에 입력된 areaGroup의 positions를 return
    return this.terrainAreaDrawer.getSelectedPositions();
  }

  async modifyTerrain(positions, slideValue) {
    if (!positions) return;

    await this.#upsertTerrainData(positions, slideValue);
    this.viewer.terrainProvider.setGlobalFloor(this.terrainStack.dataStack);
  }

  toggleShowGroup(id, showState) {
    this.terrainStack.toggleShowTerrainGroup(
      this.terrainAreaDrawer.areaGroupArr,
      id,
      showState,
    );
  }

  zoomToGroup(id) {
    this.terrainStack.zoomToTerrainGroup(
      this.terrainAreaDrawer.areaGroupArr,
      id,
    );
  }

  resetModifiedTerrain(id) {
    this.terrainAreaDrawer.areaGroupArr = this.terrainStack.deleteTerrainGroup(
      this.terrainAreaDrawer.areaGroupArr,
      id,
    );

    delete this.terrainStack.dataStack[id];
    this.viewer.terrainProvider.setGlobalFloor(this.terrainStack.dataStack);
  }

  #clearNotModifiedTerrainEntity() {
    if (
      this.terrainAreaDrawer.areaGroupArr.length !==
      Object.keys(this.terrainStack.dataStack).length
    ) {
      this.terrainAreaDrawer.popAreaGroupArr();
    }
  }

  async #upsertTerrainData(positions, slideValue) {
    const existingData = Object.values(this.terrainStack.dataStack).find(
      (data) => data.positions === positions,
    );

    if (existingData) {
      const data = this.terrainStack.dataStack[existingData.id];
      const averageHeight = data.targetHeight - data.slideHeight;
      const newTargetHeight = averageHeight + slideValue;

      this.#updateTerrainStack(existingData.id, slideValue, newTargetHeight);
    } else {
      const averageHeight = await this.#getAverageHeight(positions);
      const targetHeight = averageHeight + slideValue;

      this.#insertTerrainStack(positions, slideValue, targetHeight);
    }
  }

  async #getAverageHeight(positions) {
    const heightArr = await Promise.all(
      positions.map((position) => this.#getPositionHeight(position)),
    );

    return heightArr.reduce((acc, cur) => acc + cur, 0) / heightArr.length;
  }

  async #getPositionHeight(position) {
    const carto = Cesium.Cartographic.fromCartesian(position);
    const updatedPositions = await Cesium.sampleTerrain(
      this.viewer.terrainProvider,
      11,
      [carto],
    );
    return updatedPositions[0].height;
  }

  #updateTerrainStack(id, slideValue, targetHeight) {
    this.terrainStack.dataStack[id].slideHeight = slideValue;
    this.terrainStack.dataStack[id].targetHeight = targetHeight;
    this.terrainStack.updateData();
  }

  #insertTerrainStack(positions, slideValue, targetHeight) {
    const lastAreaGroup =
      this.terrainAreaDrawer.areaGroupArr[
        this.terrainAreaDrawer.areaGroupArr.length - 1
      ];

    const key = TerrainEditor.nextId;
    this.terrainStack.dataStack[key] = {
      id: key,
      name: lastAreaGroup.name,
      positions,
      area: lastAreaGroup.area,
      slideHeight: slideValue,
      targetHeight,
    };
    TerrainEditor.nextId++;

    this.terrainStack.updateData();
  }
}
