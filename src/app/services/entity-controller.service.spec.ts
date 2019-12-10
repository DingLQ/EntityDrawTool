import { TestBed } from '@angular/core/testing';

import { EntityControllerService } from './entity-controller.service';

describe('EntityControllerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntityControllerService = TestBed.get(EntityControllerService);
    expect(service).toBeTruthy();
  });
});
