# Concent, born for build large scale and high performance react app

Hello, dear react developers, I am fantasticsoul who come from China, I've been using react for years, and now I want to recommend my totally new state management solution for react --- **Concent**!

If this article is two long for you, you can just experience the two demos below:
- [js version](https://codesandbox.io/s/concent-guide-xvcej)
- [ts version](https://codesandbox.io/s/concent-guide-ts-zrxd5)

Star [Concent](https://github.com/concentjs/concent) if you are interested in it, I will appreciate it greatly.

I've made a lot of work on it to make it easy to use and run in a high performance mode, so I really hope you guys can finish reading this article instead of going away.

Concent is not a `redux` wrapper lib or `mobx` wrapper lib, it is just a totally new state management solution as I mentioned above, and include many advanced features.

Unlike `vue`'s reactive mechanism，we all know react is a immutability UI framework, but some third party lib can turn it to be reactive like `mobx`, but Concent change nothing, it encourage you write react style code, and the most important thing is write less but do more when you use Concent^_^

## Rethink react's setState
react give us two interface to tell it re-render ui, they are `setState` and `forceUpdate`, mostly we use `setState` in our code, now what we are going to talk about is why we should rethink `setState`?

at first let's see how `redux` works:
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z2.png)
yeah, it is just as easy as you see, but people don't like write too many glue code when they use `redux`&`react-redux`, so many improved version of Redux was born for example `rematch` and so on.

then let's see another one `mobx`:
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z3.png)
may be one of you are using it.

What I want to ask you is are they really really good enough for now or in the future?

Except the two I mentioned above, react build-in state management `context api`(including hook useReducer & useContext etc...) is also quite popular in developers.

I know you guys may disagree: 'hey man, you miss unstated and etc...'

Cool, I know I missed many, and I guess some of you even have written your own state management in your project.

But as far as I know no state management is similar to `Concent` for the time being, so I believe it is worth trying.

Ok, let's get back to the subject, see what `setState` offer us, in the official document, its function description is like this:
```ts
setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
    callback?: () => void
): void;
```
> 
let me write a pic to show how it works
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z5.png)
hmm, it is really simple, but can you find out what is wrong? actually in the pic `state` is not a accurate word, we'll find the right one id `partial state` by reviewing the function description, so now I write a new pic to show how it works
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z6.png)

so we know from the beginning that which state key's value will be changed, right? 
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z7.png)

what if we make a state management framework just by using `setState`, is it sounds cool? `Concent` did it!
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z8.png)

obviously we should take over `setState`
```js
//pseudo code
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

## Dependency mark
of course, as a framework provider, we must not let developer write these code in the `constructor`, so we design two key interface `run` and `register`, `run` is responsible for loading the model configuration, `register` is responsible for register your normal component to be concent component, and the concent component's usage is just like the normal component！
```js
//concent demo code
import { run, register } from 'concent';

run({
  foo:{//foo model definition
    state:{
      name: 'concent',
      age: 22,
      info: { publishTime:'', gitUrl:''},
    }
  }
})

@register('foo')
class Foo extends Component {
  changeName = ()=> {
    // the setState now can commit state to store!
    this.setState({ name: e.currentTarget.value });
  }
  render(){
    const { name } = this.state;
    return <input value={name} onChange={this.changeName} />
  }
}

```
look this component, it is exactly the same as a normal component, except for the state of no declaration, so it is very very easy to add state management `Concent` ^_^。

Attention if you declare state in your class component like below, the `name` is duplicate with foo module's state key name, so the value will been overwrite before first render, but the `privName` will been treated as the instance's private state
```js
@register('foo')
class Foo extends Component {
  state = {name: 'xxx', privName:'yyy'}
  render(){
    const { name, privName } = this.state;
    console.log(name, privName);
    // result is: concent yyy
  }
}
```
So when you initialize 2 ins of `Foo`, any one change `name` field, another one will receive the latest `name` value, and if you register or connect another component to `foo` module, their instance will also receive the latest `name` value and been rendered.
```js
@register('foo')
class Comp2 extends Component {
  render(){
    const { name, privName } = this.state;
  }
}

