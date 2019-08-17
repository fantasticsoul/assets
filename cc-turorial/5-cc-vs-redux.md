### 没有对比就没有伤害，`react-control-center` vs `redux`
以下会把`react-control-center` 简称为`cc`哦
对比项/项目 | redux | react-control-center | 结果
-------- | --- | ---| ---
git start | 43k | 43 | 没错，少了一个k，彻底完败
开源时间 | 2015年 | 2018年12月 | 早出生4年
作者 | Dan Abramov | 无名小辈 | 惨无人道的完败
架构实现 | flux | flux | 平手
插件生态 | redux-dev-tool等 | 无，未来提供 | cc需要时间追赶？
中间件机制| 提供 | 提供 | 平手
可对接的UI框架| react、vue、angular或其他 | 专注于react | redux可以用他的基础库桥接其他UI框架，cc仅仅专注于react，此项无结果
代码组织| 严格按照action、reducer的思路写出很多模板代码，所以无数redux wrapper出来了，让你更优雅的写redux，写副作用 | 天生内置一系列强悍的技术api，reducer和action合为一体，甚至你都不需要感知到reducer的存在 | 不做评论，请各位看官看完在下结论

各位看官看到这里，肯定感慨良多，如果借用三体里的比喻，`cc`是地球文明的话，`redux`就是三体文明，或者再提升到哥者文明.......   
简直就是托马斯回旋翻滚360度转体720度然后脸部着地的完败，但？真的是这样吗，还请你此刻不要把鼠标挪到关闭按钮上，先把下文读完，看看`cc`用什么来挑战`redux`,甚至整个`redux`家族。
___
### 回顾下，`redux`给予了我们什么
#### 一个全局统一的状态树
`redux`内部维护着一个`big object`，官方称之为`state tree`或者`store`，这一棵参天大树携带的数据作为整个单页面应用的数据源，利用内置的中间件功能，结合提供的`redux-dev-tool`以及`immutableJs`提供的数据不可变特性，每次修改数据都会生成一个新的`state`记录在`redux-dev-tool`里，让我们在开发模式下实现了状态可追溯。
#### 规范的数据修改方式
`redux`世界里约束了我们一定要通过派发一个`action`对象去修改`state`,生成`action`的函数称之为`actionCreateor`,修改`state`的函数称为`reducer`。
>题外话，关于`reducer`为什么称为`reducer`,我们引用下官网的原话：  
>It's called a reducer because it's the type of function you would pass to Array.prototype.reduce(reducer, ?initialValue)  
>翻译出来大概就是：之所以将函数叫为reducer，是因为这种函数与被传入 Array.prototype.reduce(reducer, ?initialValue)里的回调函数`reducer`属于相同的类型。  

所以不管命名怎样，我们已经达成了共识，`action`就是一个用`type`描述要使用什么`reducer`函数以及用`payload`描述传递什么数据给`reducer`函数的普通`json`对象，`reducer`函数负责把最新的状态传递给`store`,`store`负责把发生了变化的状态下发到各个关心这些变化的子组件上。  
整理一下，三大核心概念`action`、`reducer`、`store`,会有如下关系
```
action (type,paylaod)
  |______reducer(new state)
            |______store
                     |______render UI
```
### `cc`给予了我们什么
#### 一个模块化的的单一状态树
`cc`一开始就推荐用户按模块切分自己的状态，然后启动时将这些模块话的`state`交给`cc`,`cc`将它们合并出一个单一的状态树，当然针对这一点很多`redux wrapper`也做了改进，如`dva`提供了`namespace`让你的转态拥有自己的命名空间。 

#### 更灵活的修改数据的api
注册到`cc`里`cc class`，如果你仅仅像传统的方式一样使用`setState`去改变数据来驱动视图渲染，那么看起来和普通`react class`真的是没有什么不同之处的，但是`cc class`自生上下文携带了几个很重要的信息，即`module`表示属于哪个模块,`sharedStateKeys`表示共享这个模块的哪些`key`的状态，既然是共享，就意味着当前`cc实例`改变了这个`key`的值，`cc`会把它广播到其他同样属于这个模块并共享这个`key`的`cc class`的实例，当然了，其他`cc实例`改变了这个`key`的值也会广播到当前实例并触发其渲染，`cc`内核的工作流程大致如下图所示：

