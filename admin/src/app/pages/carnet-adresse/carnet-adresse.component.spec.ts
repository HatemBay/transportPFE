import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarnetAdresseComponent } from './carnet-adresse.component';

describe('CarnetAdresseComponent', () => {
  let component: CarnetAdresseComponent;
  let fixture: ComponentFixture<CarnetAdresseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarnetAdresseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarnetAdresseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
