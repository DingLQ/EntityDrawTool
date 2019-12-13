export class PolygonPrimitive {
    options: any;
    hierarchy: [];
    constructor(id, positions, viewer) {
        this.options = {
            id: id,
            name: '多边形',
            polygon: {
                hierarchy: [],
                perPositionHeight: true,
                extrudedHeight: 10,
                material: Cesium.Color.YELLOW.withAlpha(0.4),
                outline: true,
                outlineColor: Cesium.Color.RED
            }
        };
        this.hierarchy = positions;
        this.init(viewer);
    }
    init(viewer) {
        const _update = () => {
            var list = [];
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
