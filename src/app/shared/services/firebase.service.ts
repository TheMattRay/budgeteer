import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import {reject} from 'q';
import * as firebase from 'firebase';
import {AngularFireAuth} from '@angular/fire/auth';
import {DataDump, DataDumpClass} from '../models/data-dump';
import { BudgeteerCredential } from '../models/budgeteer-credential';

@Injectable()
export class FirebaseService {
  public lastData: any;
  private budgeteerCredential: BudgeteerCredential;

  constructor(
      public afs: AngularFireDatabase,
      private afauth: AngularFireAuth
  ) {
    this.getCredsFromStorage();
  }

  // TODO: Add security for username/password
  private getCredsFromStorage() {
    this.budgeteerCredential = localStorage.getItem('budgeteerCredential') ?
      JSON.parse(localStorage.getItem('budgeteerCredential')) : {} as BudgeteerCredential;
    this.authenticate();
  }

  private setCredsToStorage() {
    localStorage.setItem('budgeteerCredential', JSON.stringify(this.budgeteerCredential));
  }

  public getGuid() {
    return this.budgeteerCredential.guid;
  }

  public getUsername() {
    return this.budgeteerCredential.username;
  }

  public setCredentials(username: string, password: string) {
    this.afauth.auth.signInWithEmailAndPassword(username, password).then((userCredential: firebase.auth.UserCredential) => {
      userCredential.user.getIdToken().then((token: string) => {
        this.makeBudgeteerCredential(userCredential, token);
        this.setCredsToStorage();
      });
    }).catch((error) => {
      switch (error.code) {
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
    this.afauth.auth.createUserWithEmailAndPassword(username, password).then((userCredential: firebase.auth.UserCredential) => {
      userCredential.user.getIdToken().then((token: string) => {
        this.makeBudgeteerCredential(userCredential, token);
        this.setCredsToStorage();
      });
    }).catch((error) => {
      console.log(error);
    });
  }

  private authenticate(forceAuth?: boolean): Promise<any> {
    if (this.budgeteerCredential.token != null && this.budgeteerCredential.token !== '') {
      // If we have authenticated, bypass
      return new Promise<any>((resolve, reject) => {
        resolve();
      }).catch((error) => {
        console.log(error);
        reject(error);
      });
    }
    return new Promise<any>((resolve, reject) => {
      if (!this.budgeteerCredential.username || this.budgeteerCredential.username === '') {
        this.afauth.auth.signInAnonymously().then((userCredential: firebase.auth.UserCredential) => {
          userCredential.user.getIdToken().then((token: string) => {
            this.makeBudgeteerCredential(userCredential, token);
            this.setCredsToStorage();
            resolve();
          });
        });
      } else {
        this.afauth.auth.signInWithEmailAndPassword(this.budgeteerCredential.username, this.budgeteerCredential.password)
        .then((userCredential: firebase.auth.UserCredential) => {
          userCredential.user.getIdToken().then((token: string) => {
            this.makeBudgeteerCredential(userCredential, token);
            this.setCredsToStorage();
            resolve();
          });
        }).catch((error) => {
          console.log(error);
          reject(error);
        });
      }
    });
  }

  private makeBudgeteerCredential(userCredential: firebase.auth.UserCredential, token: string) {
    this.budgeteerCredential = {
      guid: userCredential.user.uid,
      token: token,
      refreshToken: userCredential.user.refreshToken,
      path: '/data/' + userCredential.user.uid,
      username: null,
      password: null
    } as BudgeteerCredential;
  }

  public getData(): Promise<DataDumpClass> {
    return new Promise<any>((resolve, reject) => {
      this.authenticate().then(() => {
        this.afs.object(this.budgeteerCredential.path).valueChanges().subscribe(item => {
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
        this.afs.object(this.budgeteerCredential.path).set(value)
            .then(_ => {
              // console.log('success');
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
