import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeColisComponent } from './liste-colis.component';

describe('ListeColisComponent', () => {
  let component: ListeColisComponent;
  let fixture: ComponentFixture<ListeColisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListeColisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeColisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
