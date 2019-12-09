import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HostoryListComponent } from './hostory-list.component';

describe('HostoryListComponent', () => {
  let component: HostoryListComponent;
  let fixture: ComponentFixture<HostoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HostoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HostoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
