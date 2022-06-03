import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyListItemComponent } from './empty-list-item.component';

describe('EmptyListItemComponent', () => {
  let component: EmptyListItemComponent;
  let fixture: ComponentFixture<EmptyListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
