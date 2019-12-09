import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprilDateComponent } from './april-date.component';

describe('AprilDateComponent', () => {
  let component: AprilDateComponent;
  let fixture: ComponentFixture<AprilDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprilDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprilDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
