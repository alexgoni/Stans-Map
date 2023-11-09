import { useEffect, useRef, useState } from "react";
import * as Cesium from "cesium";
import { Viewer } from "@/components/handler/cesium/Viewer";
import ToolBox from "@/components/widget/measurement/ToolBox";
import useDidMountEffect from "@/components/module/useDidMountEffect";
import { useRecoilValue } from "recoil";
import {
  areaWidgetState,
  distanceWidgetState,
  radiusWidgetState,
} from "@/recoil/atom/MeasurementState";
import Drawer from "@/components/module/measurement/Drawer";

export default function Terrain() {
  const distanceWidgetOpen = useRecoilValue(distanceWidgetState);
  const radiusWidgetOpen = useRecoilValue(radiusWidgetState);
  const areaWidgetOpen = useRecoilValue(areaWidgetState);

  const [widgetAllClose, setWidgetAllClose] = useState(true);

  const widgetStateObj = {
    distanceWidgetOpen,
    radiusWidgetOpen,
    areaWidgetOpen,
  };

  const drawerRef = useRef(null);

  useEffect(() => {
    const viewer = Viewer({
      terrain: Cesium.Terrain.fromWorldTerrain(),
      baseLayerPicker: true,
    });

    const globe = viewer.scene.globe;
    globe.depthTestAgainstTerrain = true;
    viewer.extend(Cesium.viewerCesiumInspectorMixin);

    // measurement handler
    const drawer = new Drawer(viewer);
    drawerRef.current = drawer;

    const cartesianPosition = Cesium.Cartesian3.fromDegrees(
      127.18049,
      37.73457,
      500,
    );

    // const box = viewer.entities.add({
    //   position: cartesianPosition,
    //   box: {
    //     dimensions: new Cesium.Cartesian3(200.0, 200.0, 200.0),
    //     material: Cesium.Color.WHITE.withAlpha(0.1),
    //     outline: true,
    //     outlineColor: Cesium.Color.WHITE,
    //   },
    // });

    const tecno = viewer.entities.add({
      position: cartesianPosition,
      model: {
        uri: "/glb/tecno.glb",
        scale: 0.01,
      },
    });

    globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      modelMatrix: tecno.computeModelMatrix(Cesium.JulianDate.now()),
      planes: [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), -400.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), -400.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), -400.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), -400.0),
      ],
      //   edgeWidth: 1.0,
      //   edgeColor: Cesium.Color.WHITE,
    });

    const plane1 = viewer.entities.add({
      position: cartesianPosition,
      plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 400.0),
        dimensions: new Cesium.Cartesian2(800.0, 100.0),
        material: Cesium.Color.DARKGREEN,
      },
    });

    const plane2 = viewer.entities.add({
      position: cartesianPosition,
      plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_X, -400.0),
        dimensions: new Cesium.Cartesian2(800.0, 100.0),
        material: Cesium.Color.DARKGREEN,
      },
    });

    const plane3 = viewer.entities.add({
      position: cartesianPosition,
      plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Y, 400.0),
        dimensions: new Cesium.Cartesian2(800.0, 100.0),
        material: Cesium.Color.DARKGREEN,
      },
    });

    const plane4 = viewer.entities.add({
      position: cartesianPosition,
      plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Y, -400.0),
        dimensions: new Cesium.Cartesian2(800.0, 100.0),
        material: Cesium.Color.DARKGREEN,
      },
    });

    const plane5 = viewer.entities.add({
      position: cartesianPosition,
      plane: {
        plane: new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0.0),
        dimensions: new Cesium.Cartesian2(800.0, 800.0),
        material: Cesium.Color.GRAY,
      },
    });

    viewer.zoomTo(tecno);

    return () => {
      viewer.destroy();
    };
  }, []);

  // Measurement
  useDidMountEffect(() => {
    const drawer = drawerRef.current;

    drawer.setWidgetState(widgetStateObj);
    drawer.drawingHandler();

    setWidgetAllClose(
      !distanceWidgetOpen && !radiusWidgetOpen && !areaWidgetOpen,
    );

    return () => {
      drawer.cleanUpDrawer();
    };
  }, [distanceWidgetOpen, radiusWidgetOpen, areaWidgetOpen]);

  return (
    <>
      {" "}
      <ToolBox />
    </>
  );
}
