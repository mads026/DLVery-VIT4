import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="sticky top-0 z-20">
      <md-top-app-bar>
        <div slot="title">DIVery – Delivery Agent</div>
      </md-top-app-bar>
    </div>

    <main class="container py-4">
      <router-outlet></router-outlet>
    </main>

    <footer class="container py-6 text-center text-sm text-gray-500">
      © {{year}} DIVery Logistics
    </footer>
  `
})
export class AppComponent {
  year = new Date().getFullYear();
}
