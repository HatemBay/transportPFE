import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprimerRoadmapComponent } from './imprimer-roadmap.component';

describe('ImprimerRoadmapComponent', () => {
  let component: ImprimerRoadmapComponent;
  let fixture: ComponentFixture<ImprimerRoadmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImprimerRoadmapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImprimerRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
