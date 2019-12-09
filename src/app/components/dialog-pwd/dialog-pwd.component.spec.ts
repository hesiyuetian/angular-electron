import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPwdComponent } from './dialog-pwd.component';

describe('DialogPwdComponent', () => {
  let component: DialogPwdComponent;
  let fixture: ComponentFixture<DialogPwdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogPwdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogPwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
