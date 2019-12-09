import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprilSearSelectComponent } from './april-sear-select.component';

describe('AprilSearSelectComponent', () => {
  let component: AprilSearSelectComponent;
  let fixture: ComponentFixture<AprilSearSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprilSearSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprilSearSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
