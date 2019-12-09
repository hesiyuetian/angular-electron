import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeSymbolComponent } from './trade-symbol.component';

describe('TradeSymbolComponent', () => {
  let component: TradeSymbolComponent;
  let fixture: ComponentFixture<TradeSymbolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeSymbolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeSymbolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
