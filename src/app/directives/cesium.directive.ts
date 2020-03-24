import { Directive, OnInit, ElementRef } from '@angular/core';
import { EntityControllerService } from '../services/entity-controller.service';
import { PolygonPrimitive } from "../classes/PolygonPrimitive";
import { v1 } from 'uuid';

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
    positions = [];
    pid = 83;
    entityId;
    location = {
        latitude: 0,
        longitude: 0,
        height: 0,
        endPosition: null,
        cartesian: null
    };
    idList = [];
    // 测试实体
    testEntityList = [];
    // 测试定时器
    timer = null;

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
            url: 'http://localhost:8100/yuanqu/part1/tileset.json',
            maximumMemoryUsage: 2048,
            maximumScreenSpaceError: 10
        });
        viewer.scene.primitives.add(tileset);
        const tileset2 = new Cesium.Cesium3DTileset({
            url: 'http://localhost:8100/yuanqu/part2/tileset.json',
            maximumMemoryUsage: 2048,
            maximumScreenSpaceError: 10
        });
        viewer.scene.primitives.add(tileset2);
        const tileset3 = new Cesium.Cesium3DTileset({
            url: 'http://localhost:8100/yuanqu/part3/tileset.json',
            maximumMemoryUsage: 2048,
            maximumScreenSpaceError: 10
        });
        viewer.scene.primitives.add(tileset3);
        viewer.flyTo(tileset, {
            duration: 3,
            offset: new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(-32.0),
                Cesium.Math.toRadians(-30.0),
                700
            )
        })
        this.offsetHeightTitleSet(tileset, -8);
        viewer.scene.postRender.addEventListener(() => {
            let heading = this.viewer.scene.camera.heading;
            let x = -Cesium.Math.toDegrees(heading);
            let degrees = "rotate(" + x + "deg)";
            if (this.el.nativeElement.firstChild) {
                this.el.nativeElement.childNodes[0].style.transform = degrees;
            }
        });
        this.initEntity(this.viewer);
    }
    createEntity(flag) {
        console.log("开始绘制！！");
        // this.drawPolygon();
        if (flag === 1) {
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
        } else {

        }
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
        let poly = undefined;

        //鼠标单击画点
        handler.setInputAction((movement) => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.position, this.viewer.scene.globe.ellipsoid);
            if (this.positions.length == 0) {
                this.positions.push(cartesian.clone());
            }
            this.positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标移动
        handler.setInputAction((movement) => {
            const cartesian = this.viewer.scene.camera.pickEllipsoid(movement.endPosition, this.viewer.scene.globe.ellipsoid);
            if (this.positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    this.entityId = v1();
                    this.idList.push(this.entityId);
                    poly = new PolygonPrimitive(this.entityId, this.positions, this.viewer);
                } else {
                    if (cartesian != undefined) {
                        this.positions.pop();
                        // cartesian.y += (1 + Math.random());
                        this.positions.push(cartesian);
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标右键单击结束绘制
        handler.setInputAction((movement) => {
            handler.destroy();
            callback(this.positions);
            this.entityController.entityList.push({
                id: this.entityId,
                iframeId: this.pid,
                modelType: 6,
                colorType: 4,
                status: 1,
                entityParam: {
                    positions: this.positions,
                    extrudedHeight: 20,
                    alpha: 0.5
                }
            });
            this.positions = [];
            this.pid += 1;
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
    deleteEntity() {
        const id = this.idList.pop();
        // this.viewer.entities.removeById(id);
        console.log(this.viewer.entities.removeById(id));
        this.entityController.entityList.pop();
        this.positions = [];
        this.pid -= 1;
    }
    // 初始化数据
    initEntity(viewer) {
        this.entityController.entityList.forEach(item => {
            const options = {
                id: 'test',
                name: '多边形',
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(item.entityParam.positions),
                    extrudedHeight: 4,
                    material: Cesium.Color.YELLOW.withAlpha(0.4),
                    outline: true,
                    outlineColor: Cesium.Color.RED
                }
            }
            const entity = viewer.entities.add(options);
            this.drawShapeLabel(entity, {
                id: '1111',
                name: '楼层一',
                x: 0,
                y: 0,
                z: 0
            }, viewer);
            this.testEntityList.push(entity);
            const options2 = {
                id: 'test2',
                name: '多边形',
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(item.entityParam.positions),
                    height: 4,
                    extrudedHeight: 8,
                    material: Cesium.Color.BLUE.withAlpha(0.4),
                    outline: true,
                    outlineColor: Cesium.Color.RED
                }
            }
            const entity2 = viewer.entities.add(options2);
            this.drawShapeLabel(entity2, {
                id: '11121',
                name: '楼层二',
                x: 0,
                y: 5,
                z: -10
            }, viewer);
            this.testEntityList.push(entity2);
            const options3 = {
                id: 'test3',
                name: '多边形',
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(item.entityParam.positions),
                    height: 8,
                    extrudedHeight: 14.2,
                    material: Cesium.Color.RED.withAlpha(0.4),
                    outline: true,
                    outlineColor: Cesium.Color.RED
                },
                label: {
                    text: '三楼',
                    font: "14px SimHei ",
                    Width: 3,
                    style: Cesium.LabelStyle.FILL,
                    fillColor: Cesium.Color.WHITE,
                    backgroundColor: Cesium.Color.BLACK.withAlpha(0.6),
                    showBackground: true,
                    outlineColor: Cesium.Color.WHITE,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    eyeOffset: new Cesium.Cartesian3(0, 5, 0),
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.TOP,
                    scaleByDistance: new Cesium.NearFarScalar(100, 1, 1000, 0.8),
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY
                }
            }
            this.drawShapeLabel(entity2, {
                id: '111221',
                name: '楼层三',
                x: 0,
                y: 10,
                z: -10
            }, viewer);
            const entity3 = viewer.entities.add(options3);
            this.testEntityList.push(entity3);
        });
    }
    flicker(tag) {
        if (tag) {
            const entity = this.testEntityList[0];
            let flag = true;
            let x = 1;
            // this.timer = setInterval(() => {
            //     if (flag) {
            //         entity.polygon.material = Cesium.Color.RED.withAlpha(0.9);
            //         flag = false;
            //     } else {
            //         entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.4)
            //         flag = true;
            //     }
            // }, 900);
            entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(() => {
                if (flag) {
                    x = x - 0.05;
                    if (x <= 0.3) {
                        flag = false;
                    }
                } else {
                    x = x + 0.05;
                    if (x >= 1) {
                        flag = true;
                    }
                }
                return Cesium.Color.YELLOW.withAlpha(x);
            }, false))
        } else {
            const entity = this.testEntityList[0];
            // clearInterval(this.timer);
            entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.4)
            // this.timer = null;
        }
    }
    drawShapeLabel(shape, params, cesiumViewer) {
        const polyPositions = shape.polygon.hierarchy.getValue(Cesium.JulianDate.now()).positions;
        let polyCenter = Cesium.BoundingSphere.fromPoints(polyPositions).center;
        polyCenter = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
        let labelEntity = cesiumViewer.entities.add({
            position: polyCenter,
            polygonId:  params.id,
            label: {
                font: '11px sans-serif',
                text: params.name,
                fillColor: Cesium.Color.WHITE,
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
                showBackground: true,
                outlineColor: Cesium.Color.WHITE,
                outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                // pixelOffset:new Cesium.Cartesian3(0, -100),
                eyeOffset: new Cesium.Cartesian3(params.x, params.y, params.z),
                scaleByDistance: new Cesium.NearFarScalar(100, 1.5, 1000, 0.8),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 1500),
                // 解决label被遮挡问题，将label置顶
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                show:  true
            }
        });
        return labelEntity
    }
}

