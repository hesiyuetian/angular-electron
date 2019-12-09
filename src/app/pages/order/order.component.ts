import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { PlatformLocation} from '@angular/common';
import { regular } from '../../common/util/regular';
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  routerLink: any = '';

  constructor(
    private router: Router,
    private regular: regular,
    private location: PlatformLocation,
    public translate: TranslateService,
  ) { 
    this.router.events.subscribe( (event) => {
      if(event instanceof NavigationEnd){
          this.routerLink = this.location.pathname;
      }
  })
  }

  ngOnInit() {
  }

  link(link){
    this.router.navigateByUrl(`/order/${link}`)
  }
}