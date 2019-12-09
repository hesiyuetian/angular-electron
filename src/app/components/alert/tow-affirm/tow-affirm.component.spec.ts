import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TowAffirmComponent } from './tow-affirm.component';

describe('TowAffirmComponent', () => {
  let component: TowAffirmComponent;
  let fixture: ComponentFixture<TowAffirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TowAffirmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TowAffirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
