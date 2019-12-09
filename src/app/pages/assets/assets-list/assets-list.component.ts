import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { PlatformLocation} from '@angular/common';

import { regular } from '../../../common/util/regular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss']
})
export class AssetsListComponent implements OnInit {

    routerLink: any = '';
    
    constructor(
        private location: PlatformLocation,
        private router: Router,
        public regular: regular,
        public translate: TranslateService,
    ) { 
        this.router.events.subscribe( (event) => {
            if(event instanceof NavigationEnd){
                this.routerLink = this.location.pathname;
            }
        })
    }

    ngOnInit() {
        this.init();
    } 

    init(){
        // Promise.all([this.myAssets(),this.getAcountStatistics()])
        
    }

    link(val){
        this.router.navigateByUrl(`/assets_records/${val}`)
    }
}