// this component connect 2 modules 'foo' and 'bar'
@register({ connect:['foo', 'bar']})
class Comp3 extends Component {
  render(){
    const { foo, bar } = this.ctx.connectedState;
    const { name } = foo;
  }
}
```
This design can let user share multi module state very easily, and I know some of you will question me:'what the `this.ctx` is? where does it come from?'

Every Concent component will have a property called `ctx`, it stored meta data to let Concent know what module it belongs to, what modules it connect, which state keys it watch in a module ant etc, and also it offer user many methods to enhance react component ability!

So that is the most important reason why I say:" Concent, born for build large scale and high performance react app!", with meta data, Concent know how to send the state quickly and correctly to other instance if any Concent instance change its own state!

I call it **dependency mark**!
```js
// this component belong to foo module
// but it only care name's value change
@register({module:'foo', watchedKeys:['name']})
class Comp4 extends Component {
  render(){
    const { name } = this.state;// equal as this.ctx.state
  }
}

// this component belong to foo module
// but it only care age's value change
@register({module:'foo', watchedKeys:['age']})
class Comp5 extends Component {
  render(){
    const { age } = this.state;// equal as this.ctx.state
  }
}

// this component connect to foo and bar modules
// but it only care age's value change of foo module
// and all state keys value change of bar module
@register({connect:{ foo:['age'], bar:'*' }})
class Comp5 extends Component {
  render(){
    const { foo, bar } = this.ctx.connected;
  }
}
```

Concent component's state source and render timing is controlled by Concent with dependency mark

![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z10.png)
So like react attach a property named `_reactInternalFiber` to achieve its `Fiber architecture`, Concent attach a property named `ctx` for every Concent instance to build a logic level state management.
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd1.png)
And Concent and easily update target instance with the least cost
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd2.png)
Concent will generate a unique key for every instance, so any state changing can be tracked by more details you want to know, see the pic below, when you put a [concent-plugin-redux-devtool](https://github.com/concentjs/concent-plugin-redux-devtool) to concent app's plugins, it will record every state changing behavior.
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z22.png)
Then we can mark a component with a ccClassKey and a tag to let `ccUniqueKey` more readable
```js
@register({module:'foo', tag:'xxx'}, 'Comp4')
class Comp4 extends Component {
  render(){
    const { name } = this.state;// equal as this.ctx.state
  }
}
```
now ccUniqueKey will be something like `Comp4_xxx_1`.

## Elegant coding way
As Concent knows which key's value changed from the beginning, so Concent can easily implement computed and watch like `vue`
> computed function will been triggered only if any value of its depKeys changed

![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd3.png)
A whole module config is like below:
```js
run({
  foo:{//foo model definition
    state:{
      firstName: 'concent',
      lastName: 'concent'
    },
    reducer:{// optional
      async changeFirstName(payload, moduleState, actionCtx){
        await api.changeFirstName(payload)
        return {firstName:payload}
      },
      async changeLastName(payload, moduleState, actionCtx){
        await api.changeLastName(payload)
        return {firstName:payload}
      }
      async changeName(payload, moduleState, actionCtx){
        await actionCtx.dispatch('changeFirstName', payload);
        await actionCtx.dispatch('changeLastName', payload);
      }
    },
    computed:{// optional
      firstName(newVal, oldVal){
        return `==${newVal}==`;
      },
      lastName(newVal, oldVal){
        return `++${newVal}++`;
      },
      fullName:{
        fn(newState, oldState){
          return `${newState.firstName} ${newState.lastName}`;
        },
        // any value of firstName or lastName changed will trigger this computed
        depKeys:['firstName', 'lastName'],
      }
    },
    watch:{// optional
      firstName(newVal, oldVal){
        console.log('do some async task here');
      },
    },
    // optional, set module state async
    init: async ()=>{
      const state = await api.getState();
      return state;
    }
  }
})
```
computed value can get in ctx
```js
@register({module:'foo'})
class Comp4 extends Component {
  render(){
    const { firstName } = this.ctx.moduleComputed;
  }
}

