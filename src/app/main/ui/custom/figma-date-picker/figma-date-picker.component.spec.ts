import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FigmaDatePickerComponent } from './figma-date-picker.component';

describe('FigmaDatePickerComponent', () => {
  let component: FigmaDatePickerComponent;
  let fixture: ComponentFixture<FigmaDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FigmaDatePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FigmaDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
