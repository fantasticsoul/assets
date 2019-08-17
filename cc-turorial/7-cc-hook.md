### 前言
最近浏览到`vue`开发者尤雨溪以前的采访文章，感触颇深，其中有一段问答大概是这样：
> 采访：是什么驱使你开发 Vue.js 的？  
> 答：我想，我可以只把我喜欢的部分从 Angular 中提出来，建立一个非常轻巧的库，不需要那些额外的逻辑。我也很好奇 Angular 的源码到底是怎么设计的。我最开始只是想着手提取 Angular 里面很小的功能，如声明式数据绑定。Vue 大概就是这么开始的。
用过一段时间之后，我感觉我做的东西还有点前途，因为我自己就很喜欢用。于是我花了更多的时间把它封装好，取了一个名字叫做 Vue.js，我记得那时还是 2013 年。后来我想『我花了这么多时间，不能只有我一个人用，我应该和别人分享，他们也会感觉到 Vue 的好处，他们也会喜欢上 Vue 的。』

尤大的确非常直接，`因为我自己喜欢用，所以我想分享给多的人，想让更多的人喜欢...`，这是每一个开源作者由衷的体验，从开源日期来说，`react-control-center`的确非常非常的短，有一些朋友在成为种子用户之前，都会问我一个问题，
>为什么有了redux, 或者说dva、rematch等更好的redux wrapper，以及mobx这样强大的状态管理框架，还要写一个react-control-center呢？这样一个轮子是不是有一点多余

