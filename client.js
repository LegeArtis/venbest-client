const socketPub = require('zeromq').socket("pub");
const socketSub = require('zeromq').socket("sub");
const readLine = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

const askData = ()=> {
    let data = {type: 'login'};
  readLine.question('Please enter your login/email => ', answer =>{
      data.email = answer;
      readLine.question('Please enter your password => ', answer =>{
          data.pwd = answer.toString();
          data.msg_id = 'Hello server!';

          const stringifyData = JSON.stringify(data);
          socketPub.send(['api_in', stringifyData]);
      });
  });

};

const zeroMQConnect = (subPort, pubPort)=> {
    socketPub.bindSync(`tcp://127.0.0.1:${pubPort}`);
    socketSub.connect(`tcp://127.0.0.1:${subPort}`);
    console.log('Published bound to port', pubPort);
    console.log('Subscribe connected to port', subPort);
    socketSub.subscribe('api_out');

    socketSub.on('message', (topic, message)=> {
        const data = JSON.parse(message);
        if (data.status === 'ok'){
            console.log('ok');
        } else {
            console.warn(data.error);
        }
        readLine.question('Do you want to send one more? press y(yes) or n(no) => ', answer =>{
            if (answer === 'y') {
                askData();
            }
        });
    });
};

const askPort = ()=> {
    let pubPort;
    let subPort;

    readLine.question('Please enter pub port => ', answer => {
        console.log('Pub port is:', answer);
        pubPort = +answer;
        readLine.question('Please enter sub port => ', answer => {
            console.log('Sub port is:', answer);
            subPort = +answer;
            if (typeof subPort === "number" && typeof pubPort === "number") {
                zeroMQConnect(subPort, pubPort);
                askData();
            } else {
                console.error('Enter correct port!');
                askPort();
            }
        });
    });
};

askPort();


