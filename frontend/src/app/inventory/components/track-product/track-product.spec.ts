import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackProduct } from './track-product';

describe('TrackProduct', () => {
  let component: TrackProduct;
  let fixture: ComponentFixture<TrackProduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackProduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackProduct);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
