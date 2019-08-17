

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
    this.setState({ name: e.currentTarget.value });
  }
  render() {
    const { name, age } = this.state;
    return (
      <div>
        hello, 22, {this.state.name}
        <hr />
        <input value={name} onChange={this.changeName} />
      </div>
    )
  }
}

//注意这里，值还是从state取哦，cc组件的state是由 共享的自己所属模块的state 和 共享的$$global模块的state
//加上自己的state合并出来的，这就意味着，如果自己的state的key和观察的模块里的key重复了，会被覆盖的哦

//注册为cc组件，不声明属于任何模块，cc默认改组件属于$$default模块，
//设定sharedStateKeys为*,表示共享所属模块的所有key变化（这里指的就是$$default罗）
//设定globalStateKeys为*，表示共享$$global模块的所有key变化
const CcHello1 = cc.register('Hello', { sharedStateKeys: '*', globalStateKeys: '*' })(Hello);

//r
const A = cc.r('App', { s: '*', g: '*' })(App);

// 我的某个模块的key用着用着，别的模块模块的组件想观察这个key的变化怎么办？
// sharedToGlobalMapping来了，让你把你的指定模块里的key给个别名映射到$$global模块里
// 注意哦，只要你的key和$$global模块里原有的key不重名，可以名字保持不变的哦？

// 讨厌从数据state取上这种设计，我想让我的state保持纯洁如初的感觉怎么办？
// 所有cc组件都属于某一个模块，同时所有cc组件能都能观察$$global模块的变化，
// 我想观察多个模块的变化怎么办，难道我要把所有的key都通过sharedToGlobalMapping映射到$$global里？
// stateToPropMapping来帮你搞定一切