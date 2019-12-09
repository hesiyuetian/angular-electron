import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssestComponent } from './assest.component';

describe('AssestComponent', () => {
  let component: AssestComponent;
  let fixture: ComponentFixture<AssestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
