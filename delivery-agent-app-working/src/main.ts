import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.config';
import { routes } from './app/app.routes';

import '@material/web/all.js';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withComponentInputBinding())]
}).catch(err => console.error(err));
