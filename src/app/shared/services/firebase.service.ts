import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import {reject} from 'q';
import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {DataDump, DataDumpClass} from '../models/data-dump';

@Injectable()
export class FirebaseService {
  private rootReference: firebase.database.Reference;
  private path: string;
  public lastData: any;
  private token: string;
  private guid: string;
  private username: string;
  private password: string;

  constructor(
      public afs: AngularFireDatabase,
      private afauth: AngularFireAuth
  ) {
    this.getCredsFromStorage();
  }

  private getCredsFromStorage() {
    this.username = localStorage.getItem('fbUser');
    this.password = localStorage.getItem('fbPass');
  }

  private setCredsToStorage() {
    localStorage.setItem('fbUser', this.username);
    localStorage.setItem('fbPass', this.password);
  }

  public getGuid() {
    return this.guid;
  }

  public getUsername() {
    return this.username;
  }

  public setCredentials(username:string, password: string) {
    this.username = username;
    this.password = password;
    this.setCredsToStorage();
    this.afauth.auth.signInWithEmailAndPassword(this.username, this.password).then((userCredential: firebase.auth.UserCredential) => {
      this.guid = userCredential.user.uid;
      userCredential.user.getIdToken().then((token: string) => {
        this.token = token;
        this.path = '/data/' + this.guid;
        this.rootReference = this.afs.database.ref(this.path);
      });
    }).catch((error) => {
      
      switch(error.code) {
        case 'auth/user-not-found':
          this.createUser(username, password);
          break;

        default:
          console.log(error);
          break;
      }
    });
  }

  private createUser(username: string, password: string) {
    this.afauth.auth.createUserWithEmailAndPassword(this.username, this.password).then((userCredential: firebase.auth.UserCredential) => {
      this.guid = userCredential.user.uid;
      userCredential.user.getIdToken().then((token: string) => {
        this.token = token;
        this.path = '/data/' + this.guid;
        this.rootReference = this.afs.database.ref(this.path);
      });
    }).catch((error) => {
      console.log(error);
    })
  }

  private authenticate(forceAuth?: boolean): Promise<any> {
    if(this.token != null && this.token != '') {
      // If we have authenticated, bypass
      return new Promise<any>((resolve, reject) => {
        console.log(this.token);
        resolve();
      })
    }
    return new Promise<any>((resolve, reject) => {
      if(!this.username || this.username == '') {
        this.afauth.auth.signInAnonymously().then((userCredential: firebase.auth.UserCredential) => {
          this.guid = userCredential.user.uid;
          userCredential.user.getIdToken().then((token: string) => {
            this.token = token;
            this.path = '/data/' + this.guid;
            this.rootReference = this.afs.database.ref(this.path);
            resolve();
          });
        });
      } else {
        this.afauth.auth.signInWithEmailAndPassword(this.username, this.password).then((userCredential: firebase.auth.UserCredential) => {
          this.guid = userCredential.user.uid;
          userCredential.user.getIdToken().then((token: string) => {
            this.token = token;
            this.path = '/data/' + this.guid;
            this.rootReference = this.afs.database.ref(this.path);
            resolve();
          });
        }).catch((error) => {
          console.log(error);
        })
      }
    });
  }

  public getData(): Promise<DataDumpClass> {
    return new Promise<any>((resolve, reject) => {
      this.authenticate().then(() => {
        this.afs.object(this.path).valueChanges().subscribe(item => {
          this.lastData = item;
          const result: DataDumpClass = new DataDumpClass(item);
          resolve(result);
        });
      });
    });
  }

  public setData(value: DataDump): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.authenticate().then(() => {
        this.rootReference.set(value)
            .then(_ => {
              console.log('success');
              resolve();
            })
            .catch(err => {
              console.log(err, 'You dont have access!');
              reject();
            });
      });
    });
  }
}
