import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceClientComponent } from './finance-client.component';

describe('FinanceClientComponent', () => {
  let component: FinanceClientComponent;
  let fixture: ComponentFixture<FinanceClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinanceClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
