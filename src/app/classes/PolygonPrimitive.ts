export class PolygonPrimitive {
    options: any;
    hierarchy: [];
    constructor(positions, viewer) {
        this.options = {
            name: '多边形',
            polygon: {
                hierarchy: [],
                perPositionHeight: true,
                extrudedHeight: 20,
                material: Cesium.Color.RED.withAlpha(0.4)
            }
        };
        this.hierarchy = positions;
        this.init(viewer);
    }
    init(viewer) {
        const _update = () => {
            var list = [];
            console.log(this.hierarchy)
            return new Cesium.PolygonHierarchy(this.hierarchy);
        };
        this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
        viewer.entities.add(this.options);
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
