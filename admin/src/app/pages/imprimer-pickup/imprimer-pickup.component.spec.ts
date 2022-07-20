import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimerPickupComponent } from './imprimer-pickup.component';

describe('ImprimerPickupComponent', () => {
  let component: ImprimerPickupComponent;
  let fixture: ComponentFixture<ImprimerPickupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImprimerPickupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprimerPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
