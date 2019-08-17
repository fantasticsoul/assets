/****
 * react-control-center是什么？
 * react-control-center是一个专门为react定制的，更加智能更加强大却更简单的状态管理框架
 */

/****
// 讨厌从数据state取上这种设计，我想让我的state保持纯洁如初的感觉怎么办？
// 所有cc组件都属于某一个模块，同时所有cc组件能都能观察$$global模块的变化，
// 我想观察多个模块的变化怎么办，难道我要把所有的key都通过sharedToGlobalMapping映射到$$global里？
// stateToPropMapping来帮你搞定一切
 */

var register = cc.register;

//启动cc，声明一个store, 现在我们申明为模块化模式启动cc哦，因为这样，我们可以声明更多的state模块和recuder模块啦
cc.startup(
  {
    isModuleMode: true,
    store: {
      '$$global': {
        signal: 'foo'
      },
      '$$default': {
        hobby: 'react',
        age: 222,
        name: 'this name come from $$global store'
      },
      // 我们再来个foo, bar模块吧
      foo: {
        key1: 'key1',
        key2: 'key2',
        key3: 'key3',
      },
      bar: {
        key1: 'key1',
        key2: 'key2',
        key3: 'key3',
      }
    },
    reducer: {
      //我们为$$default定义一个方法吧
      $$default: {
        async changeName({ payload: name }) {
          console.log(`recevie name ${name}`);
          //我们改造一下这里，改了名字的同时从后端拿个年纪, age就会被重置了哦
          //await sleep(3000);
          const age = await getAgeFromBackend();
          return { name, age };
        },

      },
      //其实reducer模块的名字可以不用和state的模块名字一样哦
      foo: {
        async changeName({ payload: name }) {
          console.log(`receive name ${name}`);
          //await sleep(3000);
          //为了证明的确走了foo reducer模块，我们加一个f
          return { name: `f${name}` };
        },
        changeKey1({ payload }) {
          const { event, dataset, value } = payload;
          return { key1: value };
        }
      }
    },
    sharedToGlobalMapping: {
      foo: {
        key1: 'key1',//这里名字随意哦，只要让global里不会有重名的key就好
      }
    },
    errorHandler: err => console.log(err),
  }
);

async function getAgeFromBackend(ms = 2000) {
  console.log(`mock api request`);
  return 'i am from backend';
}

function changeAge(age, suffix) {
  return { age: age + suffix };
}

//这真的只是一个普通的Hello
class Hello extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: 'normol component',
      age: 22,
      hobby: 'coding',
    };
  }
  changeName = (e) => {
    //我们换一种方式来改变状态
    //this.setState({ name: e.currentTarget.value });
    //this.$$dispatch({ type: 'changeName', payload: e.currentTarget.value });
    //也可以这样写哦
    //this.$$dispatch('changeName', e.currentTarget.value);

    //当前cc实例属于$$default模块，所以默认会找$$default模块的changeName去执行，我们去调用foo模块的changeName吧
    //this.$$dispatch({ reducerModule: 'foo', type: 'changeName', payload: e.currentTarget.value });
    //等同于,这里必须这样写哦，表示去修改$$default模块的数据，用foo reducer模块的changeName方法
    //this.$$dispatch('$$default/foo/changeName', e.currentTarget.value);
    //如果写为这样，表示用当前组件所属state模块且和state模块同名的reducer模块的changeName去改变name咯
    this.$$dispatch('changeName', e.currentTarget.value);
  }
  changeAge = (e) => {
    //这我我们也可以直接用自动的函数去改变age
    //this.setState({ age: e.currentTarget.value });
    //effect上场了
    //this.$$effect('$$default', changeAge,  e.currentTarget.value, 'effect');
    //effect必须指定具体的state模块名，当前组件明明属于$$default模块，可不可以不指定呢？invoke上场了
    this.$$invoke(changeAge, e.currentTarget.value, 'invoke');
  }
  changeHobby = (e) => {
    this.setState({ hobby: e.currentTarget.value });
  }

  render() {
    //这里可以取到key1了，因为sharedToGlobalMapping设定把它映射到$$global模块里了
    const { name, age, hobby, key1 } = this.state;
    console.log(this.$$propState);
    //这里出bug了，应该是foo_key1发生变化才对，需要fix，见谅
    //今天的入门就到此为止吧
    const { foo_key1, foo_key2, bar_key1 } = this.$$propState;
    return (
      <div style={{ borderBottom: '3px solid green', marginTop: '6px' }}>
        hello,<span>{this.cc.ccState.ccClassKey}</span>
        my name is <span>{name}</span>,
              age is <span>{age}</span>,
              hobby is <span>{hobby}</span>,
              key1 is <span>{key1}</span>,
              foo_key1 is <span>{bar_key1}</span>,
                <hr />
        <input value={name} onChange={this.changeName} />
        <input value={age} onChange={this.changeAge} />
        <input value={hobby} onChange={this.changeHobby} />
        <hr />
      </div>
    )
  }
}

//写一个组件改变foo模块的key1
class Foo extends React.Component {
  render() {
    //这里直接用domDispatch哦
    const key1 = this.state.key1;
    return <input data-ccm="foo" data-ccrm="foo" data-cct="changeKey1" value={key1} onChange={this.$$domDispatch} />
  }
}
const CcFoo = register('Foo', { module: 'foo', sharedStateKeys: '*' })(Foo);

//注册为cc组件，不声明属于任何模块，cc默认改组件属于$$default模块，
//设定sharedStateKeys为*,表示共享所属模块的所有key变化（这里指的就是$$default罗）
//设定globalStateKeys为*，表示共享$$global模块的所有key变化

// 通过stateToPropMapping设定，这些模块的key都绑定到cc实例的$$propState上了，任何一个发生变化，都会通知CcHello1实例哦
const CcHello1 = register('Hello', {
  sharedStateKeys: '*', globalStateKeys: '*', stateToPropMapping: {
    'foo/key1': 'foo_key1',
    'foo/key2': 'foo_key2',
    'bar/key1': 'bar_key1',
  }
})(Hello);

const CcHello1 = register('Hello', { sharedStateKeys: '*', globalStateKeys: '*'})(Hello);

// 我们再来注册一个，这个额cc实例只观察name的变化, 现在CcHello2的age是独立的了，没有存储到store里哦，而且多个CcHello2实例的age变化是不会影响其他实例的啦
const CcHello2 = register('Hello2', { sharedStateKeys: ['name'] })(Hello);

// 我们注册一个为CcHello3，他属于$$default模块，可是也想观察foo模块的key1的变化怎么办呢,我们需要把foo模块的key1映射到$$global里就可以了
const CcHello3 = register('Hello3', { globalStateKeys: ['key1'] })(Hello);

class App extends React.Component {
  // <CcHello1 />
  // <CcHello1 />
  // <CcHello2 />
  // <CcHello2 />
  // <CcHello2 />
  render() {
    return (
      <div>
        {/*让我们多来实例化一个cc组件*/}
        <CcHello1 />

        <CcFoo />
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div>
        <Hello />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));