`
span{
  padding:2px 6px;
  background-color: #EF978A;
  color:white;
}
`
`
react-control-center是什么?
react-control-center是一个专门为react定制的，
更加智能更加强大却更简单的状态管理框架
`


cc.startup(
  {
      store: {
          '$$global': {
              name: 11
          },
          '$$default': {
              age: 22
          }
      },
      errorHandler:err=>console.log(err),
  }
);


function sleep(ms = 2000) {
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          resolve();
      }, ms)
  });
}

async function getAgeFromBackend(ms = 2000) {
  console.log(`mock api request`);
  return 'i am from backend';
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
      this.setState({ name: e.currentTarget.value });
  }
  render() {
      const { name, age, hobby } = this.state;
      return (
          <div>
              hello,
              my name is <span>{name}</span>,
              age is <span>{age}</span>,
              hobby is <span>{hobby}</span>
              <hr />
              <input value={name} onChange={this.changeName} />
          </div>
      )
  }
}