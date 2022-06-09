import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimerFinanceComponent } from './imprimer-finance.component';

describe('ImprimerFinanceComponent', () => {
  let component: ImprimerFinanceComponent;
  let fixture: ComponentFixture<ImprimerFinanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImprimerFinanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprimerFinanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