在回答这个问题之前，我想了下，尤大的那一段采访回答的确非常符合我的心境，首先呢，我们的项目也在大量的过使用`redux`或者`dva`,我自己私底下也了解过`mobx`，可是切换为`react-control-center`的确让我们的代码更加简洁和更容易维护与扩展，而且比`redux`多了很多非常好玩的特性，因为`react-control-center`是基于`react`的`setState`做了增强，所以不存在黑魔法，只是让你更优雅的调用`setState`而已哦，接下来我聊一聊变化侦测，再结合`setState`你一定会明白，或许我们不需要`redux`这种方式，而是回归`react`本质去做状态管理，一样可以高效而简单，但是却可以更加强大和有趣。
___
### 变化侦测
#### pull & push
变化侦测这个词在尤大的采访中提过不少次，我们同时也能看到尤大提到了变化侦测分为两种`pull`和`push`，这里我结合我对尤大的理解的解读和从我自己的视觉来谈一谈`pull`和`push`，本质上来说，这是两种不同的驱动方式来驱动数据和视图保持同步，只不过前者`pull`对于UI框架来说被动触发，`react`里暴露一个`setState`入口来让开发人工的提交要改变的数据，这样`react`才知道数据变化了，`push`对于UI框架来说主动触发，对于`vue`来说，你为组件声明的`data`都被转换成了`observable`对象，所以当你使用`this.username='xxx'`的时候，`vue`能够主动侦测到你的数据发生了变化，数据和视图浑然一体。  
这两种方式没有谁更好谁更优秀一说，性能上不会成为你评判该采用谁是最优解的标准，更多的我们从工程性的角度来说，视图渲染逻辑和业务逻辑必然耦合在一起，所以才有`vuex`、`redux`类似的方案，不只是帮你解决状态管理的问题，同时也帮你分离了业务逻辑和视图渲染逻辑。 
#### cc接管setState后发生了什么
让我们把目光回到`pull`和`react`的`setState`上，`setState`的参数其实很简单，你只需要提交你要修改的`partialState`给`react`，`react`就触发更新了。  
对于`cc`而言，将原始的`setState`保存为`reactSetState`，然后用户调用的`setState`已不再是最初的那个句柄，而是`cc`自己的实现了，我们聊`cc`的`setState`实现步骤之前，看看`register`函数的参数签名。
```
register(ccClassKey:string, registerOption?:{module?:string, sharedStateKeys?:Array<string>|'*', globalStateKeys?:Array<string>|'*'});
```
当你的一个普通的`react class`注册为`cc class`的时候，通过设定`registerOption.module`告诉`cc`这个`cc class`属于哪个`module`,通过设定`registerOption.sharedStateKeys`告诉`cc`这个`cc class`的所有实例会共享那些`sharedStateKey`的值变化，所以`cc`内部的上下文会维护的两个`map`，第一个是`module_ccClassKeys_`，键就是模块名，值就是这个模块下有哪些`ccClassKey`，第二个是`ccClassKey_ccClassContext_`，键就是`ccClassKey`，值就是`ccClassContext`，`ccClassContext`内部维护一个引用数组，表示当前`ccClassKey`已经实例化了多少个`cc instance`。  
现在我们看一看如下的代码片段示意：
```
//假设store.foo如下：
store:{
    foo:{
        name:1,
        age:2,
        grade:3,
    }
}

class Foo extends Component{
    //constructor略
    onNameChange = (e)=>{
        this.setState({name:e.currentTarget.value});
    }
    onAgeChange = (e)=>{
        this.setState({name:e.currentTarget.value});
    }
    render(){
        const {name, age} = this.state;
        return (
            <Fragment>
                <input onChange={this.onNameChange}/>
                <input onChange={this.onAgeChange}/>
            </Fragment>
        );
    }
}
const CcFoo1 = cc.register('Foo1', {module:'foo', sharedStateKeys:['name']})(Foo);
const CcFoo2 = cc.register('Foo2', {module:'foo', sharedStateKeys:'*'})(Foo);

//in your App.js
render(){
    return (
        <div>
            <Foo />
            <Foo />
            <CcFoo1 />
            <CcFoo1 />
            <CcFoo2 />
            <CcFoo2 />
        </div>
    );
}

```
`Foo`的实例其实孤立的，它们之间的state是独立维护的，`CcFoo1`尽管属于`foo`模块，但是只是标记了`sharedStateKeys`包含`name`，所以只有`name`的值变化是共享到了`foo`模块的状态里，`CcFoo2`标记了`sharedStateKeys`为`*`，所以`foo`模块的所有状态变化都会被`cc`同步到`CcFoo2`的所有实例上。  
* 那我们现在来具体化这个过程，如果`CcFoo1`的一个实例改变了`name`，当你调用`setState`的时候，`cc`先调用当前实例的`reactSetState`触发UI渲染行为。
* 然后你提交的`{name:'xxx'}`经过`cc`分析，当前实例所属的cc类`Foo1`下还有另一个实例`CcFoo1_ins2`，所以除了调用`reactSetState`把状态设置到当前实例，也会调用`CcFoo1_ins2.reactSetState`把状态设置回去。
* 同样的通过`module_ccClassKeys_`这个映射关系，`cc`发现还有另一个cc类`Foo2`也属于`foo`模块，然后`cc`会通过`ccClassKey_ccClassContext_`取出这个cc类的其他实例，遍历的调用`reactSetState`把状态设置到哪些具体的实例上，这样一个过程，在`cc`内部成为`状态广播`，看到了吗？原理非常简单，同时也非常高效，没有`angular`那样的生成一个个`watcher`做脏检查，仅仅只是找到正确的引用，提取合适的状态，然后触发`reactSetState`，便结束了，这便是为什么我说`react-control-center`只是让`setState`更加智能而已。
```
Foo ins1 --- name changed ---> Foo ins2
Foo ins2 --- name changed ---> Foo ins2

CcFoo1 ins1 --- name changed ---> CcFoo1 ins1
                            |--> CcFoo1 ins2
                            |--> CcFoo2 ins1
                            |--> CcFoo2 ins2
                            
CcFoo2 ins1 --- age changed ---> CcFoo2 ins1
                            |--> CcFoo2 ins2

```
![](https://user-gold-cdn.xitu.io/2019/3/10/16965e5dec6b197e?w=1672&h=1024&f=png&s=205701)
#### more than setState
当然`cc`不只是提供`setState`这个入口让你去修改，因为通常能够修改数据之前都会有不少的业务逻辑，最后才到`setState`这一步触发UI渲染，所以`cc`通过更强大、更灵活的api让你不在和`setState`打交道。
* dispatch(action:Action | reducerDescriptorStr, payload?:any)，`dispatch`的本质是找到你定义的`reducer`函数去执行，执行完之后返回一个新的`partialState`就完了，其它的一切交个`cc`搞定。 
* `cc`并不强制`reducer`函数返回新的`partialState`，提供一个`dispatch`句柄让你组合多个`reducer`函数执行，串行或者是并行任君选择，是不是非常的惬意^_^
```
//reducer in StartupOption
cc.startup({
    reducer:{
        'foo':{
            changeName({payload:name}){
                return {name};
            },
            async changeNameCool({dispatch, payload:name}){
                await dispatch('changeName', name);
                // await dispatch(); 组合多个函数串行执行
            }
        }
    }
})

class Foo extends Component{
    //constructor略
    onNameChange = (e)=>{
        //this.$$dispatch({type:'changeName', payload:e.currentTarget.value});
        //推荐这种更简便的写法
        this.$$dispatch('changeName', e.currentTarget.value);
    }
    changeNameCool = ()=>{
         this.$$dispatch('changeNameCool', e.currentTarget.value);
    }
    render(){
        const {name, age} = this.state;
        return (
            <Fragment>
                <input value={name} onChange={this.onNameChange}/>
                <input value={name} onChange={this.changeNameCool}/>
            </Fragment>
        );
    }
}
```
* invoke(userFn:function, ...args)，如果你讨厌走`dispatch`去命中`reducer`函数这个套路，`cc`同样允许你调用自定义函数，invoke默认改变自己实例所属模块的状态。
* effect(module:string, userFn:function, ...args)，你需要改变其他模块的状态，cc同样支持。
* 打破了`redux`的套路，状态追踪怎么办？其实这是一个你无须担心的问题，你调用`dispatch`、`invoke`、`effect`等这些句柄时，都是暗自携带者上下文的。
> 1 包括这一次调用提交的状态  
> 2 这此调用时哪一种方式触发的，用户可以使用setState的哦.....  
> 3 这次调用是从哪个实例产生的  

所以你想一想，是不是比`redux`一个孤独的`action type`能给你更多的信息？当然状态管理只是`cc`里该做的一部分，同样的更友好的副作用书写方式，类vue的`computed`、`watch`、`emit&on`等更好玩的特性才是`cc`要帮助你用更优雅的方式书写`react`。 

### hook
新版的react已经发布了，`hook`已成为稳定版的api，`facebook`在此基础上提出了新的组件划分方式：`class component`和`function component`，注意到没有，不再说笨组件和智能组件了，因为`function component`可以使用`hook`，它不再是笨蛋了....  
`function component`可以管理自己状态，甚至可以通过`useContext`实现不同的`function component`之间共享状态，看起来`class component`慢慢会被取代吗？  
这一点目前个人不敢下结论，但是在`cc`的世界里，因为有了`CcFragment`的存在，能够让你不用为了使用一些现有的`store`和`reducer`组合一个新的视图而去抽一个`class`出来的不必要局面，你可以达到快速复用现有的`stateless component`包裹在`CcFragment`，同样的考虑到用户需要在`CcFragment`管理自己的状态，`cc`最新版本已支持在`CcFragment`里使用`hook`，这不是一个对`react hook`的包裹，而是独立的实现，所以你依然可以在`react 15`里使用，api命名和使用效果和`react hook`保持100%一致，当然使用规则也是一样的：`不要在循环,条件或嵌套函数中调用Hook`，注意哦，`cc`的`hook`仅仅限在`CcFragment`内使用。
![](https://user-gold-cdn.xitu.io/2019/3/17/1698a47292a0a147?w=853&h=556&f=gif&s=1209881)
```
 <CcFragment connect={{'counter/*':''}} render={({ hook, propState }) => {
    const [count, setCount] = hook.useState(0);
    hook.useEffect(()=>{
      document.title = 'count '+count;
      return ()=>{
        document.title = 'CcFragment unmount ';
      }
    });
    //如果只想让effect函数在didMount的执行，可以写为 hook.useEffect(fn, []);
    //如果只想让effect函数依赖count值是否变化才执行，可以写为 hook.useEffect(fn, [count]);
    
    return (
      <div style={{border:'6px solid gold', margin:'6px'}}>
        <h3>show CcFragment hook feature</h3>
        {propState.counter.count}
        <hr />
        {count}
        <button onClick={() => setCount(count + 1)}>+</button>
        <button onClick={() => setCount(count - 1)}>-</button>
      </div>
    )
  }} />
```
有了`hook`，`CcFragment`不仅能打通`store`，也能够独立管理自己的状态，是不是更可爱了呢？  
[hook实现](https://github.com/fantasticsoul/react-control-center/blob/master/src/component/CcFragment.js)如下，其实正如`react hook`所说，不是魔法，只是数组.....
```
    // hook implement fo CcFragment
    const __hookMeta = {
      isCcFragmentMounted:false,
      useStateCount: 0,
      useStateCursor: 0,
      stateArr:[],
      useEffectCount: 0,
      useEffectCursor: 0,
      effectCbArr:[],
      effectSeeAoa:[],// shouldEffectExecute array of array
      effectSeeResult:[],// collect every effect fn's shouldExecute result
      effectCbReturnArr:[], 
    }
    this.__hookMeta = __hookMeta;
    const hook = {
      useState: initialState => {
        let cursor = __hookMeta.useStateCursor;
        const stateArr = __hookMeta.stateArr;
        __hookMeta.useStateCursor++;
        if (__hookMeta.isCcFragmentMounted === false) {//render CcFragment before componentDidMount
          __hookMeta.useStateCount++;
          stateArr[cursor] = initialState;
        } else {
          cursor = cursor % __hookMeta.useStateCount;
        }

        const setter = newState => {
          stateArr[cursor] = newState;
          this.cc.reactForceUpdate();
        }
        return [stateArr[cursor], setter];
      },
      useEffect: (cb, shouldEffectExecute) => {
        let cursor = __hookMeta.useEffectCursor;
        __hookMeta.useEffectCursor++;
        if (__hookMeta.isCcFragmentMounted === false) {
          __hookMeta.effectCbArr.push(cb);
          __hookMeta.effectSeeAoa.push(shouldEffectExecute);
          __hookMeta.useEffectCount++;
        } else {
          // if code running jump into this block, CcFragment already mounted, and now compute result for didUpdate
          cursor = cursor % __hookMeta.useEffectCount;
          if (Array.isArray(shouldEffectExecute)) {
            const len = shouldEffectExecute.length;
            if (len == 0) {
              __hookMeta.effectSeeResult = false;// effect fn will been executed only in didMount
            } else {// compare prevSee and curSee
              let effectSeeResult = false;
              const prevSeeArr = __hookMeta.effectSeeAoa[cursor];
              if (!prevSeeArr) {
                effectSeeResult = true;
              } else {
                for (let i = 0; i < len; i++) {
                  if (shouldEffectExecute[i] !== prevSeeArr[i]) {
                    effectSeeResult = true;
                    break;
                  }
                }
              }
              __hookMeta.effectSeeAoa[cursor] = shouldEffectExecute;
              __hookMeta.effectSeeResult[cursor] = effectSeeResult;
              if (effectSeeResult) __hookMeta.effectCbArr[cursor] = cb;
            }
          } else {
            __hookMeta.effectSeeResult[cursor] = true;// effect fn will always been executed in didMount and didUpdate
            __hookMeta.effectSeeAoa[cursor] = shouldEffectExecute;
            __hookMeta.effectCbArr[cursor] = cb;
          }
        }
      }
    }
```

#### 结语
前人总结出的优秀的方案，为何不融入到cc里呢？期待看完本文的你，能所有收获。`hook`真的优雅的解决了在`CcFragment`里管理`localState`的问题，所以才被加入进来，不是为了加而加，期待你也能够爱上`cc`，爱上`CcFragment`，爱上`cc hook`。
* [欢迎了解并star，成为cc的种子用户](https://github.com/fantasticsoul/react-control-center/blob/master/src/component/CcFragment.js)
* [在线示例点我，包含cc class 定义，CcFragmet，hook等](https://stackblitz.com/edit/dva-example-count-1saxx8?file=index.js)
* [cc版本ant-design-pro](https://github.com/fantasticsoul/react-control-center)
* [基础入门项目](https://github.com/fantasticsoul/rcc-simple-demo)
* [runjs录像教程](http://jsrun.net/vLXKp/play)