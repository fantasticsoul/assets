### 前言
随着`CcFragment`支持`hook`了，私底下有小伙伴问我，在什么场景下使用`hook`，才能体现出`hook`的精髓，以及什么时候支持`useStore`和`useReducer`。  

这里我分开回答一下，解开小伙伴的疑惑：
* 1 什么时候使用`hook`？
> 我们知道`hook`仅限与在`CcFragment`内部使用，那么这里先就先解释一下`CcFragment`的出现缘由，当你定义了不少`store`和`reducer`，在此基础上写了不少`cc class`业务组件了，随着功能的迭代，你将要实现的组件需要跨多个模块消费数据，当组件本身交互逻辑和渲染逻辑都复杂的时候，我们可以使用`register`或者`connect`去装饰一个新的类来达到此目的。
___
>但是组件本身的渲染逻辑不复杂而且很轻量的时候，没有必要去抽象一个`class`来完成此组件，`CcFragment`的出现让你可以快速实现类似的组件。  
___
>`CcFragment`标签通过提供`connect`属性让你能够共享多个模块的`state`，但是如果用户在`CcFragment`里需要保管和操作自己的一些`localState`时，看起来就没法了，难道又要将`CcFragment`的逻辑写为`cc class`组件吗？`hook`的出现本质上和`react hook`是一个目的，都是为了解决`localState`的管理问题，目前`CcFragment`里可以使用`hook`的两个函数，分别是`useState`和`useEffect`，使用的效果和`react hook`是完全一样的。
>1) `useState`返回一个值和`setter`组成的元组。 
> 2) `useEffect`让你执行副作用，如果不传递第二位参数，`useEffect`在每一次`CcFragment`渲染完毕都会执行，如果传递第二位参数为空数组，`useEffect`仅仅是在`CcFragment`挂载完毕执行，如果传递第二位参数为包含元素的数组，`useEffect`是否需要执行取决于数组里的元素是否发生了变化，当然`useEffect`返回的函数是在`CcFragment`卸载时会被执行。

* 2 什么时候支持`useStore`和`useReducer`？
> 其实这个问题是因为小伙伴没有彻底理解`CcFragment`才会有此疑问，上面我们提到了：`CcFragment`标签通过提供`connect`属性让你能够共享多个模块的`state`，理所当然的`CcFragment`也提供对应的函数让你直接复用现有的`reducer`函数，实际上`CcFragment`提供的内置函数是和`cc class`完全一致的，所以`CcFragment`同样能给你和`cc class`一样的使用体验，下面这个例子展示了`CcFragment`提供给你的函数，所以聪明的你是不是醒悟过来，`useStore`和`useReducer`在`CcFragment`里已经是多余的存在了^_^
```
<CcFragment connect={{'foo/*'}} render={({hook,propState,dispatch,emit,emitIndentity,invoke,effect,xeffect})=>{
    //your logic code here
    render <div>see the method above?</div>
}}/>
```

