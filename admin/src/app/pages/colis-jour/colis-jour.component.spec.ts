import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColisJourComponent } from './colis-jour.component';

describe('ColisJourComponent', () => {
  let component: ColisJourComponent;
  let fixture: ComponentFixture<ColisJourComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColisJourComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColisJourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
