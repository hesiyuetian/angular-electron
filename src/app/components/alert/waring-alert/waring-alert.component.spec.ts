import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaringAlertComponent } from './waring-alert.component';

describe('WaringAlertComponent', () => {
  let component: WaringAlertComponent;
  let fixture: ComponentFixture<WaringAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaringAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaringAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
