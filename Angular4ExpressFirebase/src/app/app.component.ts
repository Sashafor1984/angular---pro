import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as firebase from 'firebase/app';
import { SimpleTimer } from 'ng2-simple-timer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// export class Kds_target {
//   email: string;
//   pass : string;
// }
export class AppComponent {
  transactions: FirebaseListObservable<any[]>;
  locations: FirebaseListObservable<any[]>;
  user: Observable<firebase.User>;
  items: FirebaseListObservable<any[]>;
  msgVal: string = '';
  emailVal: string = '';
  value = '';
  // get_target: Kds_target ={
  //   email: 'example@mail.com',
  //   pass : '*****'
  // };
  constructor(public afAuth: AngularFireAuth, public af: AngularFireDatabase, private st: SimpleTimer) {
    this.afAuth.auth.signOut();
    // this.items = af.list('/messages', {
    //   query: {
    //     limitToLast: 50
    //   }
    // });

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
    this.items = af.list('/realtime_data/items', {
      query: {
        limitToLast: 50
      }
    });
    // console.log(this.locations);
  }

  //


  onClick(event: any) {
    // var target = event.target || event.srcElement || event.currentTarget;
    // var idAttr = target.attributes.id;
    // console.log(event);
    // this.value += event.target.value + '|';
    // console.log(event.$key);
    // this.af.list('/realtime_data/transaction').remove(event.$key);
    console.log(event);
    this.af.list('/realtime_data/transaction/' + event).remove();
 
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
    //send message
    Send(desc: string) {
        this.items.push({ message: desc});
        this.msgVal = '';
    }
  title = 'app';
}
