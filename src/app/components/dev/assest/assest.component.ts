import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-assest',
  templateUrl: './assest.component.html',
  styleUrls: ['./assest.component.scss']
})
export class AssestComponent implements OnInit {
  @Input() config;
  @Input() onDialogClose: Function;
  constructor() { }

  ngOnInit() {
  }

}
