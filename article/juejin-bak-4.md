目录回顾
* [启动cc](https://juejin.im/post/5c3ee445f265da6126386416)
___
## 今天我们将通过此文告诉cc用户，除了`startup`,cc也提供`configure`来配置模块相关信息哦^_^ 

### 启动时配置模块
#### 通过[启动cc](https://juejin.im/post/5c3ee445f265da6126386416)我们知道，可以在`startup`时将模块的`store`、`reducer`、`computed`、`init`一次性配置好
#### 如下例子，我们定义两个模块`login`、`product`，以及重写cc的内置模块`$$global`
* `login`模块相关代码
```
// code in models/login/index.js
import reducer from './reducer';
import state from './state';
import init from './init';
export default {reducer, state, init}
```
```
// code in models/login/state.js
export default {
    loading:false,
    onlineCount:0,
    failReason:'',
    uid:0,
    username:'',
    role:'',
}
```
```
// code in models/login/reducer.js
import api from 'service/user';
function changeLoading(loading){
    return {loading}
}
async function loginWithPassword({payload:{username,password}, dispatch}){
    await dispatch('login/changeLoading', true);
    // 等价于写  await dispatch({module:'login', type:'changeLoading', payload:true});
    // 备注，如果这里确定来来自于login模块的组件实例调用的this.$$dispatch('updatePassword',{uid,password})
    // 这里还可以简写为dispatch('changeLoading', true)，因为此dispatch句柄默认是去改变的模块就是触发该updatePassword函数的$$dispatch调用实例所属的模块
    
    const {success, message, data} = await api.loginWithPassword(username,password);
    if(success){
        const {uid, username, role, customizedBorderColor} = data;
        //派发到$$global模块修改相应的状态
        dispatch('$$global/changeBorderColor', customizedBorderColor);
        return {loading:false, uid, username, role};
    }else return {loading:false, failReason:message};
}
async function updatePassword({payload:{uid,password}, dispatch}){
    await dispatch('login/changeLoading', true);
    const {success, message, data} = await api.updatePassword(uid,password);
    if(success) return {loading:true};
    else return {loading:false, failReason:message};
}
export default {
    changeLoading,
    loginWithPassword,
    updatePassword,
}
```
```
//code in models/login/init.js
import api from 'service/userApi';
export default setState=>{
    api.getOnlineCount().then(onlineCount=>{
        setState({onlineCount});
    });
}
```
* `product`模块相关代码
```
// code in models/product/index.js
import reducer from './reducer';
import state from './state';
export default {reducer, state}
```
```
// code in models/product/state.js
export default {
    loading:false,
    pageSize:10,
    currentPage:0,
    totalPage:0,
    totalCount:0,
    productList:[],
}
```
```
// code in models/product/reducer.js
import api from 'service/product';
import cc from 'react-control-center';
function changeLoading(loading){
    return {loading}
}
async function _fetchProduct(currentPage, pageSize){
    const {list:productList, totalCount} = await api.fetchProduct(currentPage, pageSize);
    const totalPage = Math.ceil(totalCount/pageSize);
    return {productList, totalCount, totalPage};
}
async function nextPage({dispatch, moduleState}){
    await dispatch('changeLoading', true);
    const {currentPage, pageSize} = moduleState;
    const nextPage = currentPage+1;
    const {productList, totalCount, totalPage} = await _fetchProduct(nextPage, pageSize);
    return {loading:false, productList, totalCount, totalPage, currentPage:nextPage};
}
async function prevPage({dispatch, moduleState}){
    await dispatch('changeLoading', true);
    const {currentPage, pageSize} = moduleState;
    const nextPage = currentPage-1;
    const {productList, totalCount, totalPage} = await _fetchProduct(nextPage, pageSize);
    return {loading:false, productList, totalCount, totalPage, currentPage:nextPage};
}
async function changePageSize({dispatch, moduleState, payload:pageSize}){
    await dispatch('changeLoading', true);
    const {currentPage} = moduleState;
    const {productList, totalCount, totalPage} = await _fetchProduct(currentPage, pageSize);
    return {loading:false, productList, totalCount, totalPage, pageSize};
}
async function refreshCurrentPage({dispatch, moduleState}){
    await dispatch('changeLoading', true);
    const {currentPage, pageSize} = moduleState;
    const {productList, totalCount, totalPage} = await _fetchProduct(currentPage, pageSize);
    return {loading:false, productList, totalCount, totalPage};
}
//上传统计用户的刷新行为，因为该函数不返回任何新的state，将不触发cc组件实例的渲染
function uploadRefreshBehavior(){
    const loginModuleState = cc.getState('login');
    const {uid} = loginModuleState
    api.uploadRefreshBehavior({uid, action:'refreshCurrentPage'});
}
//cc并不强制要求每一个reducer函数都返回一个新的片断state，该方法通过dispatch组合了另外两个reducer函数
function refreshCurrentPageAndTrack({dispatch}){
    dispatch('refreshCurrentPage');
    dispatch('uploadRefreshBehavior');
}
export default {
    changeLoading,
    nextPage,
    prevPage,
    changePageSize,
    refreshCurrentPage,
    uploadRefreshBehavior,
    refreshCurrentPageAndTrack,
}
```
* `$$global`模块相关代码
```
// code in models/global/index.js
import reducer from './reducer';
import state from './state';
import computed from './computed';
export default {reducer, state, computed}
```
```
// code in models/global/state.js
export default {
    customizedBorderColor:'#FFFFFF',
}
```
```
// code in models/global/reducer.js
function changeBorderColor({payload:customizedBorderColor}){
    return {customizedBorderColor};
}
```
```
//code in models/global/computed.js
export default {
    customizedBorderColor(customizedBorderColor){
        return `1px solid ${customizedBorderColor}`;
    }
}
```
#### 将他们配置到cc的`StartUpOption`里
```
// code in startup-cc.js
import loginModel from 'models/login';
import productModel from 'models/product';
import globalModel from 'models/global';
import cc from 'react-control-center';

function myMiddle1(executionCotext, next){
    console.log(executionCotext);
    // here write your code
    next();
}
function myMiddle2(executionCotext, next){
    console.log(executionCotext);
    // here write your code
    next();
}

const models = [
    {module:'login',model:loginModel},
    {module:'product',model:productModel},
    {module:'$$global',model:globalModel},
];

const store={}, reducer={}, init={}, computed={};
models.forEach(item=>{
    const {module, model:{state, reducer:_reducer, init:_init, computed:_computed}} = item;
    if(state)store[module]=state;
    if(_reducer)reducer[module]=_reducer;
    if(_init)init[module]=_init;
    if(_computed)computed[module]=_computed;
});

cc.startup({
    isModuleMode:true,
    store,
    reducer,
    init,
    computed,
    // 注意，此处配置了中间件函数，任何cc实例触发了改变state的行为，
    // cc都会前调用中间件函数链然后才开始改变state, 为第三方编写插件预留了可操作入口，例如计划中的rcc-state-changging-logger
    middlewares:[myMiddle1, myMiddle2]
});
```

### 动态配置模块
#### cc同样支持在startup之后，通过cc.configure动态的添加新的模块(注意，此方法一定要在startup后调用哦)，以上代码可以改造为
```
// code in startup-cc.js
import cc from 'react-control-center';
function myMiddle1(executionCotext, next){
    console.log(executionCotext);
    // here write your code
    next();
}
function myMiddle2(executionCotext, next){
    console.log(executionCotext);
    // here write your code
    next();
}
cc.startup({
    isModuleMode:true,
    middlewares:[myMiddle1, myMiddle2]
});
```
```
// code in configure-cc.js
import loginModel from 'models/login';
import productModel from 'models/product';
import globalModel from 'models/global';
import cc from 'react-control-center';

const models = [
    {module:'login',model:loginModel},
    {module:'product',model:productModel},
    {module:'$$global',model:globalModel},
];

const store={}, reducer={}, init={}, computed={};
models.forEach(item=>{
    const {module, model:{state, reducer:_reducer, init:_init, computed:_computed}} = item;
    const option = {};
    if(_reducer)option.moduleReducer = _reducer;
    if(_init)option.init=_init;
    if(_computed)option.computed=_computed;
    cc.configure(module, state, option);
});
```
```
//code in App.js
import 'startup-cc.js';//注意此处一定是先引入startup-cc.js
import 'configure-cc.js';
```
### `cc.configure`同样也可以不需要在一处文件里集中式的调用，这样方便用户按照自己的习惯和理解来组织代码
* 此时用户的文件结构可能如下
```
|________components
|     |________Login
|     |     |________model
|     |     |     |________state.js
|     |     |     |________reducer.js
|     |     |     |________init.js
|     |     |     |________index.js
|     |     |________index.js
```
* `components/Login/model/index.js`里负责完成`cc.configure`的调用
```
import moduleReducer from './reducer';
import state from './state';
import init from './init';
import cc from 'react-control-center';
cc.configure('login', state, {moduleReducer, init});
```
* `components/Login/index.js`里引用`components/Login/model`,触发cc动态加载login模块
```
// code in components/Login/index.js
import React from 'react';
import cc from 'react-control-center';
import './model';

@cc.register('Login',{module:'login', sharedStateKeys:'*'});
export default class Login extends React.Component{
    //......
}
```

### 总结，cc弹性的设计cc.configure方便用户灵活和组织代码和配置模块，同时也方便用户开发自己的cc组件发布到npm，这样其他用户引用你的组件时，不需要勾出你的`state`、`init`、`computed`等属性配置在`StartUpOption`里

___
附:[cc化的ant-design-pro里的models替换](https://github.com/fantasticsoul/rcc-antd-pro/tree/master/src/models-cc)