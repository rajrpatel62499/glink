import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigmaTableComponent } from './figma-table.component';

describe('FigmaTableComponent', () => {
  let component: FigmaTableComponent;
  let fixture: ComponentFixture<FigmaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FigmaTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FigmaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
