import { Component, ViewChild } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { EntityControllerService } from "./services/entity-controller.service"
import localeZh from '@angular/common/locales/zh-Hans';
import { CesiumDirective } from "./directives/cesium.directive";

registerLocaleData(localeZh);
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild(CesiumDirective, { static: false }) map: CesiumDirective;
    butttonContent = '开始绘图';
    flickerButton = '闪烁测试';
    flickerFlag = true;
    flag = 1;
    constructor(private entityController: EntityControllerService) {

    }
    test() {
        console.log('测试绘制函数');
        this.map.createEntity(this.flag);
        // this.butttonContent = '结束绘图';
        // this.flag  = this.flag === 1 ? 0 : 1;
    }
    delete() {
        this.map.deleteEntity();
    }
    printLog() {
        console.log(JSON.stringify(this.entityController.entityList));
    }
    flicker() {
        if (this.flickerFlag) {
            this.flickerButton = '停止闪烁';
            this.map.flicker(true);
            this.flickerFlag = false;
        } else {
            this.flickerButton = '闪烁测试';
            this.map.flicker(false);
            this.flickerFlag = true;
        }
    }
}
