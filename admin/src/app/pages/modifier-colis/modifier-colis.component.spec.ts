import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifierColisComponent } from './modifier-colis.component';

describe('ModifierColisComponent', () => {
  let component: ModifierColisComponent;
  let fixture: ComponentFixture<ModifierColisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModifierColisComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModifierColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
