import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbDebriefComponent } from './cb-debrief.component';

describe('CbDebriefComponent', () => {
  let component: CbDebriefComponent;
  let fixture: ComponentFixture<CbDebriefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbDebriefComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbDebriefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
