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
  @ViewChild(CesiumDirective, {static: false}) map: CesiumDirective;
  title = 'entity-draw-tool';
  constructor(private entityController: EntityControllerService) {

  }
  test() {
    console.log('测试绘制函数');
    this.map.createEntity();
  }
}
