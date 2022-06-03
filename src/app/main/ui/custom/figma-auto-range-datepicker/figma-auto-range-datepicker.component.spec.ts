import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigmaAutoRangeDatepickerComponent } from './figma-auto-range-datepicker.component';

describe('FigmaAutoRangeDatepickerComponent', () => {
  let component: FigmaAutoRangeDatepickerComponent;
  let fixture: ComponentFixture<FigmaAutoRangeDatepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FigmaAutoRangeDatepickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FigmaAutoRangeDatepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