@register({connect:['foo']})
class Comp4 extends Component {
  render(){
    const { foo } = this.ctx.connectedComputed;
    //foo.firstName
  }
}
```

Of course, I strongly recommend you to write them into different files, because they have clear and different responsibilities
```
src
├─ ...
└─ page
│  ├─ login
│  │  ├─ model //business logic model
│  │  │  ├─ state.js
│  │  │  ├─ reducer.js
│  │  │  ├─ computed.js
│  │  │  ├─ watch.js
│  │  │  ├─ init.js
│  │  │  └─ index.js // compose other module config item to export
│  │  └─ Login.js
│  └─ product ...
│  
└─ component
   └─ ConfirmDialog
      ├─ model // component model
      └─ index.js
```
And in reducer file, you can pass function reference to dispatch instead of string, now the reducer definition is more beautiful than you see before, right?
pure function and effect function and been defined in a same file, if you declare a normal function, it is pure, if you declare a async function ,it is effect^_^
```js
// code in models/foo/reducer.js
export function pureChangeFirstName(payload, moduleState, actionCtx){
  return {firstName:payload}
}

export async changeFirstName(payload, moduleState, actionCtx){
  await api.changeFirstName(payload)
  return {firstName:payload}
},
export async changeLastName(payload, moduleState, actionCtx){
  await api.changeLastName(payload)
  return {lastName:payload}
}

// composing other function is very easy
export async changeName(payload, moduleState, actionCtx){
  // await actionCtx.dispatch('changeFirstName');
  // await actionCtx.dispatch('changeLastName');
  await actionCtx.dispatch(changeFirstName, payload);
  await actionCtx.dispatch(changeLastName, payload);
}
export async changeNameWithLoading(payload, moduleState, actionCtx){
  await actionCtx.setState({loading: true});
  await actionCtx.dispatch(changeName);
  return {loading: false};// or actionCtx.setState({loading: false});
}
```

## Amazing setup
`Setup` feature is the most important feature in Concent, the class and function share the business logic code elegantly with setup, so you switch your component mode between class and function anytime you want.

let's introduce api `useConcent` first, its ability just like `register`, but it works for function component! and the `ctx`'s shape is 100% the same no matter it is come from class or function!
```js
import { register, useConcent } from 'concent';

@register({module:'foo', watchedKeys:['name']})
class Comp4 extends Component {
  render(){
    const { name } = this.state;// equal as this.ctx.state
  }
}

//============== switch to function
function Comp4Fn(props){
  const ctx = useConcent({module:'foo', watchedKeys:['name']});
  const { name } = ctx.state;
  // return you ui
}
```

let us open our imagination, we can treat hook as a special portal in react, it offer us amazing features like define state, define effect and etc.

So Concent use hook ability to create setup feature, now you can define component like this:
```js
import { registerHookComp, useConcent } from "concent";

const iState = ()=> ({
  visible: false,
  activeKeys: [],
  name: '',
});

// setup will only been executed before component instance first rendering
const setup = ctx => {
  //define event on
  ctx.on("openMenu", (eventParam) => { /** code here */ });
  // defined ref computed, but mostly I suggest use module computed firstly!
  ctx.computed("visible", (newVal, oldVal) => { /** code here */ });
  // defined ref watch, but mostly I suggest use module computed firstly!
  ctx.watch("visible", (newVal, oldVal) => { /** code here */ });
  ctx.effect( () => { 
     /** code here */ 
     return ()=>console.log('clean up');
   }, []);
   // if visible or name changed, this effect callback will been triggered!
   ctx.effect( () => { /** code here */ }, ['visible', 'name']);
   ctx.effect( () => { /** will been triggered in every render period */ });
   // second param[depStateKeys] pass null means effect cb will been executed after every render
   // third param[immediate] pass false means let Concent ignore it after first render
   ctx.effect( () => { /** mock componentDidUpdate */ }, null, false);
  
  const doFoo = param =>  ctx.dispatch('doFoo', param);
  const doBar = param =>  ctx.dispatch('doBar', param);
  const emitSomething =() =>  ctx.emit('emitSomething', param);
  const syncName = ctx.sync('name');
  
  return { doFoo, doBar, syncName, emitSomething };
};

