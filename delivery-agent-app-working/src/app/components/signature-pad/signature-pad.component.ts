import { AfterViewInit, Component, ElementRef, HostListener, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-signature-pad',
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],   // <-- add this line
  styleUrls: ['./signature-pad.component.css'],
  templateUrl: './signature-pad.component.html'
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private last?: { x: number; y: number };

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.clear();
  }

  @HostListener('window:resize')
  resize() {
    const canvas = this.canvasRef.nativeElement;
    const data = canvas.toDataURL();
    canvas.width = canvas.clientWidth;
    canvas.height = 180;
    if (data) {
      const img = new Image();
      img.onload = () => this.ctx.drawImage(img, 0, 0);
      img.src = data;
    }
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#111827';
  }

  pointerDown(ev: PointerEvent) { this.drawing = true; this.last = this.point(ev); }
  pointerMove(ev: PointerEvent) {
    if (!this.drawing || !this.last) return;
    const p = this.point(ev);
    this.ctx.beginPath();
    this.ctx.moveTo(this.last.x, this.last.y);
    this.ctx.lineTo(p.x, p.y);
    this.ctx.stroke();
    this.last = p;
  }
  pointerUp() { this.drawing = false; this.last = undefined; }

  private point(ev: PointerEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  clear() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  toDataUrl() { return this.canvasRef.nativeElement.toDataURL('image/png'); }
}
