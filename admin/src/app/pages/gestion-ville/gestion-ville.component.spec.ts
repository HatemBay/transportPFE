import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionVilleComponent } from './gestion-ville.component';

describe('GestionVilleComponent', () => {
  let component: GestionVilleComponent;
  let fixture: ComponentFixture<GestionVilleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionVilleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionVilleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
