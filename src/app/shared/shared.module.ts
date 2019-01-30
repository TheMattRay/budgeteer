import {ModuleWithProviders, NgModule} from '@angular/core';
import {FirebaseService} from './services/firebase.service';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from '@angular/fire/database';
import {environment} from '../../environments/environment';
import {CalculatorService} from './services/calculator.service';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(environment.firebase, 'my-app'),
        AngularFireDatabaseModule,
        AngularFireAuthModule
    ],
    declarations: [
    ],
    exports: [
    ],
})
export class SharedModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: SharedModule,
            providers: [
                AngularFireDatabase,
                AngularFireAuth,
                FirebaseService,
                CalculatorService
            ]
        };
    }
}
