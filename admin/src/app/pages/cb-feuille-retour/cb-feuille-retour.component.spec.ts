import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbFeuilleRetourComponent } from './cb-feuille-retour.component';

describe('CbFeuilleRetourComponent', () => {
  let component: CbFeuilleRetourComponent;
  let fixture: ComponentFixture<CbFeuilleRetourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbFeuilleRetourComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbFeuilleRetourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
