### 准备工作

#### 本教程将引导读者基于状态管理框架`react-control-center`来创建一个最简版(乞丐版？)的todo app，该app灵感来源自`wunderlist`，对其做了大量的简化并适当加入了我们自己想要的一些小功能，我们对不同路由对应的组件划分将如以下示意图所示
```
/cc/todo-list
```
![](https://user-gold-cdn.xitu.io/2019/2/14/168eb06d64c8de90?w=802&h=383&f=png&s=20100)
___
```
/cc/user-info-detail
```
![](https://user-gold-cdn.xitu.io/2019/2/14/168eb08745c42ae9?w=803&h=384&f=png&s=18038)
___
```
/cc/todo-stats-detail
```
![](https://user-gold-cdn.xitu.io/2019/2/14/168eb2ba76c7fcc6?w=806&h=393&f=png&s=18011)
* `<Menu />`代表菜单，是todoList分类目录入口，用户可以在菜单里创建不同的目录，让用户可以按照自己的需求把不同的todoItem放置到不同的todoList里。
* `<UserInfo />`代表用户信息。
* `<UserInfoDetail />`代表用户信息详情。
* `<TodoList />`代表待办事项清单。
* `<TodoStats />`代表待办事项清单汇总统计数据。
* `<TodoStatsDetail />`代表待办事项清单汇总统计数据详情。

#### 我们会使用到以下js库来协助我们完成这个todo app
* `react (v16+)`，专注于构建UI
* `react-router (v4)`，用于声明并管理路由和组件的映射关系
* `react-control-center`，用于管理react智能组件的状态、优雅的将UI渲染和业务逻辑分离、以及简单并高效的实现组件间通信
* `ant-design`，一套蚂蚁金服开源的react组件库  
* `express (v4)`，web服务框架，对前端暴露api，本示例会对express做适量的封装，以便更友好的使用async/await做业务逻辑处理，因本文重点介绍前端，所以后端的代码结构设计将一笔带过，感兴趣的朋友可以在git上查看。
* `json-server`，模拟数据库服务，真实环境用户根据根据自己的喜好选择诸如mongodb、postgresql等数据库
___  

### 功能描述
#### 左侧菜单栏`<Menu />`拥有自己的`store`, 命名为`Menu`,菜单栏拥有以下功能
* 拥有一个默认空间，该空间**不可以删除**
* 创建新的空间
* 对指定空间可以创建新的待办项归属目录
* 删除待办项归属目录，删除时如果该目录下有待办项，用户可以有**3种选择**
> 1，一并删除，目间下的所有未完成和已完成都会删除  
> 2，暂时移动至默认空间的某个目录下，目录的命名就是删除的时间，过后再整理  
> 3，选择移动至其他空间的某个目录下  
* 左键单击目录，右侧`<TodoList />`渲染该目录下已有的待办项
* 鼠标悬浮在某个目录上，可以展示目录备注
* 右键单击目录，出现菜单修改备注，点击修改备注可以修改该目录的备注

#### 右侧顶部的`<UserInfo />`和`<UserInfoDetail />`的状态都指向同一个`store`,我们将其命名为`User`，`<UserInfo />`展示用户的简要信息，`<UserInfoDetail />`展示用户的详细信息
* `<UserInfo />`拥有以下功能
> 1，登出  
> 2, 打开设置面板，调整主题色  
* `<UserInfoDetail />`拥有以下功能  
> 修改用户昵称和登录密码

#### 右侧中间的`<TodoList />`的`store`我们将其命名为`Todo`，拥有以下功能
* 默认展示未完成待办项，隐藏已完成待办项
* 添加新的未完成待办项，一次可以添加多个，每一个初始都处于编辑状态
* 对未完成待办项的内容可以输入文字，打标签、选择截止日期、标记重要程度（共3种： 非常重要、一般、不重要，默认一般），点击右侧可以保存
* 可以编辑已有的未完成待办项的内容、截止日期、标签、重要程度
* 可以对已有的未完成待办项点击标记已完成
* 可以对已有的未完成待办项打标签
* 点击显示已完成待办项，从右侧抽出已完成待办项列表
* 已完成待办项列表里的项目可以点击变为未完成

#### 右侧底部的`<TodoStats />`和`<TodoStatsDetail />`的`store`都指向`TodoStats`，
* `<TodoStats />`拥有以下功能
> 展示用户今天内已创建了几个未完成待办项  
> 展示用户今天内已标记了几个未完成待办项为已完成  
* `<TodoStatsDetail />`拥有以下功能
> 展示用户一共拥有几个空间；  
> 展示用户一共拥有几个目录；   
> 展示用户一共拥有几个未完成待办项，未完成里有几个重要的，几个一般的，几个不重要的；   
> 展示用户将要在24时内到期的未完成待办项有几个；  
> 展示用户将要在本周内到期的未完成待办项有几个；  
> 展示用户将要在本月内到期的未完成待办项有几个；  
> 展示用户一共拥有几个已完成待办项；

### 后端数据库设计
#### 基于`json-sever`模拟提供数据CURD服务，初始的时候会放置一份默认的数据再`db.json`文件中,设计的表如下图所示
![](https://user-gold-cdn.xitu.io/2019/2/16/168f65c588ef03ef?w=914&h=317&f=png&s=43535)
* `user-info`存储用户信息
* `user-personal-setting`存储用户的一些个性化设置信息
* `namespace`存储用户拥有的空间信息
* `directory`存储空间对应的目录信息
* `todo-item`存储目录下的待办项
* `cfg-tag`存储标签元数据信息
* `next-usable-id`用户辅助后端插入新的数据时赋值id，因为我们用`json-server`模拟数据库，让用户能够简单的通过npm i把整个实例跑起来而不需要真正的安装数据库服务，所以这里用这张表来维护id的生成
* `config-data-version`记录各种配置数据的版本号，目前只有tag一种，所以只有tag一个字段，当用户输入新的tag时，后端隐式的插入新的tag，并升级tag元数据的版本号，前后端api通信时所有的请求的header会带上当前时刻前端拿到的配置数据的版本号，后端处理完业务逻辑后，在把结果返回给前端之前，会对比header里的tag配置数据版本号，如果后端记录的版本号比当前用户传递的高，就悄悄的把最新的tag配置数据和tag版本数据附加在responseBody里的config和version字段上，前端收到接口返回后，在把数据传给上层业务逻辑消费前，先检查config字段是否为空，如果不为空，则先把最新的config和版本号设置到store的`$$global`模块里，然后在把responseBody的data返回给上层业务消费

### 关于状态的修改
#### 我们知道，cc拥有很多种非常弹性和灵活的修改状态的方式，它们都能达到触发观察同一个模块的所有的不同组件渲染新的视图，我们这里只考虑其中最最常用的用户会使用的3种方式：setState、dispatch、effect
#### 为了简要说明3种方式的调用区别，我们这里先假设有一个模块`counter`的store设计如下
```
// code in model/counter/state.js
export default {
    countValue: 0,
    incOrDecCount:0,
}
```
#### 假设我们的入口文件渲染3个`<Counter />`,以观察多个组件共同观察一个模块时其中一个组件修改状态对其他组件造成的影响
```
// code in app.js
import Counter from './component/counter';
class App extends Component{
    render(){
        return (
            <div>
                <Counter ccKey="c1" />
                <Counter ccKey="c2" />
                <Counter ccKey="c3" />
            </div>
        );
    }
}
```
>1 基于原始的setState  
```
// code in component/counter.js
@cc.register('Counter', {module:'counter', sharedStateKeys:'*'})
class Demo extends Component{
    constructor(props, context){
        super(props, context);
    }
    inc = ()=>{
        const {countValue, incOrDecCount} = this.state;
        this.setState({countValue:countValue+1, incOrDecCount:incOrDecCount+1});
    }
    dec = ()=>{
        const {countValue, incOrDecCount} = this.state;
        this.setState({countValue:countValue-1, incOrDecCount:incOrDecCount+1});
    }
    render(){
        return (
            <div>
                <h3>countValue: {this.state.countValue}</h3>
                <h3>incOrDecCount: {this.state.incOrDecCount}</h3>
                <button onClick={this.inc}>inc</button>
                <button onClick={this.dec}>dec</button>
            <div>
        );    
    }
}
```
>2 基于dispatch，调用reducer里定义的函数  
```
// code in component/counter.js
@cc.register('Counter', {module:'counter', sharedStateKeys:'*'})
class Demo extends Component{
    constructor(props, context){
        super(props, context);
    }
    inc = ()=>{
        this.$$dispatch({type:'inc'});
    }
    dec = ()=>{
        this.$$dispatch({type:'dec'});
    }
    render(){
        return (
            <div>
                <h3>countValue: {this.state.countValue}</h3>
                <h3>incOrDecCount: {this.state.incOrDecCount}</h3>
                <button onClick={this.inc}>inc</button>
                <button onClick={this.dec}>dec</button>
            <div>
        );    
    }
}

//code in model/counter/reducer.js
function inc({moduleState}){
    const {countValue, incOrDecCount} = moduleState;
    return {countValue: countValue+1, incOrDecCount:incOrDecCount+1}
}

function dec({moduleState}){
    const {countValue, incOrDecCount} = moduleState;
    return {countValue: countValue-1, incOrDecCount:incOrDecCount+1}
}

export default {
    inc,
    dec
}
```
实际上如果调用dispatch只是传递type参数找到对应的reducer，可以基于domDispatch去触发reducer，只需要在dom上声明data-cct、data-ccm、data-ccrm属性让cc知道怎么定位寻找到reducer就可以了，这里我们的reducer命名和module一样所以可以省略data-ccrm，修改的目标module就是当前组件所属的module所以可以省略data-ccm,代码示例如下
```
// code in component/counter.js
@cc.register('Counter', {module:'counter', sharedStateKeys:'*'})
class Demo extends Component{
    constructor(props, context){
        super(props, context);
    }
    render(){
        return (
            <div>
                <h3>countValue: {this.state.countValue}</h3>
                <h3>incOrDecCount: {this.state.incOrDecCount}</h3>
                <button data-cct="inc" data-foo="foo" onClick={this.$$domDispatch}>inc</button>
                <button data-cct="dec" data-bar="bar" onClick={this.$$domDispatch}>dec</button>
            <div>
        );    
    }
}

//code in model/counter/reducer.js
function inc({moduleState, payload}){// payload may like: {event, dataset, value}
    const {dataset:{foo}} = payload;// console.log(foo) ===> 'foo'
    const {countValue, incOrDecCount} = moduleState;
    return {countValue: countValue+1, incOrDecCount:incOrDecCount+1}
}

//reducer 函数可以为普通函数，也可以为async或者generator，参数对象里可以结构出dispatch，去触发其他模块修改状态
async function dec({moduleState, payload, dispatch}){
    const {countValue, incOrDecCount} = moduleState;
    await dispatch({module:'global', type:'doSomeOtherStaff', payload:'wow!!!'});
    return {countValue: countValue-1, incOrDecCount:incOrDecCount+1}
}

export default {
    inc,
    dec
}
```

>3 基于effect, 直接调用用户定义的函数
```
// code in component/counter.js
import cc from 'react-control-center';

function inc(state){
    const {countValue, incOrDecCount} = state;
    return {countValue: countValue+1, incOrDecCount:incOrDecCount+1};
}

function incForXeffect({moduleState}, foo, bar){
    //console.log(foo, bar); ===> 'foo' 'bar'
    const {countValue, incOrDecCount} = moduleState;
    return {countValue: countValue+1, incOrDecCount:incOrDecCount+1};
}

async function dec(state){
    const {countValue, incOrDecCount} = state;
    cc.dispatch({module:'global', type:'doSomeOtherStaff', payload:'wow!!!'});
    return {countValue: countValue-1, incOrDecCount:incOrDecCount+1}
}

@cc.register('Counter', {module:'counter', sharedStateKeys:'*'})
class Demo extends Component{
    constructor(props, context){
        super(props, context);
    }
    inc = ()=>{
        this.$$effect('counter', inc, this.state);
        //$$xeffect会占用用户定义的函数的第一位参数为ExecuteObject对象，里面可以解构出一些上下文属性，后面的参数才是用户真正要传递的参数
        //this.$$xeffect('counter', incForXeffect, 'foo', 'bar');
    }
    dec = ()=>{
        this.$$effect('counter', dec, this.state);
    }
    render(){
        return (
            <div>
                <h3>countValue: {this.state.countValue}</h3>
                <h3>incOrDecCount: {this.state.incOrDecCount}</h3>
                <button onClick={this.inc}>inc</button>
                <button onClick={this.dec}>dec</button>
            <div>
        );    
    }
}
```
这里简单的穿插着介绍了三种修改状态的方式，更多细节参见[我为cc专门写的入门引导工程](https://github.com/fantasticsoul/rcc-simple-demo)，api文档不久会进一步完善，相信cc非常简单的api设计一定能够让你快速上手此引导工程

### 前端store设计
#### 上面的组件划分时，已经规划好相应的store的模块名字：`User`、`Menu`、`Todo`、`TodoStats`,我们汲取`ant-design-pro`里dva框架对状态的划分理念，为了保持跟进社区大家总结的最佳实践，这里对整个todo app的文件组织结构会和`ant-design-pro`保持高度一致，所以我们最终采用基于`dispatch`的方式去修改状态