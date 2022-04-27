import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbRamassageComponent } from './cb-ramassage.component';

describe('CbRamassageComponent', () => {
  let component: CbRamassageComponent;
  let fixture: ComponentFixture<CbRamassageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbRamassageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbRamassageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
