import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CbPickupsComponent } from './cb-pickups.component';

describe('CbPickupsComponent', () => {
  let component: CbPickupsComponent;
  let fixture: ComponentFixture<CbPickupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CbPickupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CbPickupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
