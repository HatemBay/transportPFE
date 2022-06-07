import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimerFeuilleRetourComponent } from './imprimer-feuille-retour.component';

describe('ImprimerFeuilleRetourComponent', () => {
  let component: ImprimerFeuilleRetourComponent;
  let fixture: ComponentFixture<ImprimerFeuilleRetourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImprimerFeuilleRetourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprimerFeuilleRetourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
