import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeTopRightComponent } from './trade-top-right.component';

describe('TradeTopRightComponent', () => {
  let component: TradeTopRightComponent;
  let fixture: ComponentFixture<TradeTopRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeTopRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeTopRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
