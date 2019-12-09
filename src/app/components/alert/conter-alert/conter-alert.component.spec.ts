import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConterAlertComponent } from './conter-alert.component';

describe('ConterAlertComponent', () => {
  let component: ConterAlertComponent;
  let fixture: ComponentFixture<ConterAlertComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConterAlertComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConterAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
