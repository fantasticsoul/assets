# Ant Design Pro Powered by [react-control-center](https://github.com/fantasticsoul/react-control-center)

### cc版本的ant-design-pro来了,[ant-design-pro powered by C_C](https://github.com/fantasticsoul/rcc-antd-pro)

---
#### 我们先看看redux是如何工作起来的，在来细比较`cc`和`redux`的最大的不同之处

##### `redux`如何工作？订阅`redux`单一状态树里的部分数据源，让组件被`redux`接管,从而实现当订阅的数据源发生变化时才触发渲染的目的
 - 我们知道，在`redux`世界里，可以通过一个配置了`mapStateToProps`的`connect`高阶函数去包裹一个组件，能够得到一个高阶组件，该高阶组件的`shouldComponentUpdate`会被redux接管，通过浅比较this.props!==nextProps来高效的决定被包裹的组件是否要触发新一轮的渲染，之所以能够这么直接进行浅比较，是因为在`redux`世界的`reducer`里,规定了如果用户改变了一个状态某一部分值，一定要返回一个新的完整的状态，如下所示，是一个传统的经典的`connect`和`reducer`写法示例。
```
/** code in component/Foo.js, connect现有组件，配置需要观察的`store`树中的部分state，绑定`action` */
class Foo extends Component{
  //...
  render(){
    return (
      <div>
        <span>{this.props.fooNode.foo}</span>
        <button onClick={this.props.actions.incFoo}>incFoo</button>
      </div>
    );
  }
}
export default connect(
  state => ({
    list: state.list,
    fooNode: state.fooNode,
  }),
  dispatch => ({
    actions: bindActionCreators(fooActionCreator, dispatch)
  })
)(Foo)

/** code in action/foo.js, 配置action纯函数 */
export const incFoo = () =>{
  return {type:'INC_FOO'};
}

/** code in reducer/foo.js, 定义reducer函数 */
function getInitialState() {
  return {
    foo: 1,
    bar: 2,
  };
}

export default function (state = getInitialState(), action) {
  switch (action.type) {
    case 'INC_FOO': {
      state.foo = state.foo + 1;
      return {...state};
    }
    default:{
      return state;
    }
      
  }
}
```

* 在`ant-design-pro`的`dva`世界里，`dva`将`redux`做了一层浅封装，省去了繁琐的定义`action`函数，`connect`时要绑定`action`函数等过程,给了一个命名空间的概览，一个命名空间下可以定义`state`、`effects`、`reducers`这些概念，组件内部`dispatch`的`action`对象的`type`的格式形如`${namespaceName}/${methodName}`,这样`dva`就可以通过解析用户调用`dispatch`函数时派发的`action`对象里的`type`值而直接操作`effects`里的函数，在`effects`里的某个函数块内处理完相应逻辑后，用户可以调用`dva`提供给用户的`put`函数去触发`reducers`里的对应函数去合成新的state，尽管流程上简化了不少，但是归根到底还是不能脱离`redux`的核心理念，需要合成一个新的`state`! 以下示例是ant-design-pro里一个经典的变种`redux`流程写法.
```
/** code in component/Foo.js, connect现有组件，配置需要观察的`store`树中的部分state */
import { connect } from 'dva';

class Foo extends Component{
  //...
  render(){
    return (
      <div>
        <span>{this.props.fooNode.foo}</span>
        <button onClick={()=>this.props.dispatch({type:'fooNode/incFoo', payload:2})}>incFoo</button>
      </div>
    );
  }
}
export default connect(
  state => ({
    list: state.list,
    fooNode: state.fooNode,
  })
)(Foo)

/** code in models/foo.js */
import logService from '@/services/log';

export default {
  namespace: 'fooNode',

  state: {
    foo: 1,
    bar: 1,
  },

  effects: {
    *query({ payload:incNumber }, { call, put }) {
      yield call(logService, incNumber);
      yield put({
        type: 'saveFoo',
        payload: incNumber,
      });
    },
  },

  reducers: {
    saveFoo(state, action) {
      return { ...state, foo:action.payload };
    },
  },
};

```

