import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprilSelectComponent } from './april-select.component';

describe('AprilSelectComponent', () => {
  let component: AprilSelectComponent;
  let fixture: ComponentFixture<AprilSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprilSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprilSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