### 实现Counter
#### 目标
为了进一步解释`CcFragment`和`hook`，我们来用`cc`完成一个有意思的`counter`示例，让大家进一步了解，为什么`cc`宣传了这样一句话：让你书写优雅的`react`代码。
#### 需求
* 基于`cc class`实现一个组件名为`ClazzCounter`。
* 基于`CcFragment`实现一个组件名为`FnCounter`。
* `ClazzCounter`对数操作增加，并存储到`counter`这个模块的`state`里。
* `FnCounter`对数的操作维护在自己实例内部名为`localCount`，当`localCount`为10的整数倍的时候，同步到`counter`里。
* `FnCounter`实现一个自增按钮，点击一次后，自动对`counter`模块的`state`里的`count`值随机增加1~10以内的数，加10次，每增加一次，暂停500ms。
* `FnCounter`的实例卸载时使用`alert`弹一句提示语`unmount FnCounter`。
#### store和reducer定义
我们使用`cc.startup`函数启动`cc`，注入`store`和`reducer`，`reducer`里包含一个自增、自减和随机自增函数
```
function sleep(ms=600){
    return new Promise(resolve=>setTimeout(resolve,ms));
}
function ran(max=10){
    return Math.floor(Math.random()*10);
}

startup({
  isModuleMode:true,// startup in module mode
  store:{
      counter:{
        count:0,
      }
  },
  reducer:{
      counter:{
        inc({moduleState, payload:count}){
            let toAdd = 0;
            if(count!==undefined)toAdd = count ;
            else toAdd = 1;
            return {count: moduleState.count + toAdd};
        },
        dec({moduleState, payload:count}){
            return {count:moduleState.count-1};
        },
        async randomInc({dispatch}){
            for(let i=0;i<10;i++){
                await dispatch('inc', ran());
                await sleep();
            }
            alert('randomInc finished');
        }
      }
  },
  middlewares:[
        (context, next)=>{console.log(context);next()}
  ]
});
```
### ClassCounter定义
因为`cc`会自动注入state，我们这里就不写`constructor`了，设定`ClazzCounter`的`ccClassKey`为`Counter`，在`react dom tree`上将会与`<CC(Counter)>`的方式展示，设定`ClazzCounter`属于`counter`模块，共享`counter`的所有`key`的状态变化。
```
@register('Counter', {module:'counter', sharedStateKeys:'*'})
class ClazzCounter extends React.Component {
    inc = ()=>{
        this.$$dispatch('inc');
    }
    render(){
        const {count} = this.state;
        return (
            <div style={{border:'1px solid lightgrey',padding:'9px'}}>
                count: {count}
                <div>
                    <button onClick={this.inc}>+</button>
                    <button data-cct="dec" onClick={this.$$domDispatch}>-</button>
                </div>
            </div>
        );
    }
}
```
#### FnCounter定义
把FnCounter定义为一个`function component`，
* 内部使用`CcFragment`，连接上`counter`模块的所有数据，
* 使用`useState`返回的`setter`函数包装一个`mySetCount`函数，完成当`localCount`为10的整数倍的时候，同步到`counter`里这个功能
* 使用`useState`返回一个函数，完成需求：`FnCounter`的实例卸载时使用`alert`弹一句提示语`unmount FnCounter`
* 定义一个`<button>`的`onClick`事件调用`dispatch('counter/randomInc')`,触发随机增加的需求
```
function FnCounter({label}){

function FnCounter({label}){
    return (
        <CcFragment connect={{'counter/*':''}} render={({propState, hook, dispatch})=>{
            const [count, setCount] = hook.useState(0);
            const mySetCount = (count)=>{
                setCount(count);
                if(count%10===0){
                    dispatch('counter/inc', count);
                }
            };
            hook.useEffect(()=>()=>alert('unmount FnCounter'));
            return (
                <div style={{border:'1px solid blue',padding:'9px',marginTop:'12px'}}>
                    <div>{label}</div>
                    counter count:{propState.counter.count}<br/>
                    local count: {count}
                    <div>
                    <button onClick={()=>mySetCount(count+1)}>+</button>
                    <button onClick={()=>mySetCount(count-1)}>-</button>
                    <button onClick={()=>dispatch('counter/randomInc')}>randomInc</button>
                </div>
                </div>
            );
        }}/>
    );
}
```
#### 渲染它们，看看效果吧
我们可以的多放几个，看看它们之间的数据同步效果，以及证明`FnCounter`的实例是各自维护自己的`localCount`值哦。
```
class App extends React.Component{
  render(){
    return(
      <div>
        <ClazzCounter />
        <ClazzCounter />
        <FnCounter label="FnCounter1"/>
        <FnCounter label="FnCounter2"/>
      </div>
    );
  }
}

ReactDOM.render(<App/>, document.getElementById('root'));
```
![](https://user-gold-cdn.xitu.io/2019/3/18/16990ba8876c42f5?w=572&h=427&f=gif&s=156278)

### 总结
`CcFragment`结合`hook`，能够让你更加从容的复用已有的代码，以及更优雅的写`function component`，组合`hook`函数可以玩出更多的新花样，等待你去发现`cc`的更多的`react`有趣写法。

* [本次示例代码在这里](https://stackblitz.com/edit/funny-counter?file=index.js)
* [欢迎了解并star，成为cc的种子用户](https://github.com/fantasticsoul/react-control-center)
* [在线示例点我，包含cc class 定义，CcFragmet，hook等](https://stackblitz.com/edit/dva-example-count-1saxx8?file=index.js)
* [cc版本ant-design-pro](https://github.com/fantasticsoul/rcc-antd-pro)
* [基础入门项目](https://github.com/fantasticsoul/rcc-simple-demo)
* [runjs录像教程](http://jsrun.net/vLXKp/play)
