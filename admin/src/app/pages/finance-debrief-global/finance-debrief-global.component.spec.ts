import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceDebriefGlobalComponent } from './finance-debrief-global.component';

describe('FinanceDebriefGlobalComponent', () => {
  let component: FinanceDebriefGlobalComponent;
  let fixture: ComponentFixture<FinanceDebriefGlobalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceDebriefGlobalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceDebriefGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
