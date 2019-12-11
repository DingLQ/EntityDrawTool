import { Directive, OnInit, ElementRef } from '@angular/core';
import { EntityControllerService } from '../services/entity-controller.service';
import { PolygonPrimitive } from "../classes/PolygonPrimitive";

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
            imageryProvider: new Cesium.UrlTemplateImageryProvider({
                url: "http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
                tilingScheme: new Cesium.WebMercatorTilingScheme(),
                minimumLevel: 1,
                maximumLevel: 20
            }),
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
        this.offsetHeightTitleSet(tileset, -15);
        viewer.scene.postRender.addEventListener(() => {
            let heading = this.viewer.scene.camera.heading;
            let x = -Cesium.Math.toDegrees(heading);
            let degrees = "rotate(" + x + "deg)";
            if (this.el.nativeElement.firstChild) {
                this.el.nativeElement.childNodes[0].style.transform = degrees;
            }
        });
        // const initPosition = Cesium.Cartesian3.fromElements(
        //     -2703955.392467108, 4692442.0001306925, 3357716.7911205976
        // );
        // let point = this.createPoint(initPosition);

    }
    createEntity() {
        console.log("开始绘制！！");
        // this.drawPolygon();
        this.drawPolygon((positions) => {
            const wgs84_positions = [];
            for (var i = 0; i < positions.length; i++) {
                var wgs84_point = this.Cartesian3_to_WGS84({
                    x: positions[i].x,
                    y: positions[i].y,
                    z: positions[i].z
                });
                wgs84_positions.push(wgs84_point);
            }
        });
    }
    drawPolygonTest() {
        const initPosition = Cesium.Cartesian3.fromElements(
            -2703955.392467108, 4692442.0001306925, 3357716.7911205976
        );
        let point = this.createPoint(initPosition);
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
        handler.setInputAction((movement) => {
            const position1 = this.viewer.scene.camera.pickEllipsoid(
                movement.endPosition,
                this.viewer.scene.globe.ellipsoid
            );
            point.position = position1;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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
                pixelSize: 4,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
            }
        });
        return point;
    }
    drawPoint(callback) {
        const _this = this;
        //坐标存储
        const positions = [];

        const handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);

        //单击鼠标左键画点
        handler.setInputAction((movement) => {
            const cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
            positions.push(cartesian);
            _this.viewer.entities.add({
                position: cartesian,
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 5,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //单击鼠标右键结束画点
        handler.setInputAction((movement) => {
            handler.destroy();
            callback(positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    drawPolygon(callback) {
        const _this = this;
        const handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        const positions = [];
        let poly = undefined;

        //鼠标单击画点
        handler.setInputAction((movement) => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler.setInputAction((movement) => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolygonPrimitive(positions, this.viewer);
                } else {
                    if (cartesian != undefined) {
                        positions.pop();
                        cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标右键单击结束绘制
        handler.setInputAction((movement) => {
            handler.destroy();
            callback(positions);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    offsetHeightTitleSet(tileset, heightOffset = 0) {
        tileset.readyPromise.then((t) => {
            const boundingSphere = t.boundingSphere;
            const cartographic = Cesium.Cartographic.fromCartesian(
                boundingSphere.center
            );
            const surface = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                0.0
            );
            const offset = Cesium.Cartesian3.fromRadians(
                cartographic.longitude,
                cartographic.latitude,
                heightOffset
            );
            const translation = Cesium.Cartesian3.subtract(
                offset,
                surface,
                new Cesium.Cartesian3()
            );
            t.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
        });
    }
    Cartesian3_to_WGS84(point) {
        var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var alt = cartographic.height;
        return { lat: lat, lng: lng, alt: alt };
    }
}

