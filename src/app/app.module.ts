import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

//Common
import {SharedModule} from './components/shared.module';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import zh from '@angular/common/locales/zh';

// 封装的API方法
import {service} from './common/util/service';
import {resetData} from './common/util/resetData';
import {secret} from './common/util/secret';
import {regular} from './common/util/regular';
import {User} from './common/util/user';
import {Utils} from './common/util/util';
import {Loadings} from './components/loadings/loadings';

import {AddInvedtorService} from './service/addInvedtor.service';

//公链
import {BtService} from './common/util/bt.service';

// translate server
export function createTranslateHttpLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

registerLocaleData(zh);

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: createTranslateHttpLoader,
                deps: [HttpClient]
            }
        }),
        BrowserModule,
        AppRoutingModule,
        SharedModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,

    ],
    entryComponents: [
        // DialogComponent
    ],
    providers: [
        service,
        regular,
        User,
        Utils,
        resetData,
        secret,
        Loadings,
        AddInvedtorService,
        BtService
    ],
    bootstrap: [AppComponent]
})

export class AppModule {
}
