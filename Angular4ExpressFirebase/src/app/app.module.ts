import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { SimpleTimer } from 'ng2-simple-timer';

// New imports to update based on AngularFire2 version 4
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AppComponent } from './app.component';
import { KdsComponent } from './kds.component';

const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login',  component: AppComponent },
  { path: 'dashboard',  component: KdsComponent },
  ];

export const firebaseConfig = {
  apiKey: "yours",
  authDomain: "yours-app.firebaseapp.com",
  databaseURL: "https://yours-app.firebaseio.com",
  projectId: "kds-app",
  storageBucket: "yours-app.appspot.com",
  messagingSenderId: "yours"
};

@NgModule({
  declarations: [
    AppComponent,
    KdsComponent
  ],
  imports: [
    BrowserModule,
    // RouterModule.forRoot(appRoutes),
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [SimpleTimer],
  bootstrap: [AppComponent]
})
export class AppModule { }
