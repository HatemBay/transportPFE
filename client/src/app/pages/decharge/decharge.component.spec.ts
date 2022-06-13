import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DechargeComponent } from './decharge.component';

describe('DechargeComponent', () => {
  let component: DechargeComponent;
  let fixture: ComponentFixture<DechargeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DechargeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DechargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
