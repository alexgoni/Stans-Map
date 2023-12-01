import { ShapeLayer } from "../measurement/Shape";
import TerrainAreaDrawer from "./TerrainArea";
import * as Cesium from "cesium";

class TerrainStack extends ShapeLayer {
  constructor(viewer) {
    super(viewer);
  }

  updateData(data) {
    if (!this._readData) return;
    this.dataStack.push(data);
    this._readData([...this.dataStack]);
  }

  toggleShowTerrainGroup(terrainGroupArr, id, showState) {
    terrainGroupArr.forEach((terrainGroup) => {
      if (terrainGroup.id !== id) return;
      terrainGroup.toggleShow(showState);
    });
  }

  zoomToTerrainGroup(terrainGroupArr, id) {
    terrainGroupArr.forEach((terrainGroup) => {
      if (terrainGroup.id !== id) return;
      const offset = new Cesium.HeadingPitchRange(...ShapeLayer.OFFSET);
      this.viewer.zoomTo(terrainGroup.label, offset);
    });
  }
}

export default class TerrainEditor {
  static nextId = 1;

  constructor(viewer) {
    this.viewer = viewer;
    this.terrainAreaDrawer = new TerrainAreaDrawer(viewer);
    this.elevationDataObj = {};
    this.terrainStack = new TerrainStack(viewer);
  }

  startDraw() {
    this.terrainAreaDrawer.startDrawing();
  }

  stopDraw() {
    this.terrainAreaDrawer.stopDrawing();
  }

  getSelectedPositions() {
    const selectedPositions = this.terrainAreaDrawer.getSelectedPositions();
    return selectedPositions;
  }

  async modifyTerrain(positions, slideValue) {
    if (!positions) return;

    const averageHeight = await this.#getAverageHeight(positions);
    const targetHeight = averageHeight + slideValue;

    this.#updateGlobalFloor(positions, targetHeight);
    this.#updateTerrainStack(slideValue, targetHeight);

    this.terrainAreaDrawer.startDrawing();
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

  async #getPositionHeight(position) {
    const carto = Cesium.Cartographic.fromCartesian(position);
    const updatedPositions = await Cesium.sampleTerrain(
      this.viewer.terrainProvider,
      11,
      [carto],
    );
    return updatedPositions[0].height;
  }

  async #getAverageHeight(positions) {
    const heightArr = await Promise.all(
      positions.map((position) => this.#getPositionHeight(position)),
    );

    return heightArr.reduce((acc, cur) => acc + cur, 0) / heightArr.length;
  }

  #updateGlobalFloor(positions, targetHeight) {
    const key = TerrainEditor.nextId;
    this.elevationDataObj[key] = { positions, height: targetHeight };

    this.viewer.terrainProvider.setGlobalFloor(this.elevationDataObj);
  }

  #updateTerrainStack(slideValue, targetHeight) {
    const lastAreaGroup =
      this.terrainAreaDrawer.areaGroupArr[
        this.terrainAreaDrawer.areaGroupArr.length - 1
      ];

    const data = {
      id: TerrainEditor.nextId++,
      name: lastAreaGroup.name,
      area: lastAreaGroup.area,
      slideHeight: slideValue,
      targetHeight,
    };
    this.terrainStack.updateData(data);
  }
}