##### `cc`如何工作？订阅`react-control-center`的部分数据源，当这些部分数据源任意一个部分发生变化时，`cc`主动通知该组件触发渲染
* `cc`和`redux`最大的不同就是，`cc`接管了所有`cc组件`的具体引用，当用户的`react组件`注册成为`cc组件时`，`cc`的`register`函数需要用户配置`ccClassKey`、`module`、`sharedStateKeys`、`globalStateKeys`、`stateToPropMapping`等参数来告诉`cc`怎么对这些具体的引用进行分类，然后`cc`就能够高效并精确的通知哪些`cc组件实例`能够发生新一轮的渲染。
* 实际上当你在`cc组件实例`里调用`this.setState`时,效果和原有的`this.setState`毫无差别，但是其实`cc组件实例`的`this.setState`已近不再是原来的了，这个函数已经被`cc`接管并做了相当多的工作，原来的已经被`cc`保存为`reactSetState`,当你调用`cc组件实例`的`this.setState`，发生的事情大概经过了以下几步
  ![](https://user-gold-cdn.xitu.io/2019/1/21/1686e03f133218ad?w=845&h=784&f=png&s=76088)
* 因为此文主要是介绍和证明[cc](https://github.com/fantasticsoul/react-control-center) 的弱入侵性和灵活性，而`ant-design-pro`里的组件的`state`并不需要被`接管`，所以我们下面的示例写法仅仅使用`cc.connect`函数将组件的状态和`cc.store`打通，这些状态并非从`state`里取，而是从`this.$$propState`里获取，下面的示例注释掉的部分是原`dva`写法,新增的是`cc`的写法.
* (备注：此处仅仅展示关键代码详细代码[见](https://github.com/fantasticsoul/rcc-antd-pro/blob/master/src/routes/Dashboard/Analysis.js) )
```
/** code in src/routes/Dashboard/Analysis.js, */
import React, { Component } from 'react';
// import { connect } from 'dva';
import cc from 'react-control-center';

// @connect(({ chart, loading }) => ({
//   chart,
//   loading: loading.effects['chart/fetch'],
// }))
@cc.connect('Analysis', {
  'chart/*': '',
  'form/*': '', // this is redundant here, just for show isPropStateModuleMode's effect
}, { isPropStateModuleMode: true })
export default class Analysis extends Component {
  state = {
    loading: true,
    salesType: 'all',
    currentTabKey: '',
    rangePickerValue: [],
  }

  componentDidMount() {
    this.$$dispatch({
      module: 'chart', type: 'fetch'
    }).then(() => this.setState({ loading: false }));
    // this.props.dispatch({
    //   type: 'chart/fetch',
    // }).then(() => this.setState({ loading: false }));
  }

  componentWillUnmount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'chart/clear',
    // });
    // this.$$dispatch({ module: 'chart', type: 'clear' });
  }

  handleRangePickerChange = (rangePickerValue) => {
    this.setState({
      rangePickerValue,
    });

    // this.props.dispatch({ type: 'chart/fetchSalesData'});
    this.$$dispatch({ module: 'chart', type: 'fetchSalesData' });
  }

  selectDate = (type) => {
    this.setState({
      rangePickerValue: getTimeDistance(type),
    });

    // this.props.dispatch({ type: 'chart/fetchSalesData' });
    this.$$dispatch({ module: 'chart', type: 'fetchSalesData' });
  }


  render() {
    const { rangePickerValue, salesType, currentTabKey, loading } = this.state;
    console.log('%c@@@ Analysis !!!', 'color:green;border:1px solid green;');
    const {
      visitData,
      visitData2,
      salesData,
      searchData,
      offlineData,
      offlineChartData,
      salesTypeData,
      salesTypeDataOnline,
      salesTypeDataOffline,
    } = this.$$propState.chart;
    // } = this.props.chart;
    
  }
}

```
* models的替换
```
/** 原来的model，code in src/models/chart */
export default {
  namespace: 'chart',

  state: {
    visitData: [],
    visitData2: [],
    salesData: [],
    searchData: [],
    offlineData: [],
    offlineChartData: [],
    salesTypeData: [],
    salesTypeDataOnline: [],
    salesTypeDataOffline: [],
    radarData: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(fakeChartData);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchSalesData(_, { call, put }) {
      const response = yield call(fakeChartData);
      yield put({
        type: 'save',
        payload: {
          salesData: response.salesData,
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setter(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        visitData: [],
        visitData2: [],
        salesData: [],
        searchData: [],
        offlineData: [],
        offlineChartData: [],
        salesTypeData: [],
        salesTypeDataOnline: [],
        salesTypeDataOffline: [],
        radarData: [],
      };
    },
  },
};

/** cc定义的model，code in src/cc-models/chart  */
function getInitialState() {
  return {
    wow: 'wow',
    visitData: [],
    visitData2: [],
    salesData: [],
    searchData: [],
    offlineData: [],
    offlineChartData: [],
    salesTypeData: [],
    salesTypeDataOnline: [],
    salesTypeDataOffline: [],
    radarData: [],
  }
}

export default {
  module:'',
  state:getInitialState(),
  reducer:{
    callAnotherMethod:function*(){
      return {wow:'changeWowValue'};
    }
    fetch:function*() {
      const response = yield fakeChartData();
      return response;
    },
    //这里稍做修改，演示了reducer方法内如何调用其他reducer方法
    fetchSalesData:async function({state, moduleState, dispatch, payload}) {
      console.log(sate, moduleState, payload);
      //这里的dispatch如果不指定module和reducerModule，就隐含的是由最初的在cc实例里触发$$dispatch时计算好的module和reducerModule
      await dispatch({type:'callAnotherMethod'});
      const response = await fakeChartData();
      const salesData = response.salesData;
      return { salesData };
    },
    clear(){
      const originalState = getInitialState();
      return originalState;
    }
  }
}
```
##### 由上可以发现，cc里的`setState`需要的`state`和`dispatch`对应函数返回的`state`，都是react鼓励的`部分state`,你需要改变哪一部分的`state`，就仅仅把这一部分`state`交给`cc`就好了。同时cc也兼容`redux`生态的思路，一切共享的数据源都从`props`注入，而非存储在`state`里。

##### 因为所有的`改变state的行为`都会经过`$$changeState`,所以状态的变化依然是可预测的同时也是可以追踪的，后面cc的迭代版本里会利用`immutable.js`,来让状态树可以回溯，这样`cc`就可以实现`时间旅行`的功能了，敬请期待.
---
##### 注意哦! 现在我仅仅先把两个路由级别的组件交给cc处理, ant pro任然完美工作起立, 这两个路由文件是 `routes/Dashboard/Analysis.js` 和 `routes/Forms/Basic.js`.
##### 同时我也新增了一个路由组件 `routes/Dashboard/CCState.js` 来展示cc强大能力, 这个组件还没有彻底写完，将会被持续更新的, 就像 [我为cc专门写的引导示例一样](https://github.com/fantasticsoul/rcc-simple-demo)，将会很快会为大家带来更多的精彩演示
---
### 希望我亲爱的朋友们花一点时间了解[react-control-center](https://github.com/fantasticsoul/react-control-center)并探索它更多有趣的玩法