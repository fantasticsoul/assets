目录回顾
* [启动cc](https://juejin.im/post/5c3ee445f265da6126386416)
* [动态配置模块](https://juejin.im/post/5c39d0c46fb9a049db735bf7)
___

#### 前言
#### 最初的react
> react用户最初接触接触react时，一定被洗脑了无数次下面几句话
* 数据驱动视图
* 单向数据流
* 组件化
> 它们体现着react的精髓，最初的时候，我们接触的最原始的也是最多的触发react视图渲染就是`setState`，这个函数打开了通往react世界的大门，因为有了`setState`，我们能够赋予组件生命，让它们按照我们开发者的意图动起来了。  
> 渐渐的我们发现，当我们的单页面应用组件越来越多的时候，它们各自的状态形成了一个个孤岛，无法相互之间优雅的完成合作，我们越来越需要一个集中式的状态管理方案，于是facebook提出了flux方案,解决庞大的组件群之间状态不统一、通信复杂的问题

![](https://user-gold-cdn.xitu.io/2019/2/23/169189825baa0ade?w=585&h=215&f=webp&s=4422)
#### 状态管理来了
仅接着社区优秀的flux实现涌现出来，最终沉淀下来形成了庞大用户群的有`redux`，`mbox`等，本文不再这里比较cc与它们之间的具体差异，因为`cc`其实也是基于flux实现的方案，但是`cc`最大的特点是直接接管了`setState`，以此为根基实现整个`react-control-center`的核心逻辑，所以`cc`是对`react`入侵最小且改写现有代码逻辑最灵活的方案，整个`cc`内核的简要实现如下

![](https://user-gold-cdn.xitu.io/2019/2/23/16918a16713fcee9?w=1084&h=502&f=png&s=59090)
可以看到上图里除了`setState`，还有`dispatch`、`effect`，以及3个点，因为cc触发有很多种，这里只提及`setState`、`dispatch`和`effect`这3种能覆盖用户99%场景的方法，期待读完本文的你，能够爱上`cc`。
___
### setState，[在线示例代码](https://codepen.io/fantasticsoul/pen/omKxqv)
#### 一个普通的react组件诞生了，
以下是一个大家见到的最最普通的有状态组件,视图里包含了一个名字显示和input框输入，让用户输入新的名字
```
class Hello extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name:'' };
  }
  changeName = (e)=>{
    this.setState({name:e.currentTarget.value});
  }
  render() {
    const {name} = this.state;
    return (
      <div className="hello-box">
        <div>{this.props.title}</div>
        <input value={name} onChange={this.changeName} />hello cc, I am {name} 
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="app-box">
       <Hello title="normal instance"/>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
```
![如图所示](https://user-gold-cdn.xitu.io/2019/2/23/16918b91e58dc87e?w=614&h=122&f=gif&s=29455)
#### 改造为cc组件
事实上声明一个cc组件非常容易，将你的react组件注册到cc，其他就交给cc吧,这里我们先在程序的第一行启动cc，声明一个`store`
```
cc.startup({
  store:{name:'zzk'}
});
```

使用`cc.register`注册`Hello`为CC类
```
const CCHello = cc.register('Hello',{sharedStateKeys:'*'})(Hello);
```
然后让我们渲染出`CCHello吧`
```
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="app-box">
       <Hello title="normal instance"/>
       <CCHello title="cc instance1"/>
       <CCHello title="cc instance2"/>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
```
![渲染出CCHello](https://user-gold-cdn.xitu.io/2019/2/23/16918e1e850c23df?w=1117&h=536&f=gif&s=1072680)
上面动态图中我们可以看到几点`<CCHello />`与`<Hello />`表现不一样的地方
>* 初次添加一个`<CCHello />`的时候，input框里直接出现了zzk字符串
>* 添加了3个`<CCHello />`后，对其中输入名字后，另外两个也同步渲染了  

为什么CC组件会如此表现呢，接下来我们聊聊`register`
#### `register`，普通组件通往cc世界的桥梁
我们先看看register函数签名解释，因为register函数式如此重要，所以我尽可能的解释清楚每一个参数的意义，但是如果你暂时不想了解细节，可以直接略过这段解释，不妨碍你阅读后面的内容哦^_^，[了解跟多关于register函数的解释](https://juejin.im/post/5c714e576fb9a049de6dff12)
```
/****
 * @param {string} ccClassKey cc类的名称，你可以使用多个cc类名注册同一个react类，但是不能用同一个cc类名注册多个react类
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} registerOption 注册的可选参数
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.module] 声明当前cc类属于哪个模块，默认是`$$default`模块
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {Array<string>|string} [registerOption.sharedStateKeys] 
 * 定义当前cc类共享所属模块的哪些key值，默认空数组，写为`*`表示观察并共享所属模块的所有key值变化
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {Array<string>|string} [registerOption.globalStateKeys] 
 * 定义当前cc类共享globa模块的哪些key值，默认空数组，写为`*`表示观察并共享globa模块的所有key值变化
 * ============   !!!!!!  ============
 * 注意key命名重复问题，因为一个cc实例的state是由global state、模块state、自身state合成而来，
 * 所以cc不允许sharedStateKeys和globalStateKeys有重复的元素
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} [registerOption.stateToPropMapping] { (moduleName/keyName)/(alias), ...}
 * 定义将模块的state绑定到cc实例的$$propState上，默认'{}'
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {object} [registerOption.isPropStateModuleMode] 
 * 默认是false，表示stateToPropMapping导出的state在$$propState是否需要模块化展示
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.reducerModule]
 * 定义当前cc类的reducer模块，默认和'registerOption.module'相等
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.extendInputClass] 
 * 是否直接继承传入的react类，默认是true，cc默认使用反向继承的策略来包裹你传入的react类，这以为你在cc实例可以通过'this.'直接呼叫任意cc实例方法，如果可以设置'registerOption.extendInputClass'为false，cc将会使用属性代理策略来包裹你传入的react类，在这种策略下，所有的cc实例方法只能通过'this.props.'来获取。
 * 跟多的细节可以参考cc化的antd-pro项目的此组件 https://github.com/fantasticsoul/rcc-antd-pro/blob/master/src/routes/Forms/BasicForm.js
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.isSingle] 该cc类是否只能实例化一次，默认是false
 * 如果你只允许当前cc类被实例化一次，这意味着至多只有一个该cc类的实例能存在
 * 你可以设置'registerOption.isSingle'为true，这有点类似java编码里的单例模式了^_^
 * ' - - - - - - - - - - - - - - - -- - - - - - - - - - - - - - - - - - - - - - - - - - -'
 * @param {string} [registerOption.asyncLifecycleHook] 是否是cc类的生命周期函数异步化，默认是false
 * 我们可以在cc类里定义这些生命周期函数'$$beforeSetState'、'$$afterSetState'、'$$beforeBroadcastState',
 * 他们默认是同步运行的,如果你设置'registerOption.isSingle'为true，
 * cc将会提供给这些生命周期函数next句柄放在他们参数列表的第二位，
 *  * ============   !!!!!!  ============
 * 你必须调用next，否则当前cc实例的渲染动作将会被永远阻塞，不会触发新的渲染
 * ```
 * $$beforeSetState(executeContext, next){
 *   //例如这里如果忘了写'next()'调用next, 将会阻塞该cc实例的'reactSetState'和'broadcastState'等操作~_~
 * }
 * ```
 */
```
通过`register`函数我们来解释上面遗留的两个现象的由来
>* 初次添加一个`<CCHello />`的时候，input框里直接出现了zzk字符串.  
>> 因为我们注册`Hello`为`CCHello`的时候，语句如下  
>> `const CCHello = cc.register('Hello',{sharedStateKeys:'*'})(Hello);`  
>> 没有声明任何模块，所以`CCHello`属于`$$default`模块，定义了`sharedStateKeys`为`*`，  
>> 表示观察和共享`$$default`模块的整个状态,所以在`starup`里定义的`store`的`name`就被同步到`CCHello`了
>* 添加了3个`<CCHello />`后，对其中输入名字后，另外两个也同步渲染了 
>> 因为对其中一个`<CCHello />`输入名字时，  
>> 其他两个`<CCHello/>`他们也属于'$$default'模块，也共享和观察`name`的变化，  
>> 所以其实任意一个`<CCHello />`的输入，cc都会将状态广播到其他两个`<CCHello />`

#### 多模块话组织状态树
前面文章我们介绍`cc.startup`时说起推荐用户使用多模块话启动`cc`,所以我们稍稍改造一下`starup`启动参数，让我们的不仅仅只是使用cc的内置模块`$$default`和`$$global`。
定义两个新的模块`foo`和`bar`,可以把他们的state定义成一样的。
```
cc.startup({
  isModuleMode:true,
  store:{
    $$default:{
      name:'zzk of $$default',
      info:'cc',
    },
    foo:{
      name:'zzk of foo',
      info:'cc',
    },
    bar:{
      name:'zzk of bar',
      info:'cc',
    }
  }
});
```
以`Hello`类为输入新注册2个cc类`HelloFoo`和`HelloBar`,然后渲染他们看看效果吧
```
const CCHello = cc.register('Hello',{sharedStateKeys:'*'})(Hello);
const HelloFoo = cc.register('HelloFoo',{module:'foo',sharedStateKeys:'*'})(Hello);
const HelloBar= cc.register('HelloBar',{module:'bar',sharedStateKeys:'*'})(Hello);

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="app-box">
       <Hello title="normal instance"/>
        <CCHello title="cc instance1 of module $$default"/>
        <CCHello title="cc instance1 of module $$default"/>
        <br />
        <HelloFoo title="cc instance3 of module foo"/>
        <HelloFoo title="cc instance3 of module foo"/>
        <br />
        <HelloBar title="cc instance3 of module bar"/>
        <HelloBar title="cc instance3 of module bar"/>
      </div>
    )
  }
}
```
![多个模块的Hello](https://user-gold-cdn.xitu.io/2019/2/23/16919c81360def2b?w=1242&h=456&f=gif&s=1723718)
以上我们演示了用同一个react类注册为观察着不同模块state的cc类，可以发现尽管视图是一样的，但是他们的状态在模块化的模式下被相互隔离开了，这也是为什么推荐用模块化方式启动cc，因为业务的划分远远不是两个内置模块就能表达的
#### 让一个模块被被另外的react类注册
上面我们演示了用同一个react类注册到不同的模块，下面我们写另一个react类`Wow`来观察`$$default`模块
```
class Wow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { name:'' };
  }
  render() {
    const {name} = this.state;
    return (
      <div className="wow-box">
        wow {name} <input value={name} onChange={(e)=>this.setState({name:e.currentTarget.value})} />
      </div>
    )
  }
}
```
![Wow来了](https://user-gold-cdn.xitu.io/2019/2/23/16919c323b06c4d5?w=1276&h=531&f=gif&s=2336330)

___
### dispatch，更灵活的setState
[在线示例代码](https://codepen.io/fantasticsoul/pen/omKxqv)
#### 让业务逻辑和视图渲染逻辑彻底分离
我们知道，视图渲染代码和业务代码混在一起，对于代码的重构或者维护是多么的不友好，所以尽管cc提供`setState`来改变状态，但是我们依然推荐`dispatch`方式来使用cc，让业务逻辑和视图渲染逻辑彻底分离
#### 定义reducer
我们在启动cc时，为foo模块定义一个和foo同名的reducer配置在启动参数里
```
  reducer:{
    foo:{
      changeName({payload:name}){
        return {name};
      }
    }
  }
```
现在让我们修改`Hello`类用`dispatch`去修改state吧,可以声明派发foo模块的reducer去生成新的state并修改foo，当state模块和reducer模块重名时，可以用简写方式
```
  changeName = (e)=>{
     const name = e.currentTarget.value;
    //this.setState({name});
    this.$$dispatch('foo/changeName', payload:name);
    //等价与this.$$dispatch('foo/foo/changeName', payload:name);
    //等价于this.$$dispatch({ module: 'foo', reducerModule:'foo',type: 'changeName', payload: name });
  }
```
![Wow来了](https://user-gold-cdn.xitu.io/2019/2/23/16919e82b756914b?w=1215&h=547&f=gif&s=1174178)
#### 对模块精确划分
上面贴图中，我们看到当我们修改`<HelloFoo/>`实例里的input的框的时候,`<HelloFoo/>`如我们预期那样发生了变化，但是我们在`<HelloBar/>`或者`<CCHello/>`里输入字符串时，他们没有变化，却触发了`<HelloFoo/>`发生，这是为什么呢？  
我们回过头来看看`Hello`类里的`this.$$dispatch`函数，指定了状态模块是`foo`,所以这里就出问题了  
让我们去掉`this.$$dispatch`里的状态模块，修改为总是用`foo`这个reducerModule模块的函数去生成新的state，但是不指明具体的目标状态模块，这样cc实例在发起`$$this.dispatch`调用时就会默认去修改当cc类所属的状态模块
```
  changeName = (e)=>{
     const name = e.currentTarget.value;
    //this.setState({name});
    //不指定module，只指定reducerModule，cc实例调用时会去修改自己默认的所属状态模块的状态
    this.$$dispatch({reducerModule:'foo',type: 'changeName', payload: name });
  }
```
![Wow来了](https://user-gold-cdn.xitu.io/2019/2/23/1691a01b2288e1df?w=1225&h=513&f=gif&s=2141517)
上图的演示效果正如我们的预期效果，三个注册到不同的模块的cc组件使用了同一个recuder模块的方法去更新状态。
让我们这里总结下cc查找reducer模块的规律
>* 不指定state模块和reducer模块时，cc发起`$$dispatch`调用的默认寻找的目标state模块和目标reducer模块就是当前cc类所属的目标state模块和目标reducer模块  
>* 只指定state模块不指定reducer模块时，默认寻找的目标state模块和目标reducer模块都是指定的state模块
>* 不指定state模块，只指定reducer模块时，默认寻找的目标state模块是当前cc类所属的目标state模块，寻找的reducer模块就是指定的reducer模块
>* 两者都指定的时候，cc严格按照用户的指定值去查询reducer函数和修改指定目标的state模块

cc这里灵活的把recuder模块这个概念也抽象出来，为了方便用户按照自己的习惯归类各个修改状态函数。  
大多数时候，用户习惯把state module的命名和reducer module的命名保持一致，但是cc允许你定义一些额外的recuder module，这样具体的reducer函数归类方式就很灵活了，用户可按照自己的理解去做归类
#### dispatch，发起副作用调用
我们知道，react更新状态时，一定会有副作用产生，这里我们加一个需求，更新foo模块的name时，通知bar模块也更新name字段，同时上传一个name到后端，拿后端返回的结果更新到`$$default`模块的name字段里，让我们小小改造一下changeName函数
```
async function mockUploadNameToBackend(name) {
  return 'name uploaded'
}


    changeName: async function ({ module, dispatch, payload: name }) {
      if (module === 'foo') {
        await dispatch('bar/foo/changeName', name);
        const result = await mockUploadNameToBackend(name);
        await dispatch('$$default/foo/changeName', result);
        return { name };
      } else {
        return { name };
      }
    }
```
![dispatch](https://user-gold-cdn.xitu.io/2019/2/23/1691a1ae3e27e5d9?w=1198&h=567&f=gif&s=1236912)
cc支持reducer函数可以是async或者generator函数，其实reducer函数的参数excutionContext可以解构出`module`、`effect`、`xeffect`、`state`、`moduleState`、`globalState`、`dispatch`等参数，
我们在reducer函数发起了其他的副作用调用
#### dispatch内部，组合其他dispatch
cc并不强制要求所有的reducer函数返回一个新的state，所以我们可以利用dispatch发起调用组合其他的dispatch  
基于上面的需求，我们再给自己来下一个这样的需求，当foo模块的实例输入的是`666`的时候，把``foo`、`bar`的所有实例的那么重置为`恭喜你中奖500万`了，我们保留原来的changeName，新增一个函数`changeNameWithAward`和`awardYou`,然后组件里调用`changeNameWithAward`
```
    awardYou: function ({dispatch}) {
      const award = '恭喜你中奖500万';
      Promise.all(
        [
          dispatch('foo/changeName', award),
          dispatch('bar/foo/changeName', award)
        ]
      );
    },
    changeNameWithAward: async function ({ module, dispatch, payload: name }) {
      console.log('changeNameWithAward', module, name);
      if (module === 'foo' && name === '666') {
        dispatch('foo/awardYou');
      } else {
        console.log('changeName');
        dispatch(`${module}/foo/changeName`, name);
      }
    }
```
![dispatch2](https://user-gold-cdn.xitu.io/2019/2/23/1691a5086a11b3d3?w=1258&h=587&f=gif&s=1979730)
我们可以看到`awardYou`里并没有返回新的state，而是并行调用changeName。
cc基于这样的组合dispatch理念可以让你跟灵活的组织代码和重用已有的reducer函数

### effect，最灵活的setState
#### 不想用`dispatch`和`reducer`组合拳？试试`effect`
`effect`其实和`dispatch`是一样的作用，生成新的state，只不过不需要指定reducerModule和type让cc从reducer定义里找到对应的函数执行逻辑，而是直接把函数交给effect去执行  
让我们在`Hello`组件里稍稍改造一下，当name为888的时候，不调用`$$dispatch`而是调用`$$effect`
```
    function myChangeName(name, prefix) {
      return { name: `${prefix}${name}` };
    }

  changeName = (e) => {
    const name = e.currentTarget.value;
    // this.setState({name});
    // this.$$dispatch('foo/changeName', name);
    if(name==='888'){
        const currentModule = this.cc.ccState.module;
        //add prefix 888
        this.$$effect(currentModule, myChangeName, name, '8');
    }else{
      this.$$dispatch({reducerModule:'foo',type: 'changeNameWithAward', payload: name });  
    }
  }
```
![dispatch2](https://user-gold-cdn.xitu.io/2019/2/23/1691a6447c7b5e0c?w=1228&h=574&f=gif&s=1735978)
effect必须指定具体的模块，如果想自动默认使用当前实例的所属模块可以写为
```
this.$invoke(myChangeName, name, '8');
```
#### dispatch使用effect？同样可以
上面我们演示recuder函数时有提到executionContext里可以解构出`effect`,所以用户可以在reducher函数里一样的使用effect
```
awardYou:function ({dispatch, effect}) {
  const award = '恭喜你中奖500万';
  await Promise.all([
    dispatch('foo/changeName', award),
    dispatch('bar/foo/changeName', award)
  ]);
  await effect('bar',function(info){
      return {info}
  },'wow cool');
}
```
#### effect使用dispatch呢？同样可以
想用在effect内部使用`dispatch`,需要使用cc提供的`xeffect`函数，默认把用户自定义函数的第一位参数占用了，传递executionContext给第一位参数
```
    async function myChangeName({dispatch, effect}, name, prefix) {
      //call effect or dispatch as you expected
      return { name: `${prefix}${name}` };
    }
    
    changeName = (e) => {
        const name = e.currentTarget.value;
        this.$$xeffect(currentModule, myChangeName, name, '8');
  }
```
___
### 状态广播
#### 状态广播延迟
该参数大多时候用户都不需要用到，cc可以为`setState`、`$$dispatch`、`effect`都可以设置延迟时间，单位是毫秒，侧面印证cc是的状态过程存在，这里我们设置当输入是`222`时，3秒延迟广播状态, （备注，不设定时，cc默认是-1，表示不延迟广播）
```
    this.setState({name});
    ---> 可以修改为如下代码，备注，第二位参数是react.setState的callback，cc做了保留 
    this.setState({name}, null, 3000);
    
    this.$$effect(currentModule, myChangeName, name, 'eee');
    ---> 可以修改为如下代码，备注，$$xeffect对应的延迟函数式$$lazyXeffect
    this.$$lazyEffect(currentModule, myChangeName, 3000, name, 'eee');
    
    this.$$dispatch({ reducerModule: 'foo', type: 'changeNameWithAward', payload: name });
    ---> 可以修改为如下代码，备注，$$xeffect对应的延迟函数式$$lazyXeffect
     this.$$dispatch({ lazyMs:3000, reducerModule: 'foo', type: 'changeNameWithAward', payload: name });
```
![dispatch2](https://user-gold-cdn.xitu.io/2019/2/23/1691a64e574511aa?w=1203&h=196&f=gif&s=292567)
___
### 类vue
#### 关于emit
cc允许用户对cc类实例定义`$$on`、`$$onIdentity`,以及调用`$$emit`、`$$emitIdentity`、`$$off`  
我们继续对上面的需求做扩展，当用户输入`999`时，发射一个普通事件`999`，输入`9999`时，发射一个认证事件名字为`9999`证书为`9999`，我们继续改造`Hello`类，在componentDidMount里开始监听
```
    componentDidMount(){
        this.$$on('999',(from, wording)=>{
          console.log(`%c${from}, ${wording}`,'color:red;border:1px solid red' );
        });
        if(this.props.ccKey=='9999'){
          this.$$onIdentity('9999','9999',(from, wording)=>{
            console.log(`%conIdentity triggered,${from}, ${wording}`,'color:red;border:1px solid red' );
          });
        }
     } 
     
    changeName = (e) => {
        // ......
        if(name === '999'){
          this.$$emit('999', this.cc.ccState.ccUniqueKey, 'hello');
        }else if(name === '9999'){
          this.$$emitIdentity('9999', '9999', this.cc.ccState.ccUniqueKey, 'hello');
        }
    }
```
注意哦，你不需要在computeWillUnmount里去$$off事件，这些cc都已经替你去做了，当一个cc实例销毁时，cc会取消掉它的监听函数，并删除对它的引用，防止内存泄露
![emit](https://user-gold-cdn.xitu.io/2019/2/23/1691a836ab2390b0?w=931&h=307&f=gif&s=645167)
#### 关于computed
我们可以对cc类定义$$computed方法，对某个key或者多个key的值定义computed函数，只有当这些key的值发生变化时，cc会触发计算这些key对应的computed函数，并将其缓存起来  
我们在cc类定义的computed描述对象计算出的值，可以从`this.$$refComputed`里取出计算结果，而我们在启动时为模块的state定义的computed描述对象计算出的值,可以从`this.$$moduleComputed`里取出计算结果，特别地，如果我们为`$$global`模块定义了computed描述对象，可以从`this.$$globalComputed`里取出计算结果  
现在我们为类定义computed方法，将输入的值反转,代码如下
```
$$computed() {
  return {
    name(name) {
      return name.split('').reverse().join('');
    }
  }
}
```
![computed](https://user-gold-cdn.xitu.io/2019/2/23/1691a8b60cb360d0)
#### 关于ccDom
cc默认采用的是反向继承的方式包裹你的react类，所以在reactDom树看到的组件非常干净，不会有多级包裹
![ccdom](https://user-gold-cdn.xitu.io/2019/2/23/1691a8d953c32d4d?w=609&h=397&f=gif&s=274633)
#### 关于顶层函数和store
现在，你可以打开console，输入`cc.`,可以直接呼叫`dispatch`、`emit`、`setState`等函数，让你快速验证你的渲染逻辑，输入sss，查看整个cc的状态树结构
![](https://user-gold-cdn.xitu.io/2019/2/23/1691a8fb22a6bf65?w=749&h=413&f=gif&s=279746)
___
### 结语
好了，基本上cc驱动视图渲染的3个基本函数介绍就到这里了，cc只是提供了最最基础驱动视图渲染的方式，并不强制用户使用哪一种，用户可以根据自己的实际情况摸索出最佳实践  
因为cc接管了setState,所以cc可以不需要包裹`<Provider />`，让你的可以快速的在已有的项目里使用起来,

[具体代码点此处](https://github.com/fantasticsoul/rcc-simple-demo/blob/master/src/cc-use-case/ForTutorial3/index.js)

[线上演示点此处](https://codepen.io/fantasticsoul/pen/QYeMje),注：线上演示代码不完整，最完整的[运行此项目](https://github.com/fantasticsoul/rcc-simple-demo)