![](https://user-gold-cdn.xitu.io/2019/3/10/16965e5dec6b197e?w=1672&h=1024&f=png&s=205701)
可以看到此种模式下，`cc`彻底解决了`redux`里几个问题
* `action`命名膨胀，`redux`里提倡的`reducer`是纯函数，每次返回的一定是一个全新的`state`,因为`redux`需要只是利用浅比较的方式知道状态有没有发生变化，所以我们通常会看到如下代码
```
// code in counter-actions.js
export function inc(){
    return {type:'INC_COUNT'}
}
export function dec(){
    return {type:'INC_COUNT'}
}

// code in counter-reducer.js
export default function reducer(initState, action){
    const {type, payload} = action;
    switch(type){
        case 'INC_COUNT':
            return {...state, count:initState.count+1};
        case 'DEC_COUNT':
            return {...state, count:initState.count-1};
        default:
            return initState;
    }
}
```
`cc`是接管了`react`最原始的`setState`函数做扩展，就像`react.setState(partialState, callback)`描述的一样，所以对于`cc`来说，真的只需要一个片段`state`就够了，`cc`通过分析用户提交的`partialState`,足以知道用户的此次操作改变了哪些状态，所以我们的`Counter`可以写为
```
//也可以简写为@cc.r('Counter',{m:'counter', s:'*'})
@cc.register('Counter',{module:'counter', sharedStateKeys:'*'})
class Counter extends Component{
    inc = ()=> { this.setState({count:this.state+1}) }
    dec = ()=> { this.setState({count:this.state-1}) }
    render(){
        const {count} = this.state;
        return (
            <div>
                <button onClick={this.inc}>inc</button>
                <button>dec</button>
                {count}
            </div>
        );
    }
}
```
如果你的App实例化了多个`Counter`,他们将共享`count`值
```
render(){
    return (
        <div>
            <Counter />
            <Counter />
            <Counter />
        </div>
    );
}
```
实际上你可能发现一个问题，`redux`严格约定的`action type`可以用来追溯是什么动作改变了`state`啊！可是真的想想，仅靠`action type`能够知道什么动作改变了`state`就够了吗？在一个大型的负责项目里，通常你是需要知道具体到那个UI改变了状态，但是你会发现有很多UI都会派发同一个`action type`,这要怎么追，为每一个动作都命名一个不一样的`action type`但是其实操作的数据和修改的动作是一摸一样的?   
在`cc`里你只要为组件标记一个`ccKey`就够了，你可以写一个简答的中间件函数打印,cc会告诉你此次修改的所有细节，后期提供的`cc-dev-tool`会结合`immutableJs`来构建一个可追溯的状态历史
```
cc.startup(
    {
        //...
        middlewares: [
            function myMiddleware1(context, next){
                //ccKey, fnName, module, calledBy, state等
                console.log(context);
                next();
            }
        ]
    }
)
```
* 副作用代码难以编写和复用，尽管有`redux-saga`之类的来解决此类问题，可是我们重新审视一下`cc`的设计，天生的对副作用的代码书写是友好的。
然后抛弃`setState`,使用`dispatch`来改变状态，在`cc class`内部可以使用`this.$$dispatch(action:Action|String, payload?:any)`来完成，注意一点哦，因为上面说到了，对于`cc`来说只需要提交一个`partialState`就够了，所以实际上`actionCreator`和`reducer`被精简为一体了，在`cc`里`reducer`函数负责接到状态，然后返回一个新的`partialState`就够了。
```
//code in Counter class
inc() => this.$$dispatch({type:'inc'});
dec()=> this.$$dispatch('dec');

//我们启动cc配置的reducer如下
cc.startup({
    //...
    reducer:{
        inc({state, payload, dispatch}){
            return {count: state.count+1};
        },
        dec({state}){
            return {count: state.count+1};
        }
    }
})
```
说好的副作用书写友好在哪里呢？我们留意的可以看到`reducer`函数参数列表里还解构出其他东东，比如`dispatch`,来来来，让我们提个需求，新增一个按钮，点击这个按钮时，先加10，然后过2秒钟自动减5，然后再过3秒直接变成100，因为在cc的`recuder`里是不强制一定要返回一个新的`partialState`的，不返回只是不会触发渲染而已，但是解构出来的`dispatch`是一个组合复用其他`reducer`函数的哦，让我们清爽的实现这个需求。
```
async function sleep(ms=1000){
    return new Promise((resolve)=>setTimeout(resolve, ms));
}

//reducer修改如下
reducer:{
    inc({state, payload:count=1, dispatch, effect}){
        return {count: state.count+count};
    },
    dec({state, payload:count=1}){
        return {count: state.count-count};
    },
    async funnyInc({await}){
        await dispatch('inc', 10);
        await sleep(5);
        await dispatch('dec', 5);
    }
}

//Counter里
funnyInc() => this.$$dispatch('funnyInc');

//render里
<button onClick={this.funnyInc}>funnyInc1</button>

//甚至你可以使用$$domDispatch,来减少这样没有必要的函数定义
<button data-cct="funnyInc" onClick={this.$$domDispatch}>funnyInc1</button>
```
现在你可以放心喝一口茶了，看到界面上会如你所想的工作，组合现有的`reducer`函数是一件多么轻松惬意的事情，注意哦`dispatch`返回一个`Promise`，某些场景时机你可能不需要`await`，这个就取决于具体业务了。  
我们进一步思考下中间件函数打印出的东西里有`ccKey, fnName, module, calledBy, state`等，以及图中提到的`effect`，我们所有做的事情只是返回一个新的`partialState`，一定需要走`dispatch`和`reducer`这种模式吗？当然是否，`cc`提供`effect(moduleName:String, userFunction:Function, ...args)`就是让你直接调用自己的业务函数，返回一个新的`partialState`就好了，那么我们`funnyInc`可以改写为：
```
async function sleep(ms=1000){
    return new Promise((resolve)=>setTimeout(resolve, ms));
}
async function inc(prevCount, count=1){
    return {count: prevCount+1};
}
async function dec(prevCount, dec=1){
     return {count: prevCount-1};
}
async function myFunnyInc({effect, dispatch, state}, count){
    await effect('count', inc, state.count, 10);
    await sleep(5);
    await effect('count', dec, state.count, 5);
}

//Counter里, 注意此处用的$$xeffect，用户自定义的函数参数列表第一位会是cc注入的ExecutionObject,里面可以解构出相关其他句柄和数据
funnyInc() => this.$$xeffect('count', myFunnyInc);

<button onClick={this.funnyInc}>funnyInc1</button>
```
如果用户留意的话，发现上面`$$xeffect`调用的用户自定义函数的第一位参数里也解构出了`dispatch`,如果你再往上看，会发现`reducer`方法里也解构出了`effect`、`xeffect`，如你想所想，他们可以混合使用，你可以在`reducer`里用`effect`，也可以在`effect`调用的函数使用`dispatch`，能够完美的工作起来，事实上你可能再想.......这样穿插的调用，还怎么保证状态可追踪？你可能忘了，任何调用`cc`都会知道上下文，由那个`cc实例`最初发起调用，使用了什么方式`setState`、`dispatch`、`effect`或者其他，如果是`dispatch`，`type`是什么，如果是`effect`,调用的自定义函数名字是什么等，真正让你从源头知道是从那里开始，走了一个怎样的流程，改变了那些状态，是不是够你追溯了呢？
* 更加优雅的组件间通信，让我们仔细想想，`redux`真正的算是解决了组件间通信吗？基于状态去做？让我们看看`cc`里是怎么实现的
```
@cc.r('Counter',{m:'counter', s:'*'})
class Counter extends Component{
    componentDidMount(){
        const id = this.props.id;
        this.$$on('cool',(p1, p2)=>{
            //做你任意想做的事吧
            alert(p1+p2+id);
        })
        this.$$onIdentity('cool', id, (p1, p2)=>{
            alert(p1+p2+id);
        })
    }
}

//App render里
      <div>
         <button onClick={()=>this.$$emit('cool','normal ', 'emit')}>emit</button>
        <button onClick={()=>this.$$emitIdentity('cool', '1' ,'identity ', 'emit')}>emitIdentity</button>
        <Counter id="1"/>
        <Counter id="2"/>
        <Counter id="3"/>
        <Counter id="4"/>
        <Counter id="5"/>
      </div>
```
当你点击emit按钮时，5个`<Counter/>`都会收到事件然后弹出显示，打你点击emitIdentity按钮时，只有id为1的那个`<Counter/>`会弹出提示，是不是更直白和优雅？  
事实上可能有细心的读者注意到每次组件`componentDidMount`都会触发`$$on`，会不会造成内存泄露，需不需要人工`off`？尽管`cc`提供了api让你可以使用`this.$$off(eventName:String)`，但是这里`cc`在这里已经在每次组件卸载时`off`掉这写监听了，不需要你再去`componentWillUnmount`里实现了。
* 计算属性呢？`redux`在`mapStateProps`里可以让用户重新计算注入到组件里的值，让我们看看`cc`怎么样更直白的实现
```
@cc.r('Counter',{m:'counter', s:'*'})
class Foo extends Component{
    $$computed(){
        return {
            count(count){
                return count*100;
            }
        }
    }
    render(){
        const {count} = this.$$refComputed;
        return <div>scaled count {count}</div>
    }
}
```
实际上你还可在模块里定义`computed`，这样计算出来的值是这个`module`下的所有组件都可以获取到的了，不过在`render`里是通过`this.$$moduleComputed`取到。
```
cc.startup(){
    //...
    computed:{
        counter:{//为counter模块的count定义计算函数
            count(count){
                return count*100;
            }
        }
    }
}
```
注意，计算函数只有在对应的`key`值发生变化时才重新触发计算，否则值是一直被缓存住的。

#### 一切从state获取是不是违背原则
读者可能已经注意到了，在`cc`里，`store`的数据都是注入在`state`里了，实际上`cc实例`的state由`cc`通过`register`时标记的`module`、`sharedStateKeys`、`globalStateKeys`的值合成出来的，所有`cc`组件都天生的能够观察`cc`内置模块`$$global`的状态变化，所有`cc`组件如果不设定`module`都会默认为属于`cc`的内置模块`$$default`，如下图所示，告诉你`cc实例`的`state`怎么产生的

![](https://user-gold-cdn.xitu.io/2019/3/10/1696792460447c10?w=1598&h=990&f=png&s=184585)
假设我们的`conter`模块和`$$global`模块的`state`现在如下
```
cc.startup({
    isModuleModel:true,
    store:{
        counter:{
            count:8,
        }
        $$global:{
            info:'i am global'
        }
    }
})
```
我们新建一个`Bar`
```
//等同于写cc.register('Bar',{m:'counter', sharedStateKeys:'*', globalStateKeys:'*'})
@cc.r('Bar',{m:'counter', s:'*', g:'*'})
class Foo extends Component{
    render(){
       console.log(this.state);// {count:8, info:'i am global'}
    }
}
```
注意我们没有书写`constructor`，`cc`为我们合成出了`state`,让我们稍作修改
```
@cc.r('Bar',{m:'counter', s:'*', g:'*'})
class Bar extends Component{
    constructor(props, context){
        super(props, context);
        this.state = {myPrivateKey:'666'}
    }
    render(){
       console.log(this.state);
       // {count:8, info:'i am global', myPrivateKey:'666'}
    }
}
```
如果我们在`constructor`给`count`赋值100，打印出来的`state`里的`count`还是8，因为这个值被`cc`从`store`恢复回来了，你写的值被覆盖了，这一点要注意
```
 console.log(this.state);
 // {count:8, info:'i am global', myPrivateKey:'666'}
```
除非你注册时，没有申明任何共享的`sharedStateKeys`，尽管这个`cc class`属于`counter`，但是将不会收`counter`模块里任何`key`变化的影响哦
```
@cc.r('Bar',{m:'counter'})
```
说到这里，依然还是正面回答标题里提出的疑问：一切从state获取是不是违背原则。因为我们从一开始就被告知，`state`是自己管理管理的转态，`props`上派发下来的状态才是需要共享的状态，我们仔细思考一下，在`cc`里你只要定义的`key`和`store`的`key`不重复，就不发生共享关系，或者你`register`时刻意设定某些想关心的`key`,也可以让你的`key`成为私有的`state`。
```
counter store: {key:1,key2:2, key3:3}

@cc.r('Bar',{m:'counter',s:['key1','key2']})
class Bar extends Component{
    constructor(props, context){
        this.state = {key3:888888};
    }
    render(){
        console.log(this.state);
        //{key:1,key2:2, key3:888888}
    }
}
```
打印结果会看到`{key:1,key2:2, key3:888888}`  
尽管counter模块里有`key1` `key2` `key3`,但是你注册时只共享了`key1`,`key2`，所以`key3`还是你私有的`state`      ，如果你调用`setState({key1:666,key2:888,key3:999})`时，  
`{key1:666,key2:888,key3:999}`会赋值给自己，然后`cc`提取出`{key1:666,key2:888}`广播出去。

![](https://user-gold-cdn.xitu.io/2019/3/10/16966650ccd8eb11?w=1438&h=1298&f=png&s=180564)
#### 不想用`state`来承载`store`的数据可以吗
如果你不喜欢用`state`来获取`store`的数据，只想干干净净的用`state`来做自己组件的状态管理，`cc`同样提供`$$propState`来获取`store`上的数据，上图里用户看到最后一步有一个`broadcastPropState`，完成此项工作。  
我们重写`Bar`
```
//@cc.register('Bar',{stateToPropMapping:{'counter/count':'count'}})
@cc.r('Bar',{pm:{'counter/count':'count'}})
class Bar extends Component{
    constructor(props, context){
        this.state = {key3:888888};
    }
    render(){
        console.log(this.$$propState);
        //{count:8}
    }
}
```
`stateToPropMapping`复杂完成把模块上的某些`key`映射到`$$propState`的`key`,大家可能留意到，`stateToPropMapping`的`key`是带模块名的，值作为`$$propState`的`key`可以被重命名，是因为这样做`cc class`可以观察任意多个模块的任意`key`的变化了
```
// 假设我们的counter模块里还有其他key如 info:'x'，
// 还有另外一个模块chart : {count:19, list:[]} 
const pm = {
    'counter/count':'count',
    'counter/info':'info',  
    'chart/count':'chart_count'
}
@cc.r('Bar',{pm})

 console.log(this.$$propState);
 // {count:8, info:'x', chart_count:19}
```
当你在别的地方修改`chart`的`count`值的为10000时候，`Bar`的`render`会被触发渲染，你会看到`chart_count`变为10000
```
 console.log(this.$$propState);
 // {count:8, info:'x', chart_count:10000}
```
如果你讨厌会所有`key`起别名，但是又担心命名冲突，可以写为：
```
// 假设我们的counter模块里还有其他key如 info:'x'，
// 还有另外一个模块chart : {count:19, list:[]} 
const pm = {
    'counter/*':'', 
    'chart/*':''
}
@cc.r('Bar',{pm, isPropStateModuleMode:true})
// 也可以直接写为
@cc.connect('Bar', pm)

 console.log(this.$$propState);
 // {counter:{count:8, info:'x'}, chart:{chart_count:19}}
```
当然这里要注意，这样写你其实关心这两个模块所有`key`变化了，根据实际场景来做判断需不需要标记`*`，实际上`register`是可以一起写`sharedStateKeys`和`stateToPropMapping`的，这样的话组件即从`this.state`拿到`store`罪行的数据，也能从`this.$$propState`上拿到`store`最新的数据
#### 关于无状态组件怎么复用`cc`里现有的业务逻辑？CcFragment给你答案
19年`facebook`给`react`赋能`hooks`后，都觉得以后慢慢的不需要`class`组件了，直接使用`function`组件能搞定一切？各种`useState`、`useEffect`、`useContext`已经被标准化，看起来`function`组件能够慢慢替代`class`组件了，可是我们仔细想想，我们期望状态集中管理，状态变化可以被精确追踪，`hooks`必然还需要一段很长的路走，我们看看`cc`给出对无状态组件怎么复用reducer给出的答案
```
import {CcFragment} from ''
const MyPanel = ()=>{
    return (
        <div>
            <CcFragment ccKey="clickMeChangeCount" connect={{'counter/*':''}}>
                {
                    ({propState, setState})=>(
                        <div onClick={()=>setState('counter', {count:200})}>{propState.counter.count}</div>
                    )
                }
            </CcFragment>
            <CcFragment ccKey="changeFooModuleState" connect={{'foo/*':''}}>
                {
                    ({propState, dispatch})=>(
                        <div onClick={()=>dispatch('foo/changeName', 'newName')}>{propState.foo.name}</div>
                    )
                }
            </CcFragment>
        </div>
    );
}
```
#### 让我们调戏UI
现在你可以打开`console`，输入`cc`回车，你会发现`cc`已经将`api`绑定到了`window.cc`下了，你可以输入`cc.setState(moduleName, newPartialState)`直接触发渲染，当然前提是有相关的UI已经挂载到界面上，要不然只是改变了`store`，视图并没有说明变化，除此之外，其他的`cc.emit`，`cc.dispatch`等使用方法和你在`cc class`是一样的使用体验，让你可以快速验证一些你的渲染逻辑哦。   
输入`sss`回车，可以查看`cc`最新的整个状态树。
___
### 结语
综上所诉，`cc`挑战前辈的资本，在于只是提供了最基础的api，却可以让你用更轻松的方式分离你的业务逻辑和视图渲染逻辑，以及更优雅的方式复用你的函数，因为对于对于`cc`来说，它们更像是一个个`newPartialStateCreator`，厌倦了`redux`的你，能不能在`cc`里找到你想要的答案呢？
* [在线示例点我](https://stackblitz.com/edit/dva-example-count-1saxx8?file=index.js)
* [cc版本ant-design-pro](https://github.com/fantasticsoul/react-control-center)
* [基础入门项目](https://github.com/fantasticsoul/rcc-simple-demo)
* [runjs录像教程](http://jsrun.net/vLXKp/play)
