import { Component, OnInit, ElementRef, Renderer2, Input, SimpleChanges } from '@angular/core';

import { User } from '../../common/util/user'
import { SkinServiceService } from '../../service/skin-service.service'
@Component({
	selector: 'app-slide',
	templateUrl: './slide.component.html',
	styleUrls: ['./slide.component.scss']
})
export class SlideComponent implements OnInit {
	@Input() rol: any;
	@Input() type: any = 'cpu'
	@Input() anima: any
	public theme: string = this.user.getItem('theme');
	public routerLink: string;
	constructor(
		public user: User,
		public skin: SkinServiceService,
		private el: ElementRef,
		private renderer2: Renderer2
	) {
		this.skin.getObservable().subscribe( res => {
			this.theme = res;
            this.init();
		})
	}

	ngOnInit() {
		this.init()
	}

	ngOnChanges(changes: SimpleChanges) {
		if(changes.anima && changes.anima.currentValue === true) this.init();
	}

	init() {
		let canvas: any = this.el.nativeElement.querySelector('.canv');
		if (!!!this.rol) this.rol = 0
		this.drawMain(canvas, this.rol, "#0051FD", "#F3F3F5")
	}

	drawMain(drawing_elem, percent, forecolor, bgcolor) {
		console.log()
		/*
			@drawing_elem: 绘制对象
			@percent：绘制圆环百分比, 范围[0, 100]
			@forecolor: 绘制圆环的前景色，颜色代码
			@bgcolor: 绘制圆环的背景色，颜色代码
		*/
		var context = drawing_elem.getContext("2d");
		var center_x = drawing_elem.width / 2;
		var center_y = drawing_elem.height / 2;
		var rad = Math.PI * 2 / 100;
		var speed = 0;

		var self = this;

        /**
         * 绘制背景圆圈
         */
		function backgroundCircle() {
			context.save();
			context.beginPath();
			context.lineWidth = 20; //设置线宽
			var radius = center_x - context.lineWidth;
			context.lineCap = "round";
			context.strokeStyle = self.theme === 'Dark' ? "#272F43" : "#F3F4F5";
			context.arc(center_x, center_y, radius, 0, Math.PI * 2, false);
			context.stroke();
			context.closePath();
			context.restore();
		}

        /**
         * 绘制运动圆环
         * @param n
         */
		function foregroundCircle(n) {

			let x1 = 100 + 80 * Math.cos(self.rol / 100 * 360 * 3.14 / 180)
			let y1 = 100 + 80 * Math.sin(self.rol / 100 * 360 * 3.14 / 180)
			// x0  y0 --->中心点   angle 角度

			// 创建渐变
			var gradient: any;
			gradient = context.createLinearGradient(0, 0, x1, y1);
			gradient.addColorStop("0", "#4181FF");

			if (self.type === 'cpu') gradient.addColorStop("1.0", "#00C3B3");
			else if (self.type === 'net') gradient.addColorStop("1.0", "#7018FF");
			else gradient.addColorStop("1.0", "#FF6F79");

			context.save();
			// context.strokeStyle = forecolor;
			context.strokeStyle = gradient;
			context.lineWidth = 20;
			context.lineCap = "round";
			var radius = center_x - context.lineWidth;
			context.beginPath();
			context.arc(center_x, center_y, radius, -Math.PI / 2, -Math.PI / 2 + n * rad, false); //用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
			context.stroke();
			context.closePath();
			context.restore();
		}

        /**
         * 绘制文字
         * @param n
         */
		function text(n) {
			context.save(); //save和restore可以保证样式属性只运用于该段canvas元素
			context.fillStyle = self.theme === 'Dark' ? 'white' : 'black';
			var font_size = 30;
			context.font = font_size + "px Helvetica";
			var text_width = context.measureText(n.toFixed(0) + "%").width;
			context.textAlign = 'center';
			let font = n > self.rol ? self.rol : n;
			context.fillText(font.toFixed(2) + "%", 100, 130);
			context.restore();
		}

        /**
         * 执行动画
         */
		(function drawFrame() {
			let time = window.requestAnimationFrame(drawFrame);
			context.clearRect(0, 0, drawing_elem.width, drawing_elem.height);
			backgroundCircle();
			text(speed);
			foregroundCircle(speed);
			if (speed >= percent) return cancelAnimationFrame(percent) ;
			speed += 3;
		}());
	}

}

