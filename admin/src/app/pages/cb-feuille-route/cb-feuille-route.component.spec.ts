import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbFeuilleRouteComponent } from './cb-feuille-route.component';

describe('CbFeuilleRouteComponent', () => {
  let component: CbFeuilleRouteComponent;
  let fixture: ComponentFixture<CbFeuilleRouteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbFeuilleRouteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbFeuilleRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