const render = ctx => {
  const {state, settings} = ctx;

  return (
    <div className="ccMenu">
      <input value={state.name} onChange={settings.syncName} />
      <button onClick={settings.doFoo}>doFoo</button>
      <button onClick={settings.doBar}>doBar</button>
    </div>
  );
};

// registerHookComp is implemented based on useConcent
export default registerHookComp({
  state: iState, 
  setup,  
  module:'foo',
  render
});

// so the default export is equal as code below:
export React.memo(function(props){
  const ctx = useConcent({
      state: iState, 
      setup,  
      module:'foo',
  });
 
  const {state, settings} = ctx;
  // return your ui
})
```
and the class also can reuse the setup!
```js
@register({module:'foo', setup})
class Comp4 extends Component {
  state = iState()
  render(){
    const { doFoo, doBar, syncName, emitSomething } = this.ctx.settings;
    // return your ui
  }
}
```

If you guys are confused about the code above, just try the online demo in CodeSandbox(I highly recommend you try^_^):   

- [js version](https://codesandbox.io/s/concent-guide-xvcej)
- [ts version](https://codesandbox.io/s/concent-guide-ts-zrxd5)

with setup:

* the class component and function component can share the business logic code elegantly!!!

* no effect definition or state definition in every render time any more


## High performance
With dependency mark, Concent already offer you high performance rendering reconcile in another level, but I will tell more about why it is high performance except for the reason **dependency mark**.

### Render key
This renderKey feature is different from react's key, think about the scene, wo have a book list in store, and a container component to consume the list, by traversing the list  we render many `BookItem`, every `BookItem` can change its own state in store by reducer function, in traditional redux, any one `BookItem` instance change its own state will lead all `BookItem` instance rendered again!
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd4.png)

but in Concent, if you mark renderKey in dispatch call, it means this change behavior only trigger current instance render, ignore the same component's other component.
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/rk5.gif)

!!!!!!**[try renderKey online](https://stackblitz.com/edit/concent-todolist-render-key)**!!!!!!

and I have made a comparison between Redux and Concent
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd6.png)

### Lazy dispatch
Before I explain why we need `lazyDispatch`, we review our reducer writing style.
Concent allow user split reducer into very small piece(you can even define a reducer only update one state key's value), and combine them again, it will create a reducer function call chain.
```js
// code in models/foo/reducer.js
export function pureChangeFirstName(payload, moduleState, actionCtx){
  return {firstName:payload}
}

export async changeFirstName(payload, moduleState, actionCtx){
  await api.changeFirstName(payload)
  return {firstName:payload}
},
export async changeLastName(payload, moduleState, actionCtx){
  await api.changeLastName(payload)
  return {lastName:payload}
}

export async changeName(payload, moduleState, actionCtx){
  await actionCtx.dispatch(changeFirstName, payload);
  await actionCtx.dispatch(changeLastName, payload);
}
export async changeNameWithLoading(payload, moduleState, actionCtx){
  await actionCtx.setState({loading: true});
  await actionCtx.dispatch(changeName);
  return {loading: false};// or actionCtx.setState({loading: false});
}
```
but the problem is any reducer if it returns a new partial state will trigger send a render signal to Concent(Concent will call react's setState finally).
```js
//in your view
<button onClick={this.ctx.dispatch('changeNameWithLoading')}>changeNameWithLoading</button>
```
the reducer function call chain will trigger many times render.
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z15.png)
if you use lazy dispatch
```js
//in your view
<button onClick={this.ctx.lazyDispatch('changeNameWithLoading')}>changeNameWithLoading</button>
```
the call chain processing will like below:
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z17.png)
and the effect is like below:
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z16.gif)

!!!!!!**[try lazyDispatch online](https://stackblitz.com/edit/concent-lazy-dispatch)**!!!!!!

## Ending
Star [Concent](https://github.com/concentjs/concent) if you are interested in it, I will appreciate it greatly o(╥﹏╥)o, any question if you have can been post on git issues, or send them to my email: zhongzhengkai@gmail.com
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/dd7.png)

### Concent state distribution process
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z21.png)

### Concent component instance life cycle
![](https://raw.githubusercontent.com/fantasticsoul/assets/master/img/cc/z20.png)

