import {Component, OnInit, Input, ElementRef, Renderer2, Output, EventEmitter, OnDestroy} from '@angular/core';
import { SelectInterface, CountryInterface } from '../../interface/select.interface'
import { TranslateService } from '@ngx-translate/core';
import { SkinServiceService } from '../../service/skin-service.service'
import { User } from '../../common/util/user'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import {Subscription} from 'rxjs';
@Component({
	selector: 'app-april-sear-select',
	templateUrl: './april-sear-select.component.html',
	styleUrls: ['./april-sear-select.component.scss']
})
export class AprilSearSelectComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
	//控制输入框是否可输入
	@Input() entered: boolean;
	//默认展示内容
	@Input() defaultt: string;

	public setLang: any;
	public dis: boolean = false;
	@Input() height: number = 32;
	public placeholder: any;
	@Input() defaultset: any;
	@Input() list = [];
	// list = [
	//   {zhName: '中文',enName: '英文'}
	// ]

	@Output('change') checkedBack = new EventEmitter();
	@Output('requer') requer = new EventEmitter();

	public key: any;
	public time: any;

	// zh   en
	public language: string = this.user.getItem('language');
	constructor(
		public translate: TranslateService,
		public user: User,
		public skin: SkinServiceService,
		private el: ElementRef,
		private renderer2: Renderer2
	) {
		document.addEventListener("click", _ => {
			this.dis = false;
			this.key = '';
		})
	}

	ngOnInit() {
	    this.subThemeServe();
		this.init()
	}

	ngOnDestroy(): void {
	    this.subServe.unsubscribe()
    }

    /**
     * 订阅lang服务
     */
    subThemeServe(): void{
        this.subServe.add(this.skin.getLangObservable().subscribe(res => {
            this.language = res;
            this.filter();
            this.defaultValue();
        }))
    }

    init() {
		setTimeout(_ => {
			this.filter();
		}, 2000);
		this.defaultValue();
	}

	//初始化默认值
	defaultValue() {
		setTimeout(() => {
			if (this.defaultt) {
				this.placeholder = this.defaultt;
				// this.placeholderColor = '';
			} else {
				this.placeholder = '请选择';
			}
		}, 200);

		// if(this.defaultt){
		//     this.placeholder = this.defaultt;
		//     this.placeholderColor = '';
		// }else{
		//     setTimeout(()=>{
		//         this.placeholder = '请选择';
		//     },200)
		// }
	}
	foucr() {
		this.dis = true;
		this.checkedBack.emit(this.key);
	}
	filter() {
		let item = this.list;
		for (let i in item) {
			if (this.defaultset) {
				if (item[i].code == this.defaultset)
					return this.setLang = this.language == 'en' ? item[i].enName : item[i].zhName
			}
			// else
			//   return this.setLang = item[i].name, this.defaultset = item[i].val ;
		}
	}
	sel(val, e) {
		// event.stopPropagation();
		// this.el.nativeElement.querySelector('.select-box').blur();
		this.dis = false;
		this.key = '';
		this.defaultset = val.code;
		this.filter();
		this.requer.emit(val)
	}

	/**
	 * 模糊查询(防抖)
	 */
	getData() {
		console.log(this.key.toUpperCase(), 'key')
		// clearTimeout(this.time);
		// this.time = setTimeout(_ => {
		//   this.checkedBack.emit(this.key)
		// }, 400);
	}

	setSetLang() {
		if (this.entered) {
			this.setLang = this.key;
			let v = {
				code: '',
				zhName: this.key,
				enName: ''
			}
			this.requer.emit(v);
		}

	}
}


