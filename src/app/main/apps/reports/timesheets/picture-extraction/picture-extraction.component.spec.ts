import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PictureExtractionComponent } from './picture-extraction.component';

describe('PictureExtractionComponent', () => {
  let component: PictureExtractionComponent;
  let fixture: ComponentFixture<PictureExtractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PictureExtractionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PictureExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
