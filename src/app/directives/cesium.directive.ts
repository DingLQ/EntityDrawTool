import { Directive, OnInit, ElementRef } from '@angular/core';
import { EntityControllerService } from '../services/entity-controller.service';

@Directive({
  selector: '[appCesium]'
})
export class CesiumDirective implements OnInit {

  constructor(
    private el: ElementRef,
    private entityController: EntityControllerService
  ) { }
  // 视图
  viewer;
  entityList;
  location = {
    latitude: 0,
    longitude: 0,
    height: 0,
    endPosition: null,
    cartesian: null
  };

  ngOnInit() {
    // Put initialization code for the Cesium viewer here
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZWI4OTAxMS0wYjc2LTQ3NWUtOWFkOS1hY2ViOWQ2NDgxMmIiLCJpZCI6MTg1MzEsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzQwMDE5Mzl9.nSOQemx1yal3tckfBFKdtPejVthMav__ywvb0Qfg6lU';
    const viewer = new Cesium.Viewer(this.el.nativeElement, {
      // 左下角动画控件
      animation: false,
      // 时间轴控件
      timeline: false,
      // VR显示按钮
      vrButton: false,
      infoBox: false,
      // 平面或3d选择按钮
      sceneModePicker: false,
      // true 只3D显示，不会显示上面按钮
      scene3DOnly: true,
      // 帮助按钮
      navigationHelpButton: false,
      // 图层选择按钮
      baseLayerPicker: false,
      // 搜索功能
      geocoder: false,
      // 删除焦点绿色框
      selectionIndicator: false,
      baseLayerPickerL: false,
      shouldAnimate: true
    });
    this.viewer = viewer;
    viewer._cesiumWidget._creditContainer.style.display = "none";
    const tileset = new Cesium.Cesium3DTileset({
      // url: process.env.TILESET_URL,
      url: '/assets/Scene-bl/tileset.json',
      maximumMemoryUsage: 2048,
      maximumScreenSpaceError: 1
    });
    viewer.scene.primitives.add(tileset);
    viewer.flyTo(tileset, {
      duration: 3,
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(-32.0),
        Cesium.Math.toRadians(-30.0),
        700
      )
    })
    viewer.scene.postRender.addEventListener(() => {
      let heading = this.viewer.scene.camera.heading;
      let x = -Cesium.Math.toDegrees(heading);
      let degrees = "rotate(" + x + "deg)";
      if (this.el.nativeElement.firstChild) {
        this.el.nativeElement.childNodes[0].style.transform = degrees;
      }
    });
  }
  createEntity() {
    console.log("开始绘制！！");
    this.drawPolygon();
  }
  drawPolygon() {

    // const initPosition = Cesium.Cartesian3.fromElements(
    //   -2730946.473334756,
    //   4592955.889762347,
    //   3470754.134568858
    // );
    // let point = this.createPoint(initPosition);
    // let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    // handler.setInputAction((click) => {
    //   let position = this.viewer.scene.pickPosition(click.position);
    //   if (Cesium.defined(this.location.cartesian)) {
    //     let cartesian = this.location.cartesian;
    //     if (activeShapePoints.length === 0) {
    //       floatingPoint = this.createPoint(cartesian);
    //       activeShapePoints.push(cartesian);
    //       let dynamicPositions = new Cesium.CallbackProperty(function () {
    //         return activeShapePoints;
    //       }, false);
    //       activePolygon = this.createPolygon(dynamicPositions);
    //     }
    //     activeShapePoints.push(cartesian);
    //     this.createPoint(cartesian);
    //   }
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // handler.setInputAction((movement) => {
    //   if (Cesium.defined(floatingPoint)) {
    //     if (Cesium.defined(this.location.endPosition)) {
    //       floatingPoint.position.setValue(this.location.endPosition);
    //       activeShapePoints.pop();
    //       activeShapePoints.push(this.location.endPosition);
    //     }
    //   }
    // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    // handler.setInputAction((movement) => {
    //   handler.destroy();
    //   const Points = [];
    //   for (let i = 0; i < Points.length; i++) {
    //     this.viewer.entities.remove(Points[i]);
    //   }
    // }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  createPolygon(positionData) {
    let polygon;
    polygon = this.viewer.entities.add({
      name: "polygon",
      positions: positionData,
      polygon: {
        hierarchy: positionData,
        perPositionHeight: true,
        material: Cesium.Color.RED.withAlpha(0.7),
        outline: true,
        outlineColor: Cesium.Color.YELLOW.withAlpha(1)
      }
    });
    return polygon;
  }
  createPoint(worldPosition) {
    const point = this.viewer.entities.add({
      position: worldPosition,
      point: {
        color: Cesium.Color.WHITE,
        pixelSize: 5,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
    return point;
  }
}
