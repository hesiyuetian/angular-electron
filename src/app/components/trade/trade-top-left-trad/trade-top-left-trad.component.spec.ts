import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeTopLeftTradComponent } from './trade-top-left-trad.component';

describe('TradeTopLeftTradComponent', () => {
  let component: TradeTopLeftTradComponent;
  let fixture: ComponentFixture<TradeTopLeftTradComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeTopLeftTradComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeTopLeftTradComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
