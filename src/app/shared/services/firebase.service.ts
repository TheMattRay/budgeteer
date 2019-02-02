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

  constructor(
      public afs: AngularFireDatabase,
      private afauth: AngularFireAuth
  ) {
  }

  private authenticate(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.afauth.auth.signInAnonymously().then((userCredential: firebase.auth.UserCredential) => {
        this.guid = userCredential.user.uid;
        userCredential.user.getIdToken().then((token: string) => {
          this.token = token;
          this.path = '/data/' + this.guid;
          this.rootReference = this.afs.database.ref(this.path);
          resolve();
        });
      });
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
