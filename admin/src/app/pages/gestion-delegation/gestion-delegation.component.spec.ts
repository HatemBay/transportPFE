import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDelegationComponent } from './gestion-delegation.component';

describe('GestionDelegationComponent', () => {
  let component: GestionDelegationComponent;
  let fixture: ComponentFixture<GestionDelegationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionDelegationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionDelegationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
