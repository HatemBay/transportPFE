import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionPersonelComponent } from './gestion-personel.component';

describe('GestionPersonelComponent', () => {
  let component: GestionPersonelComponent;
  let fixture: ComponentFixture<GestionPersonelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionPersonelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionPersonelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
