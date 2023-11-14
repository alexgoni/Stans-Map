import AreaDrawer from "./Area";

export default class TerrainAreaDrawer extends AreaDrawer {
  getPointPositionArr(index) {
    return this.areaGroupArr[index].pointPositionArr;
  }
}
