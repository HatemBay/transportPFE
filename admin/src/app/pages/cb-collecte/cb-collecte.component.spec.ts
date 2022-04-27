import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbCollecteComponent } from './cb-collecte.component';

describe('CbCollecteComponent', () => {
  let component: CbCollecteComponent;
  let fixture: ComponentFixture<CbCollecteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbCollecteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbCollecteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
