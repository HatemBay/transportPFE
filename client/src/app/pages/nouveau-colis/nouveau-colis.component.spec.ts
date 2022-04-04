import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NouveauColisComponent } from './nouveau-colis.component';

describe('NouveauColisComponent', () => {
  let component: NouveauColisComponent;
  let fixture: ComponentFixture<NouveauColisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NouveauColisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NouveauColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
