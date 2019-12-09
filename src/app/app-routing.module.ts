import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './common/util/auth.guard'
const routes: Routes = [
    {
        path: 'user',
        loadChildren: './pages/user/user.module#UserModule'
    },
    {
        path: 'order',
        loadChildren: './pages/order/order.module#OrderModule',
        canActivate: [AuthGuard]
    },
    {
        path: 'assets_records',
        loadChildren: './pages/assets/assets.module#AssetsModule',
        canActivate: [AuthGuard]
        // data: { preload: true }
    },
    {
        path: 'trade',
        loadChildren: './pages/trade/trade.module#TradeModule'
    },
    // {
    //     path: 'member',
    //     loadChildren: './pages/member/member.module#MemberModule',
    //     canActivate: [AuthGuard]
    // },
    {
        path: 'trade/:symbol',
        loadChildren: './pages/trade/trade.module#TradeModule'
    },
    {
        path: '',
        loadChildren: './pages/home/home.module#HomeModule'
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    declarations: [

    ],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule { }
