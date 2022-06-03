import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentHrComponent } from './department-hr.component';

describe('DepartmentHrComponent', () => {
  let component: DepartmentHrComponent;
  let fixture: ComponentFixture<DepartmentHrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepartmentHrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentHrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
