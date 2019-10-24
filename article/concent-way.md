
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z1.png)

[❤ star me if you like concent ^_^](https://github.com/concentjs/concent)

> 状态管理是一个前端界老生常谈的话题了，所有前端框架的发展历程中都离不开状态管理的迭代与更替，对于react来说呢，整个状态管理的发展也随着react架构的变更和新特性的加入而不停的做调整，作为一个一起伴随react成长了快5年的开发者，经历过reflux、redux、mobx，以及其他redux衍生方案dva、mirror、rematch等等后，我觉得它们都不是我想要的状态管理的终极形态，所以为了打造一个和react结合得最优雅、使用起来最简单、运行起来最高效的状态管理方案，踏上了追梦旅途。

# 为何需要状态管理

为何需要在前端引用里引入状态管理，基本上大家都达成了共识，在此我总结为3点：

- 随着应用的规模越来越大，功能越来越复杂，组件的抽象粒度会越来越细，在视图中组合起来后层级也会越来越深，能够方便的**跨组件共享状态**成为迫切的需求。
- 状态也需要按模块切分，状态的变更逻辑背后其实就是我们的业务逻辑，将其抽离出来能够彻底**解耦ui和业务**，有利于逻辑复用，以及持续的维护和迭代。
- 状态如果能够被集中的管理起来，并合理的派发有利于组件**按需更新**，缩小渲染范围，从而提高渲染性能

# 已有状态管理方案现状

## redux

遵循react不可变思路的状态管理方案，无论从git的star排名还是社区的繁荣度，首推的一定是`redux`这个react界状态管理一哥，约束使用唯一路径`reducer`纯函数去修改store的数据，从而达到整个应用的状态流转清晰、可追溯。

![z2](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z2.png)

## mbox

遵循响应式的后期之秀`mbox`，提出了`computed`、`reaction`的概念，其官方的口号就是**任何可以从应用程序状态派生的内容都应该派生出来**，通过将原始的普通json对象转变为可观察对象，我们可以直接修改状态，`mbox`会自动驱动ui渲染更新，因其响应式的理念和`vue`很相近，在`react`里搭配`mobx-react`使用后，很多人戏称`mobx`是一个将`react`变成了类`vue`开发体验的状态管理方案。

![z3](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z3.png)
当然因为`mbox`操作数据很方便，不满足大型应用里对状态流转路径清晰可追溯的诉求，为了约束用户的更新行为，配套出了一个`mobx-state-tree`，总而言之，`mobx`成为了响应式的代表。

## 其他

剩下的状态管理方案，主要有3类。    

一类是不满足`redux`代码冗余啰嗦，接口不够友好等缺点，进而在`redux`之上做2次封装，典型的代表国外的有如`rematch`，国内有如`dva`、`mirror`等，我将它们称为`redux`衍生的家族作品，或者是解读了`redux`源码，整合自己的思路重新设计一个库，如`final-state`、`retalk`、`hydux`等，我将它们称为类`redux`作品。

一类是走响应式道路的方案，和`mobx`一样，劫持普通状态对象转变为可观察对象，如`dob`，我将它们称为类`mobx`作品。

剩下的就是利用`react context api`或者最新的`hook`特性，主打轻量，上手简单，概念少的方案，如`unstated-next`，`reactn`、`smox`、`react-model`等。

# 我心中的理想方案

上述相关的各种方案，都各自在一定程度上能满足我们的需求，但是对于追求完美的水瓶座程序猿，我觉得它们终究都不是我理想的方案，它们或小而美、或大而全，但还是不够强，不够友好，所以决定开始自研状态管理方案。

我知道小和 美、全、强本身是相冲突的，我能接受一定量的大，gzip后10kb到20kb都是我接受的范围，在此基础上，去逐步地实现美、全、强，以便达到以下目的，从而体现出和现有状态管理框架的差异性、优越性。

- 让新手使用的时候，无需了解新的特性api，无感知状态管理的存在，使其遁于无形之中，仅按照react的思路组织代码，就能享受到状态管理带来的福利。
- 让老手可以结合对状态管理的已有认知来使用新提供的特性api，还原各种社区公认的最佳实践，同时还能向上继续探索和提炼，挖掘状态管理带来的更多收益。
- 在`react`有了`hook`特性之后，让class组件和function组件都能够享有一致的思路、一致的api接入状态管理，不产生割裂感。
- 在保持以上3点的基础上，让用户能够使用更精简且更符合思维直觉的组织方式书写代码，同时还能够获得巨大的性能提升收益。

为了达成以上目标，立项`concent`，将其定义为一个**可预测、零入侵、渐进式、高性能的增强型状态管理方案**，期待能把他打磨成为一个真真实实让用户用起来感觉到美丽、全面、强大的框架。

> 说人话就是：理解起来够简单、代码写起来够优雅、工程架构起来够健壮、性能用起来够卓越...... ^\_^

![z4](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z4.png)

## 可预测

`react`是一个基于`pull based`来做变化侦测的ui框架，对于用户来说，需要显式的调用`setState`来让`react`感知到状态变化，所以`concent`遵循react经典的不可变原则来体现可预测，不使用劫持对象将转变为可观察对象的方式来感知状态变化（要不然又成为了一个类`mobx`......）, 也不使用时全局`pub&sub`的模式来驱动相关视图更新，同时还要配置各种`reselect`、`redux-saga`等中间件来解决计算缓存、异步action等等问题（如果这样，岂不是又迈向了一个redux全家桶轮子的不归路..... ）

>  吐槽一下：redux粗放的订阅粒度在组件越来越多，状态越来越复杂的时候，经常因为组件订阅了不需要的数据而造成冗余更新，而且各种手写mapXXXToYYY很烦啊有木有啊有木有，伤不起啊伤不起......

## 零入侵

上面提到了期望新手仅按照react的思路组织代码，就能够享受到状态管理带来的福利，所以必然只能在`setState`之上做文章，其实我们可以把`setState`当做一个下达渲染指令重要入口（除此之外，还有`forceUpdate`）。

![z5](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z5.png)

仔细看看上图，有没有发现有什么描述不太准确的地方，我们看看官方的`setState`函数签名描述:

```ts
setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
    callback?: () => void
): void;
```

通过签名描述，我们可以看出传递给`setState`的是一个部分状态(片段状态)，实际上我们在调用`setState`也是经常这么做的，修改了谁就传递对应的`stateKey`和值。

![z6](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z6.png)

react自动将部分状态**合并**到原来的整个状态对象里从而覆盖掉其对应的旧值，然后驱动对应的视图更新。

![z7](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z7.png)

所以我只要能够让`setState`提交的状态给自己的同时，也能够将其提交到store并分发到其他对应的实例上就达到了我的目的。

![z8](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z8.png)

显而易见我们需要劫持`setState`，来注入一些自己的逻辑，然后再调用`原生setState`。

```js
//伪代码实现
class Foo extends Component{
  constructor(props, context){
    this.state = { ... };
    this.reactSetState = this.setState.bind(this);
    this.setState = (partialState, callback){
      //commit partialState to store .....
      this.reactSetState(partialState, callback);
    }
  }
}
```

当然作为框架提供者，肯定不会让用户在`constructor`去完成这些额外的注入逻辑，所以设计了两个关键的接口`run`和`register`，`run`负责载入模块配置，`register`负责注册组件设定其所属模块，被注册的组件其`setState`就得到了增强，其提交的状态不仅能够触发渲染更新，还能够直接提交到store，同时分发到这个模块的其他实例上。

> store虽然是一颗单一的状态树，但是实际业务逻辑是由很多模块的，所以我将store的第一层key当做模块名（类似命名空间），这样就产生了模块的概念

```js
//concent代码示意
import { run, register } from 'concent';

run({
  foo:{//foo模块定义
    state:{
      name: 'concent',
    }
  }
})

@register('foo')
class Foo extends Component {
  changeName = ()=> {
    this.setState({ name: e.currentTarget.value });//修改name
  }
  render(){
    const { name } = this.state;//读取name
    return <input value={name} onChange={this.changeName} />
  }
}
```

[在线示例代码见此处](https://stackblitz.com/edit/concent-doc-home-demo)

现在我们来看看上面这段代码，除了没有显示的在`Foo`组件里声明state，其他地方看起来是不是给你一种感觉：这不就是一个地地道道的react组件标准写法吗？concent将接入状态管理的成本降低到了几乎可忽略不计的地步。

当然，也允许你在组件里声明其他的非模块状态，这样的话它们就相当于私有状态了，如果`setState`提交的状态既包含模块的也包含非模块的，模块状态会被当做`sharedState`提取出来分发到其他实例，privName仅提交给自己。

```js
@register('foo')
class Foo extends Component {
  state = { privName: 'i am private, not from store' };
  fooMethod = ()=>{
    //name会被当做sharedState分发到其他实例，privName仅提交给自己
    this.setState({name: 'newName', privName: 'vewPrivName' });
  }
  render(){
    const { name, privName } = this.state;//读取name, privName
  }
}
```

在这样的模式下，你可以在任何地方实例化多个`Foo`，任何一个实例改变`name`的值，其他实例都会被更新，而且你也不需要在顶层的根组件处包裹类似`Provider`的辅助标签来注入store上下文。

之所以能够达到此效果，得益于`concent`的核心工作原理**依赖标记**、**引用收集**、**状态分发**，它们将在下文叙述中被逐个提到。

## 渐进式

能够通过作为`setState`作为入口接入状态管理，且还能区分出共享状态和私有状态，的确大大的提高了我们操作模块数据的便利性，但是这样就足够用和足够好了吗？

### 更细粒度的控制数据消费

组件对消费模块状态的粒度并不总是很粗的和模块直接对应的关系，即属于模块foo的组件`CompA`可能只消费模块foo里的`f1`、`f2`、`f3`三个字段对应的值，而属于模块foo的组件`CompB`可能只消费模块foo里另外的`f4`、`f5`、`f6`三个字段对应的值，我们当然不期望`CompA`的实例只修改了`f2`、`f3`时却触发了的`CompB`实例渲染。

大多数时候我们期望组件和模块保持的是一对一的关系，即一个组件只消费某一个模块提供的数据，但是现实情况的确存在一个组件消费多个模块的数据。

所以针对`register`接口，我们需要传入更多的信息来满足**更细粒度的数据消费需求**。

- 通过`module`标记组件属于哪个具体的模块   

> 这是一个可选项，不指定的话就让其属于内置的`$$default`模块（一个空模块），有了`module`，就能够让concent在其组件实例化之后将模块的状态注入到实例的`state`上了。

- 通过`watchedKeys`标记组件观察所属模块的stateKey范围

> 这是一个可选项，不传入的话，默认就是观察所属模块所有stateKey的变化，通过`watchedKeys`来定义一个stateKey列表，控制同模块的其他组件提交新状态时，自己需不需要被渲染更新。

- 通过`connect`标记连接的其他模块

> 这是一个可选项，让用户使用`connect`参数去标记连接的其他模块，设定在其他模块里的观察stateKey范围。

- 通过`ccClassKey`设定当前组件类名

> 这是一个可选项，设定后方便在`react dom tree`上查看具名的concent组件节点，如果不设定的话，concent会自动更根据其`module`和`connect`参数的值算出一个，此时注册了同一个模块标记了相同`connect`参数的不同react组件在`react dom tree`上看到的就是相同的标签名字。

通过以上register提供的这些关键参数为组件打上标记，完成了`concent`核心工作原理里很重要的一环：**依赖标记**，所以当这些组件实例化后，它们作为数据消费者，身上已经携带了足够多的信息，以更细的粒度来消费所需要的数据。

从`store`的角度看类与模块的关系

![z9](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z9.png)

实例的`state`作为数据容器已经盛放了所属模块的状态，那么当使用`connect`让组件连接到其他多个模块时，这些数据又该怎么注入呢？跟着这个问题我们回想一下上面提到过的，某个实例调用`setState`时提交的状态会被`concent`提取出其所属模块状态，将它作为`sharedState`精确的分发到其他实例。

能够做到精确分发，是因为当这些注册过的组件在实例化的时候，`concent`就会为其构建了一个实例上下文`ctx`，一个实例对应着一个唯一的`ctx`，然后`concent`这些`ctx`引用精心保管在全局上下文`ccContext`里（一个单例对象，在`run`的时候创建），所以说组件的实例化过程完成了`concent`核心工作原理里很重要的一环：**引用收集**，当然了，实例销毁后，对应的`ctx`也会被删除。

有了`ctx`对象，`concent`就可以很自然将各种功能在上面实现了，上面提到的连接了多个模块的组件，其模块数据将注入到`ctx.connectedState`下，通过具体的模块名去获取对应的数据。

![z10](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z10.png)

我们可以在代码里很方便的构建跨多个模块消费数据的组件，并按照stateKey控制消费粒度

```js
//concent代码示意
import { run, register, getState } from 'concent';

run({
  foo:{//foo模块定义
    state:{
      name: 'concent',
      age: 19,
      info: { addr: 'bj', mail: 'xxxx@qq.com' },
    }
  },
  bar: { ... },
  baz: { ... },
})

//不设定watchedKeys，观察foo模块所有stateKey的值变化
//等同于写为 @register({module:'foo', watchedKeys:'*' })
@register('foo')
class Foo1 extends Component { ... }

//当前组件只有在foo模块的'name', 'info'值发生变化时才触发更新
//显示的设定ccClassKey名称，方便查看引用池时知道来自哪个类
@register({module:'foo', watchedKeys:['name', 'info'] }, 'Foo2')
class Foo2 extends Component { ... }

//连接bar、baz两个模块，并定义其连接模块的watchKeys
@register({
  module:'foo', 
  watchedKeys:['name', 'info'] ,
  connect: { bar:['bar_f1', 'bar_f2'], baz:'*' }
}, 'Foo2')
class Foo2 extends Component {
  render(){
    //获取到bar,baz两个模块的数据
    const { bar, baz } = this.ctx.connectedState;
  }
 }
```

上面提到了能够做到精确分发是因为`concent`将实例的`ctx`引用做了精心保管，何以体现呢？因为`concent`为这些引用做了两层映射关系，并将其存储在全局上下文里，以便高效快速的索引到相关实例引用做渲染更新。

- 按照各自所属的不同模块名做第一层归类映射。

> 模块下存储的是一个所有指向该模块的`ccClassKey`类名列表, 当某个实例提交新的状态时，通过它携带者的所属模块，直接一步定位到这个模块下有哪些类存在。

- 再按照其各自的`ccClassKey`类名做第二层归类映射。

> `ccClassKey`下存储的就是这个cc类对应的上下文对象`ccClassContext`，它包含很多关键字段，如`refs`是已近实例好的组件对应的`ctx`引用索引数组，`watchedKeys`是这个cc类观察key范围。

上面提到的`ccClassContext`是配合`concent`完成**状态分发**的最重要的元数据描述对象，整个过程只需如下2个步骤：

- 1  实例提交新状态时第一步定位到所属模块下的所有`ccClassKey`列表，
- 2 遍历列表读取并分析`ccClassContext`对象，结合其`watchedKeys`条件约束，尝试将提交的`sharedState`通过`watchedKeys`进一步提取出符合当前类实例更新条件的状态`extractedState`，如果提取出为空，就不更新，反之则将其`refs`列表下的实例`ctx`引用遍历，将`extractedState`发送给对应的`reactSetState`入口，触发它们的视图渲染更新。

![z11](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z11.png)

### 解耦ui和业务

有如开篇的我们为什么需要状态管理里提到的，状态的变更逻辑背后其实就是我们的业务逻辑，将其抽离出来能够彻底**解耦ui和业务**，有利于逻辑复用，以及持续的维护和迭代。

所以我们漫天使用`setState`怼业务逻辑，业务代码和渲染代码交织在一起必然造成我们的组件越来越臃肿，且不利于逻辑复用，但是**很多时候功能边界的划分和模块的数据模型建立并不是一开始能够定义的清清楚楚明明白白的，是在不停的迭代过程中反复抽象逐渐沉淀下来的**。

所以`concent`允许这样多种开发模式存在，可以自上而下的一开始按模块按功能规划好store的reducer，然后逐步编码实现相关组件，也可以自下而上的开发和迭代，在需求或者功能不明确时，就先不抽象reducer，只是把业务写在组件里，然后逐抽离他们，也不用强求中心化的配置模块store，而是可以自由的去中心化配置模块store，再根据后续迭代计划轻松的调整store的配置。

新增reducer定义

```js
import { run } from 'concent';
run({
  counter: {//定义counter模块
    state: { count: 1 },//state定义，必需
    reducer: {//reducer函数定义，可选
      inc(payload, moduleState) {
        return { count: moduleState.count + 1 }
      },
      dec(payload, moduleState) {
        return { count: moduleState.count - 1 }
      }
    },
  },
})
```

通过dispatch修改状态

```js
import { register } from 'concent';
//注册成为Concent Class组件，指定其属于counter模块
@register('counter')
class CounterComp extends Component {
  render() {
    //ctx是concent为所有组件注入的上下文对象，携带为react组件提供的各种新特性api
    return (
      <div>
        count: {this.state.count}
        <button onClick={() => this.ctx.dispatch('inc')}>inc</button>
        <button onClick={() => this.ctx.dispatch('dec')}>dec</button>
      </div>
    );
  }
}
```

因为concent的模块除了state、reducer，还有watch、computed和init 这些可选项，支持你按需定义。

![z12](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z12.png)

所以不管是全局消费的`business model`、还是组件或者页面自己维护的`component model`和`page model`，都推荐进一步将model写为文件夹，在内部定义state、reducer、computed、watch、init，再导出合成在一起组成一个完整的model定义。

```
src
├─ ...
└─ page
│  ├─ login
│  │  ├─ model //写为文件夹
│  │  │  ├─ state.js
│  │  │  ├─ reducer.js
│  │  │  ├─ computed.js
│  │  │  ├─ watch.js
│  │  │  ├─ init.js
│  │  │  └─ index.js
│  │  └─ Login.js
│  └─ product ...
│  
└─ component
   └─ ConfirmDialog
      ├─ model
      └─ index.js
```

这样不仅显得各自的职责分明，防止代码膨胀变成一个巨大的model对象，同时reducer独立定义后，内部函数相互dispatch调用时可以**直接基于引用**而非字符串了。

```js
// code in models/foo/reducer.js
export function changeName(name) {
  return { name };
}

export async function  changeNameAsync(name) {
  await api.track(name);
  return { name };
}

export async function changeNameCompose(name, moduleState, actionCtx) {
  await actionCtx.setState({ loading: true });
  await actionCtx.dispatch(changeNameAsync, name);//基于函数引用调用
  return { loading: false };
}
```

## 高性能

现有的状态管理方案，大家在性能的提高方向上，都是基于缩小渲染范围来处理，做到只渲染该渲染的区域，对react应用性能的提升就能产生不少帮助，同时也避免了人为的去写`shouldComponentUpdate`函数。

那么对比`redux`，因为支持key级别的消费粒度控制，从状态提交那一刻起就知道更新哪些实例，所以性能上能够给你足够的保证的，特别是对于组件巨多，数据模型复杂的场景，`cocent`一定能给你足够的信心去从容应对，我们来看看对比`mbox`，`concent`做了哪些更多场景的探索。

### renderKey，更精确的渲染范围控制

每一个组件的实例上下文`ctx`都有一个唯一索引与之对应，称之为`ccUniqueKey`，每一个组件在其实例化的时候如果不显示的传入`renderKey`来重写的话，其`renderKey`默认值就是`ccUniqueKey`，当我们遇到模块的某个stateKey是一个列表或者map时，遍历它生产的视图里各个子项调用了同样的`reducer`，通过id来达到只修改自己数据的目的，但是他们共享的是一个`stateKey`，所以必然观察这个`stateKey`的其他子项也会被触发冗余渲染，而我们期望的结果是：谁修改了自己的数据，就只触发渲染谁。

如store的list是一个长列表，每一个item都会渲染成一个ItemView，每一个ItemView都走同一个reducer函数修改自己的数据，但是我们期望修改完后只能渲染自己，从而做到**更精确的渲染范围控制**。

![z13](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z13.png)

基于`renderKey`机制，`concent`可以轻松办到这一点，当你在状态派发入口处标记了`renderKey`时，`concent`会直接命中此`renderKey`对应的实例去触发渲染更新。

> 无论是`setState`、`dispatch`，还是`invoke`，都支持传入`renderKey`。

![z14](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z14.gif)

react组件自带的key用于diff v-dom-tree 之用，concent的`renderKey`用于控制实例定位范围，两者有本质上的区别，以下是示例代码，[在线示例代码点我查看](https://stackblitz.com/edit/concent-render-key?file=BookItem.js)

```js
// store的一个子模块描述
{
  book: {
    state: {
      list: [
        { name: 'xx', age: 19 },
        { name: 'xx', age: 19 }
      ],
      bookId_book_: { ... },//map from bookId to book
    },
    reducer: {
      changeName(payload, moduleState) {
        const { id, name } = payload;
        const bookId_book_ = moduleState.bookId_book_;
        const book = bookId_book_[id];
        book.name = name;//change name

        //只是修改了一本书的数据
        return { bookId_book_ };
      }
    }
  }
}

@register('book')
class ItemView extends Component {
  changeName = (e)=>{
    this.props.dispatch('changeName', e.currentTarget.value);
  }
  changeNameFast = (e)=>{
    // 每一个cc实例拥有一个ccUniqueKey 
    const ccUniqueKey = this.ctx.ccUniqueKey;
    // 当我修改名称时，真的只需要刷新我自己
    this.props.dispatch('changeName', e.currentTarget.value, ccUniqueKey);
  }
  render() {
    const book = this.state.bookId_book_[this.props.id];
    //尽管我消费是subModuleFoo的bookId_book_数据，可是通过id来让我只消费的是list下的一个子项

    //替换changeName 为 changeNameFast达到我们的目的
    return <input value={ book.name } onChange = { changeName } />
  }
}

@register('book')
class BookItemContainer extends Component {
  render() {
    const books = this.state.list;
    return (
      <div>
        {/** 遍历生成ItemView */}
        {books.map((v, idx) => <ItemView key={v.id} id={v.id} />)}
      </div >
    )
  }
}
```

因concent对class组件的hoc默认采用反向继承策略做包裹，所以除了渲染范围降低和渲染时间减少，还将拥有更少的dom层级。

![ccpk](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/cc-pk.png)

### lazyDispatch，更细粒度的渲染次数控制

在`concent`里，`reducer`函数和`setState`一样，提倡改变了什么就返回什么，且书写格式是多样的。

- 可以是普通的纯函数
- 可以是`generator`生成器函数
- 可以是`async & await`函数
可以返回一个部分状态，可以调用其他reducer函数后再返回一个部分状态，也可以啥都不返回，只是组合其他reducer函数来调用。对比`redux`或者`redux`家族的方案，总是合成一个新的状态是不是要省事很多，且纯函数和副作用函数不再区别对待的定义在不同的地方，仅仅是函数声明上做文章就可以了，你想要纯函数，就声明为普通函数，你想要副作用函数，就声明为异步函数，简单明了，符合阅读思维。

基于此机制，我们的reducer函数粒度拆得很细很原子，每一个都负责独立更新某一个和某几个key的值，以便更灵活的组合它们来完成高度复用的目的，让代码结构上变优雅，让每一个reducer函数的职责更得更小。

```js
//reducer fns
export async function updateAge(id){
  // ....
  return {age: 100};
}

export async function trackUpdate(id){
  // ....
  return {trackResult: {}};
}

export async function fetchStatData(id){
  // ....
  return {statData: {}};
}

// compose other reducer fns
export async function complexUpdate(id, moduleState, actionCtx) {
  await actionCtx.dispatch(updateAge, id);
  await actionCtx.dispatch(trackUpdate, id);
  await actionCtx.dispatch(fetchStatData, id);
}
```

虽然代码结构上变优雅了，每一个reducer函数的职责更小了，但是其实每一个reducer函数其实都会触发一次更新。

> reducer函数的源头触发是从实例上下文ctx.dispatch或者全局上下文cc.dispatch（or cc.reducer）开始的，呼叫某个模块的某个reducer函数，然后在其reducer函数内部再触发的其他reducer函数的话，其实已经形成了一个**调用链**，链路上的每一个返回了状态值的reducer函数都会触发一次渲染更新，如果链式上有很多reducer函数，会照常很多次对同一个视图的冗余更新。

触发reducer的源头代码

```js
// in your view
<button onClick={()=> ctx.dispatch('complexUpdate', 2)}>复杂的更新</button>
```

更新流程如下所示

![z15](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z15.png)

针对这种调用链提供lazy特性，以便让用户既能满意的把reducer函数更新状态的粒度拆分得很细，又保证渲染次数缩小到最低。

> 看到此特性，`mbox`使用者是不是想到了`transaction`的概念，是的你的理解没错，某种程度上它们所到到的目的是一样的，但是在concent里使用起来更加简单和优雅。

现在你只需要将触发源头做小小的修改，用`lazyDispatch`替换掉`dispatch`就可以了，reducer里的代码不用做任何调整，concent将延迟reducer函数调用链上所有reducer函数触发ui更新的时机，仅将他们返回的新部分状态按模块分类合并后暂存起来，最后的源头函数调用结束时才一次性的提交到store并触发相关实例渲染。

```js
// in your view
<button onClick={()=> ctx.lazyDispatch('complexUpdate', 2)}>复杂的更新</button>
```

![z16](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z16.gif)

[查看在线示例代码](https://stackblitz.com/edit/concent-lazy-dispatch?file=BookItem.js)

现在新的更新流程如下图

![z17](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z17.png)

当然lazyScope也是可以自定义的，不一定非要在源头函数上就开始启用lazy特性。

```js
// in your view
const a=  <button onClick={()=> ctx.dispatch('complexUpdateWithLoading', 2)}>复杂的更新</button>

// in your reducer
export async function complexUpdateWithLoading(id, moduleState, actionCtx) {
  //这里会实时的触发更新
  await actionCtx.setState({ loading: true });

  //从这里开始启用lazy特性，complexUpdate函数结束前，其内部的调用链都不会触发更新
  await actionCtx.lazyDispatch(complexUpdate, id);

  //这里返回了一个新的部分状态，也会实时的触发更新
  return { loading: false };
}
```

### delayBroadcast，更主动的降低渲染次数频率

针对一些共享状态，当某个实例高频率的改变它的时候，使用`delayBroadcast`主动的控制此状态延迟的分发到其它实例上，从而实现**更主动的降低渲染次数频率**

![z18](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z18.gif)

```js
function ImputComp() {
  const ctx = useConcent('foo');
  const { name } = ctx.state;
  const changeName = e=> ctx.setState({name: e.currentTarget.value});
  //setState第四位参数是延迟分发时间
  const changeNameDelay = e=> ctx.setState({name: e.currentTarget.value}, null, null, 1000);
  return (
    <div>
      <input  value={name} onChange={changeName} />
      <input  value={name} onChange={changeName} />
    </div>
  );
}

function App(){
  return (
    <>
      <ImputComp />
      <ImputComp />
      <ImputComp />
    </>
  );
}
```

[查看在线示例代码](https://stackblitz.com/edit/concent-delay-broadcast?file=InputComp1.js)

## 增强react

前面我们提到的`ctx`对象，是增强react的“功臣”，因为每个实例上都有一个`concent`为之构造的`ctx`对象，在它之下新增很多新功能、新特性就很方便了。

### 新特性加入

如上面关于模块提到了`computed`、`watch`等关键词，读到它们的读者，一定留了一些疑问吧，其实它们出现的动机和使用体验是和`vue`的一样的。

- `computed`定义各个`stateKey`的值发生变化时，要触发的计算函数，并将其结果缓存起来，仅当`stateKey`的值再次变化时，才会触发计。[了解更多关于computed](https://concentjs.github.io/concent-doc/guide/concept-module-computed)
- `watch`定义各个`stateKey`的值发生变化时，要触发的回调函数，仅当`stateKey`的值再次变化时，才会触发，通常用于一些异步的任务处理。[了解更多关于watch](https://concentjs.github.io/concent-doc/guide/concept-module-watch)。
我如果从`setState`的本质来解释，你就能够明白这些功能其实自然而然的就提供给用户使用了。

`setState`传入的参数是`partialState`，所以`concent`一开始就知道是哪些`stateKey`发生了变化，自然而然我们只需要暴露一个配置`computed`、`watch`的地方，那么当实例提交新的部分状态时，增强后`setState`就自然能够去触发相关回调了。

![z19](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z19.png)
### setup赋予组件更多能力

上面提到的`computed`、`watch`值针对模块的，我们需要针对实例单独定制`computed`、`watch`的话该怎么处理呢？

setup是针对组件实例提供的一个非常重要的特性，在类组件和函数组件里都能够被使用，它会在组件首次渲染之前会被触发执行一次，其返回结果收集在`ctx.settings`里，之后便不会再被执行，所以可以在其中定义实例computed、实例watch、实例effect等钩子函数，同时也可以自定义其他的业务逻辑函数并返回，方便组件使用。

基于setup执行时机的特点，相当于给了组件一个额外的空间，一次性的为组件定义好相关的个性化配置，赋予组件更多的能力，特别是对于函数组件，提供`useConcent`来复制了`register`接口的所有能力，其返回结果收集在`ctx.settings`里的特点让函数组件能够将所有方法一次性的定义在`setup`里，从而避免了在函数组件重复渲染期间反复生成临时闭包函数的弱点，减少gc的压力。

> 使用`useConcent`只是为了让你还是用经典的`dispatch&&reducer`模式来书写核心业务逻辑，并不排斥和其他工具钩子函数（如`useWindowSize`等）一起混合使用。

让我们`setup`吧！！！看看setup带来的魔力，其中`effect`钩子函数完美替代了`useEffect`。[了解更多关于setup](https://concentjs.github.io/concent-doc/guide/concept-ref-setup)

```js
const setup = ctx => {
  //count变化时的副作用函数，第二位参数可以传递多个值，表示任意一个发生变化都将触发此副作用
  ctx.effect(() => {
    console.log('count changed');
  }, ['count']);
  //每一轮渲染都会执行
  ctx.effect(() => {
    console.log('trigger every render');
  });
  //仅首次渲染执行的副作用函数
  ctx.effect(() => {
    console.log('trigger only first render');
  }, []);

  //定义实例computed，因每个实例都可能会触发，优先考虑模块computed
  ctx.computed('count', (newVal, oldVal, fnCtx)=>{
    return newVal*2;
  });

 //定义实例watch，区别于effect，执行时机是在组件渲染之前
 //因每个实例都可能会触发，优先考虑模块watch
  ctx.watch('count', (newVal, oldVal, fnCtx)=>{
    //发射事件
    ctx.emit('countChanged', newVal);
    api.track(`count changed to ${newVal}`);
  });

  //定义事件监听，concent会在实例销毁后自动将其off掉
  ctx.on('changeCount', count=>{
    ctx.setState({count});
  });

  return {
    inc: () => setCount({ count: ctx.state.count + 1 }),
    dec: () => setCount({ count: ctx.state.count - 1 }),
  };
}
```

得益于`setup`特性和所有concent实例都持有上线文对象`ctx`，类组件和函数组件将实现100%的api调用能力统一，这就意味着两者编码风格高度一致，相互转换代价为0。

接入setup的函数组件

```js
import { useConcent } from 'concent';

function HooklFnComp() {
  //setup只会在初次渲染前调用一次
  const ctx = useConcent({ setup, module:'foo' });
  const { state , settings: { inc, dec }  } = ctx;

  return (
    <div>
      count: {state.count}
      <button onClick={inc}>+</button>
      <button onClick={dec}>-</button>
    </div>
  );
}
```

接入setup的类组件

```js
@register('foo')
class ClassComp extends React.Component() {
  $$setup(ctx){
    //复用刚才的setup定义函数, 这里记得将结果返回
    return setup(ctx);
  }

  render(){
    const ctx = this.ctx;
    //ctx.state 等同于 this.state
    const { state , settings: { inc, dec }  } = ctx;

    return (
      <div>
        count: {state.count}
        <button onClick={inc}>+</button>
        <button onClick={dec}>-</button>
      </div>
    );
  }

}
```

[查看在线示例代码](https://stackblitz.com/edit/hook-setup?file=CounterSetupComputedWatch.js)

能力得到增强后，可以自由的按场景挑选合适的方式更新状态

```js
@register("foo")
class HocClassComp extends Component {
  render() {
    const { greeting } = this.state; // or this.ctx.state
    const {invoke, sync, set, dispatch} = this.ctx;

    // dispatch will find reducer method to change state
    const changeByDispatch = e => dispatch("changeGreeting", evValue(e));
    // invoke cutomized method to change state
    const changeByInvoke = e => invoke(changeGreeting, evValue(e));
    // classical way to change state, this.setState equals this.ctx.setState
    const changeBySetState = e => this.setState({ greeting: evValue(e) });
    // make a method to extract event value automatically
    const changeBySync = sync('greeting');
    // similar to setState by give path and value
    const changeBySet = e=> set('greeting', evValue(e));

    return (
      <>
        <h1>{greeting}</h1>
        <input value={greeting} onChange={changeByDispatch} /><br />
        <input value={greeting} onChange={changeByInvoke} /><br />     
        <input value={greeting} onChange={changeBySetState} /><br />
        <input value={greeting} onChange={changeBySync} /><br />
        <input value={greeting} onChange={changeBySet} />
      </>
    );
  }
}
```

[查看在线示例代码](https://stackblitz.com/edit/concent-doc-home-demo)

下图是一个完整的concent组件生命周期示意图：

![z20](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z20.png)

### 支持中间件与插件

一个好的框架应该是需要提供一些可插拔其他库的机制来弹性的扩展额外能力的，这样有利于用户额外的定制一些个性化需求，从而促进框架周边的生态发展，所以一开始设计concent，就保留了中间件与插件机制，允许定义中间件拦截所有的数据变更提交记录做额外处理，也支持自定义插件接收运行时的各种信号，增强concent能力。

![z21](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z21.png)

定义中间件并使用

> 一个中间就是一个普通函数

```
import { run } from 'concent';
const myMiddleware = (stateInfo, next)=>{
  console.log(stateInfo);
  next();//next一定不能忘记
}

run(
  {...}, //store config
  {
    middlewares: [ myMiddleware ] 
  }
);
```

定义插件并使用

> 一个插件就是一个必需包含install方法的普通对象

```js
import { cst, run } from 'concent';

const myPlugin = {
  install: ( on )=>{
    //监听来自concent运行时的各种信号，并做个性化处理
    on(cst.SIG_FN_START, (data)=>{
      const { payload, sig } = data;
      //code here
    })
  }

  return { name: 'myPlugin' }//必需返回插件名
}
```

现基于插件机制已提供如下插件

- [concent-plugin-loading](https://github.com/concentjs/concent-plugin-loading)，一个轻松控制concent应用loading状态的插件
- [concent-plugin-redux-devtool](https://github.com/concentjs/concent-plugin-redux-devtool)，让concent应用接入redux-dev-tool调试工具，方便清晰的追溯状态变更历史。

![z22](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z22.png)

### 拥抱现有的react生态

当然`concent`不会去造无意义的轮子，依然坚持拥抱现有的react生态的各种优秀资源，如提供的[react-router-concent](https://github.com/concentjs/react-router-concent)，桥接了`react-router`将其适配到concent应用里。

全局暴露`history`对象，享受编程式的导航跳转。

```js
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ConnectRouter, history, Link } from 'react-router-concent';
import { run, register } from 'concent';

run();

class Layout extends Component {
  render() {
    console.log('Layout Layout');
    return (
      <div>
        <div onClick={() => history.push('/user')}>go to user page</div>
        <div onClick={() => history.push('/user/55')}>go to userDetail page</div>
        {/** 可以基于history主动push，也可以使用Link */}
        <Link to="/user" onClick={to => alert(to)}>to user</Link>
        <div onClick={() => history.push('/wow')}>fragment</div>
        <Route path="/user" component={User_} />
        <Route path="/user/:id" component={UserDetail_} />
        <Route path="/wow" component={F} />
      </div>
    )
  }
}

const App = () => (
  <BrowserRouter>
    <div id="app-root-node">
      <ConnectRouter />
      <Route path="/" component={Layout} />
    </div>
  </BrowserRouter>
)
ReactDOM.render(<App />, document.getElementById('root'));
```

[点我查看在线示例](https://stackblitz.com/edit/cc-react-router-concent?file=index.js)

# 结语&思考

`concent`的工作机制核心是**依赖标记**、**引用收集**、**状态分发**，通过构建全局上下文和实例上下文，并让两者之间产生互动来实现状态管理的诉求，并进一步的实现组件能力增强。

理论上基于此原理，可以为其他同样基于`pull based`更新机制的ui框架实现状态管理，并让他们保持一致的api调用能力和代码书写风格，如`小程序`的`this.setData`，`omi`的`this.update`。

同时因为`concent`提供了实例上下文对象`ctx`来升级组件能力，所以如果我们提出一个目标：可以让`响应式`和`不可变`共存，看起来是可行的，只需要再附加一个和`state`对等的可观察对象在`ctx`上，假设`this.ctx.data`就是我们构建的可观察对象，然后所提到的`响应式`需要做到针对不同平台按不同策略处理，就能达到共存的目的了。

- 针对本身就是`响应式`的框架如`angualr`和`vue`，提供`this.ctx.data`去直接修改状态相当于桥接原有的更新机制，而`reducer`返回的状态最终还是落到`this.ctx.data`去修改来驱动视图渲染。
- 针对`pull based`的框架如`react`，提供`this.ctx.data`只是一种伪的响应式，在`this.ctx.data`收集到的变更最终还是落到`this.setState`去驱动视图更新，但是的确让用户使用起来觉得是直接操作了数据就驱动了视图的错觉。
所以如果实现了这一层的统一，是不是`concent`可以用同样的编码方式去书写所有ui框架了呢？

当然，大一统的愿望是美好的，可是真的需要将其实现吗？各框架里的状态管理方案都已经很成熟，个人有限的精力去做实现这份愿景必然又是选择了一条最最艰辛的路，所以这里只是写出一份个人对让`响应式`和`不可变`共存的的思考整理，给各位读者提供一些参考意见去思考状态管理和ui框架之间的发展走向。

如果用一句诗形容状态管理与ui框架，个人觉得是

> 金风玉露一相逢，便胜却人间无数。

两者相互成就对方，相互扶持与发展，见证了这些年各种状态库的更替。

目前`concent`暂时只考虑与`react`做整合，致力于提高它们之间的默契度，期望逐步的在大哥`redux`而二哥`mobx`的地盘下，占领一小块根据地生存下来，如果读者你喜欢此文，对`concent`有意，欢迎来[star](https://github.com/concentjs/concent)，相信革命的火种一定能够延续下去，`concent`的理念一定能走得更远。