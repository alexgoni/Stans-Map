import { Viewer } from "@/components/handler/cesium/Viewer";
import { useEffect } from "react";
import * as Cesium from "cesium";

export default function height() {
  useEffect(() => {
    let viewer = null;
    (async () => {
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: await Cesium.CesiumTerrainProvider.fromIonAssetId(1),
      });

      var ellipsoid = viewer.scene.globe.ellipsoid;
      var position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      var height = viewer.scene.globe.getHeight(position);

      viewer.screenSpaceEventHandler.setInputAction(function (click) {
        var pickedObject = viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject)) {
          var cartesian = viewer.scene.pickPosition(click.position);
          if (Cesium.defined(cartesian)) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var height = cartographic.height;
            console.log("높이:", height);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    })();

    return () => {
      if (!viewer) return;
      viewer.destroy();
    };
  }, []);

  return <></>;
}
