import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionColisComponent } from './gestion-colis.component';

describe('GestionColisComponent', () => {
  let component: GestionColisComponent;
  let fixture: ComponentFixture<GestionColisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionColisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
