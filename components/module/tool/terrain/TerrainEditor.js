import TerrainAreaDrawer from "./TerrainArea";
import * as Cesium from "cesium";

export default class TerrainEditor {
  constructor(viewer) {
    this.viewer = viewer;
    this.terrainAreaDrawer = new TerrainAreaDrawer(viewer);
    this.elevationDataArray = [];
  }

  startEdit() {
    this.terrainAreaDrawer.startDrawing();
  }

  stopEdit() {
    this.terrainAreaDrawer.onRightClick();
    this.terrainAreaDrawer.stopDrawing();
    this.terrainAreaDrawer.clearAreaGroupArr();
  }

  async modifyTerrain(slideValue) {
    const selectedPositions = this.terrainAreaDrawer.getSelectedPositions();
    if (!selectedPositions) return;

    const heightArr = await Promise.all(
      selectedPositions.map((position) => this.#getPositionHeight(position)),
    );

    const averageHeight =
      heightArr.reduce((acc, cur) => acc + cur, 0) / heightArr.length;
    const targetHeight = averageHeight + slideValue;
    this.elevationDataArray.push({
      positions: selectedPositions,
      height: targetHeight,
    });
    this.viewer.terrainProvider.setGlobalFloor(this.elevationDataArray);

    this.terrainAreaDrawer.afterEditTerrain();
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
}
