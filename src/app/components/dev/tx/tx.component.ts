import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-tx',
  templateUrl: './tx.component.html',
  styleUrls: ['./tx.component.scss']
})
export class TxComponent implements OnInit {
  @Input() config;
  @Input() onDialogClose: Function;
  constructor() { }

  ngOnInit() {
  }

  toWrap(word){
    if(!word) return '';
    return `${word[0]},
            ${word[1]},
            ${word[2]},
            ${word[3]},
            ${word[4]},
            ${word[5]},
            ${word[6]},
            ${word[7]}
            ${word[8]}
            ${word[9]}`
  }

}
