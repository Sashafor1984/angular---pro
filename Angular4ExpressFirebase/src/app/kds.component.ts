import { Component } from '@angular/core';  
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from "rxjs/Observable";
import * as firebase from 'firebase/app';
import { SimpleTimer } from 'ng2-simple-timer';

@Component ({  
  selector: 'app-root',
  templateUrl: './kds.component.html',
  styleUrls: ['./app.component.css'] 
})
export class KdsComponent  { 
  transactions: FirebaseListObservable<any[]>;
  locations: FirebaseListObservable<any[]>;
  user: Observable<firebase.User>;
  items: FirebaseListObservable<any[]>;
  emailVal: string = '';
  value = '';
  constructor(public afAuth: AngularFireAuth, public af: AngularFireDatabase, private st: SimpleTimer) {
    this.afAuth.auth.signOut();
    this.user = this.afAuth.authState;
    //Read firebase DB
    this.locations = af.list('/locations', {
      query: {
        limitToLast: 50
      }
    });
    this.transactions = af.list('/realtime_data/transaction', {
      query: {
        limitToLast: 50
      }
    });
  }

  onClick(event: any) {
    // var target = event.target || event.srcElement || event.currentTarget;
    // var idAttr = target.attributes.id;
    // console.log(event);
    this.value += event.target.value + '|';
    console.log(event);
  }
  onkeyEnter(){
    console.log(event);
  }

    //firebase login/out
    login(event) {
        this.afAuth.auth.signInAnonymously();
        console.log(event);
    }
    logout() {
        this.afAuth.auth.signOut();
    }
  
  title = 'app'; 
} 