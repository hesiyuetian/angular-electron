import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AprilTimeComponent } from './april-time.component';

describe('AprilTimeComponent', () => {
  let component: AprilTimeComponent;
  let fixture: ComponentFixture<AprilTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AprilTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AprilTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
