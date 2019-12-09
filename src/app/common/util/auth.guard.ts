import { CanActivate } from "@angular/router";
import { User } from './user'
import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate{
    constructor(
        private user: User,
    ){

    }

    canActivate(): boolean{
        let loggedIn: boolean= !!this.user.token();
        if(!loggedIn){
            this.user.reload();
            return loggedIn
        }
        return loggedIn;
    }
}
