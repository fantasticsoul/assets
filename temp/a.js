
/****
 * @param {string} ccClassKey a cc class's name, you can register a same react class to cc with different ccClassKey,
 * but you can not register multi react class with a same ccClassKey!
 * @param {object} registerOption
 * @param {string} [registerOption.module] declare which module current cc class belong to
 * @param {Array<string>|string} [registerOption.sharedStateKeys] 
 * @param {Array<string>|string} [registerOption.globalStateKeys]
 */
exports.register = function(ccClassKey, registerOption){

}



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

const CCWow = cc.register('Wow',{sharedStateKeys:'*'})(Wow);

const HelloFoo = cc.register('HelloFoo',{module:'foo',sharedStateKeys:'*'})(Hello);
const HelloBar= cc.register('HelloBar',{module:'bar',sharedStateKeys:'*'})(Hello);
const CCWow = cc.register('Wow',{sharedStateKeys:'*'})(Wow);
<br />
<HelloFoo title="cc instance3 of module foo"/>
<HelloFoo title="cc instance3 of module foo"/>
<br />
<HelloBar title="cc instance3 of module bar"/>
<HelloBar title="cc instance3 of module bar"/>
<br />
<CCWow />
<CCWow />
<CCWow />

this.$$dispatch( 'foo/foo/changeName', name );
this.$$dispatch({ module: 'foo', reducerModule:'foo',type: 'changeName', payload: name });

foo:{
  changeName({payload:name}){
    console.log('changeName', name);
    return {name};
  }
}


async function mockUploadNameToBackend(name){
  return 'name uploaded'
}

awardYou:function ({dispatch}) {
  const award = '恭喜你中奖500万';
  Promise.all([
    dispatch('foo/changeName', award),
    dispatch('bar/foo/changeName', award)
  ]);
},
changeNameWithAward: function ({ module, dispatch, payload: name }) {
  console.log('changeNameWithAward', module, name);
  if (module === 'foo' && name === '666') {
    dispatch('foo/awardYou');
  } else {
    console.log('changeName');
    dispatch(`${module}/foo/changeName`, name);
  }
}



function myChangeName(name, prefix) {
  return { name: `${prefix}${name}` };
}

if (name === '888') {
  const currentModule = this.cc.ccState.module;
  this.$$effect(currentModule, myChangeName, name, 'eee');
} else {
  this.$$dispatch({ reducerModule: 'foo', type: 'changeNameWithAward', payload: name });
}
const lazyMs = name === '222' ? 3000: -1;

componentDidMount(){
  this.$$on('999',(from, wording)=>{
    console.log(`%c${from}, ${wording}`,'color:red;border:1px solid red' );
  });
  if(this.props.ccKey=='9999'){
    this.$$onIdentity('9999','9999',(from, wording)=>{
      console.log(`%c${from}, ${wording}`,'color:red;border:1px solid red' );
    });
  }
}

if(name === '999'){
  this.$$emit('999', this.cc.ccState.ccUniqueKey, 'hello');
}else if(name === '9999'){
  this.$$emitIdentity('9999', '9999', this.cc.ccState.ccUniqueKey, 'hello');
}

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

$$computed() {
  return {
    name(name) {
      return name.split('').reverse().join('');
    }
  }
}

const { name: reversedName } = this.$$refComputed;
<div>{reversedName}</div>