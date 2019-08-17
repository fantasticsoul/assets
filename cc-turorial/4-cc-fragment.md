
### 视图与业务，好一对冤家
#### 业务型model
`model`是需要精心的设计和合理的划分的，这是我们之前开发大型的`redux`+`react`单页面应用，大家都认同的真理，同样的，在`react-control-center`+`react`的开发里也适用这条黄金规则，通常，我们在接到需求，定制开发计划的时候，会抽象出很多业务相关的关键词，这些关键词慢慢经过进一步整理，将成为我们划分功能或者模块的有效依据，这些模块最终在前端这里会沉淀为`model`，每一个`model`定义了自己的`state`、`reducer`,当然如果有需要，还可以为其定义`computed`、`init`，通过精心的目录组织和规范的约定，视图的渲染逻辑和我们书写的业务逻辑被有效的解耦到`component`里和`reducer`里，这样当我们需要重构UI组件，可以放心的对其重构或者新增一个组件，复用相同的`state`和`reducer`  
[参考cc-antd-pro的划分](https://github.com/fantasticsoul/rcc-antd-pro/tree/master/src/models-cc)
```
|________layouts
|     |________BasicLayout.js
|     |________BasicLayout.less
|     |________BlankLayout.js
|     |________PageHeaderLayout.js
|     |________PageHeaderLayout.less
|     |________UserLayout.js
|     |________UserLayout.less
|________models
|     |________activities.js
|     |________chart.js
|     |________form.js
|     |________global.js
|     |________index.js
|     |________list.js
|     |________login.js
|     |________monitor.js
|     |________profile.js
|     |________project.js
|     |________register.js
|     |________rule.js
|     |________user.js
```
#### 视图型model
有一些状态，我们开发的过程中，发现和视图紧密相关，不同的组件在不同的生命周期阶段，都需要使用他们或者感知到他们的变化，例如右上角用户勾选的主题色，影响左下角一个抽屉的弹出策略或效果，这些状态同样需要交个状态管理框架集中管理起来，所以我们也会这些需求设计相应的`model`,这一类和主要业务逻辑不想管，但是我们依然需要精心管理起来的`model`，我们称之为视图型`model`.
#### 视图代码膨胀之困惑
通常，我们已开始精心设计好各种`model`后，开始信心满满的进入开发流程，随着功能迭代越来越块，需求变动越来频繁，我们的`model`会不停的调整或者扩展，按照`class`组件和`function`组件比例2：8开的原则，我们总是想抽出更多的`function`组件，`class`组件负责和和`model`打通，然后从`model`里拿到的数据层层派发它的所以孩子`function`组件里，但是`function`组件通常都不是只负责展示，还是有不少`function`组件需要修改`model`的`state`,所以我们在`ant-design-pro`里或者别的地方，依然会看到不少类似代码
```
@connect(state => ({
  register: state.register,
}))
class Foo extends Component {
    render(){
        return (
            <MyStatelessFoo {...this.props}/>
        );
    }
}

const MyStatelessFoo = ({dispatch}){
    return <div onClick={dispatch('foo/changeSomething')}>whaterver</div>
}
```
如果有`function`组件`Foo1`、`Foo2`、`Foo3`,`Foo1`嵌套了`Foo2`,`Foo2`嵌套了`Foo3`，看起来要一层一层传递下去了。  
同时视图组件调整的时间占比会远大于`reducer`函数的书写，我们有时候为了那个某个`model`的`state`,不停的传递下去或者慢慢的将某些比较重的`function`组件又提升为`class`组件
#### react hooks解决了什么呢？
这里复制一段facebook引出`hooks`要解决的问题所在之处
* 难以重用和共享组件中的与状态相关的逻辑
* 逻辑复杂的组件难以开发与维护，当我们的组件需要处理多个互不相关的 local state * 时，每个生命周期函数中可能会包含着各种互不相关的逻辑在里面。
* 类组件中的this增加学习成本，类组件在基于现有工具的优化上存在些许问题。
* 由于业务变动，函数组件不得不改为类组件等等。  

可是如果我们的`function`组件如果是需要共享或者修改`model`的`state`呢，有什么更优雅的办法解决吗？
#### CcFragment为你带来全新的无状态组件书写体验
一个典型的`CcFragment`使用方式如下
```
import {CcFragment} from 'react-control-center';

//在你的普通的react组件或者cc组件里，都可以写如下代码
  render() {
    <div>
      <span>another jsx content</span>
      <hr/>
      <CcFragment ccKey="toKnowWhichFragmentChangeStore" connect={{ 'foo/*': '', 'bar/a': 'a', 'bar/b': 'alias_b' }}>
        {
          ({ propState, setState, dispatch, emit, effect, xeffect, lazyEffect, lazyXeffect }) => (
            <div onClick={() => setState('foo', { name: 'cool, I can change foo module name' })}>
              {/* 以上方法，你可以像在cc类组件一样的使用它们，没有区别 */}
              {propState.foo.name}
              {propState.bar.a}
              {propState.bar.alias_b}
            </div>
          )
        }
      </CcFragment>
    </div>
  }

```
上面代码里，`CcFragment`标记一个`ccKey`，`connect`
* cc默认是会为所有`CcFragment`自动生成`ccKey`的，但是我们推荐你书写一个有意义的`ccKey`，因为`CcFragment`允许无状态组件直接使用`setState, dispatch, emit, effect, xeffect, lazyEffect, lazyXeffect`方法去修改状态或者发起通知，这些函数的使用体验是和`cc class`一摸一样，加上`ccKey`,你可以在你的中间件函数里看到某一次的状态变化是由哪一个`ccKey`触发的，这样未来你可以在还在计划开发中的`cc-dev-tool`里查看具体的状态变迁历史，当然目前你需要查看状态变化的话，可以写一个简答的中间件函数来log
```
function myMiddleware(params, next) {
  //params 里你可以看到本次状态变化提交的状态是什么，由什么方法触发，由那个ccKey的引用触发等
  console.log('myMiddleware', params);
  next();
}

cc.startup({
  //...
  middlewares: [myMiddleware]
});

```
* connect和`cc.register`、`cc.connect`一样，表示该`CcFragment`关注那些模块，哪些值的变化，上述示例的效果会是
>1 只要`bar`模块的`a`或者`b`变化了，都会触发该`CcFragment`的渲染  
>2 只要`foo`模块的任意`key`变化了，都会触发该`CcFragment`的渲染  
>3 点击了`div`,会去修改`foo`模块的`name`值，关注`foo`模块`name`值变化的所有`cc`组件或者`CcFragment`组件都会触发渲染
 
所以`CcFragment`解决了用户在无状态组件里共享了`model`数据的问题，你写的无状态组件很容易和`cc store`打通，而无需在考虑抽取为`cc class`组件，`CcFragment`本质上和`hooks`不存在冲突管理，也和现有`cc class`不冲突，只是作为`cc`世界里更重要的补充，让你可以无损的使用现有的`function`组件。  
注意一点哦，`CcFragment`本身是不会因为父组件的更新而被更新的哦，仅仅受控制于`connect`参数观察的参数是否发生变化，所以它的渲染依然是高效的。

### 那么可爱的各位看官，还不赶紧使用起来
* [在线示例点我](https://stackblitz.com/edit/dva-example-count-1saxx8?file=index.js)
* [cc版本ant-design-pro](https://github.com/fantasticsoul/react-control-center)
* [基础入门项目](https://github.com/fantasticsoul/rcc-simple-demo)
* [runjs录像教程](http://jsrun.net/vLXKp/play)
