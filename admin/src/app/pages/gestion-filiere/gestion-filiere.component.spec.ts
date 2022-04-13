import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionFiliereComponent } from './gestion-filiere.component';

describe('GestionFiliereComponent', () => {
  let component: GestionFiliereComponent;
  let fixture: ComponentFixture<GestionFiliereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionFiliereComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionFiliereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
