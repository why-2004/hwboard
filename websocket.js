const db = require("./controllers");
const auth = require("./auth");
const cookieParser = require('socket.io-cookie-parser');


let initialized = false;

//export so that accessible in app.js
//server param is a http server
exports.createServer = function(server){
  //Create websocket server from http server
  const io = require('socket.io')(server);

  //Load hwboard configuration
  const {CI:testing,HOSTNAME,PORT:port,COOKIE_SECRET:cookieSecret,MS_CLIENTID:clientId} = require("./loadConfig");

  //Prevent CSRF (sort of) by only allowing specific origins
  //Could origin spoofing be possible?
  io.origins((origin,callback)=>{
    const origins = ["https://"+HOSTNAME,"http://localhost:"+port];
    if(testing){
      //Socket-io client origin is * for some reason
      //TODO find out why and avoid if possible
      if(origin=="*"){
        console.log("\033[0;32mOrigin "+origin+" was authorised\033[0m");
        return callback(null,true);
      }
    }
    for (const authOrigin of origins){
      if(origin.startsWith(authOrigin)){
        console.log("\033[0;32mOrigin "+origin+" was authorised\033[0m");
        return callback(null,true);
      }
    }
    console.log("\033[0;31mOrigin "+origin+" was blocked\033[0m");
    return callback("Not authorised",false);
  });

  //For cookies
  io.use(cookieParser(cookieSecret));
  io.on('connection',function(socket){
    console.log("User connected");
    //Start socket.io code here

    //Send uncaught errors, eg `callback is not a function` to client
    const uncaughtErrorHandler = require("./websocket-routes/error")(socket)

    //Authentication
    ;(async ()=>{
      socket.ready = false;
      //Tell client socket status
      socket.on("isReady",(_,callback)=>{
        (async ()=>{
          callback(socket.ready);
        })().catch(uncaughtErrorHandler);
      });
      //Authenticate user on connection
      //You can access cookies in websockets too!
      const token = socket.request.signedCookies.token;
      if(db.getNumTables()==0){
        await db.init();
      }
      if(!initialized){
        for(const channel of (await db.getUserChannels("*"))){
          await db.whenHomeworkExpires(channel.name,async()=>{
            const data = await db.getHomework(channel.name);
            io.to(channel.name).emit("data",data);
          });
        }
        initialized=true;
      }
      if(socket.request.signedCookies.username){
        socket.userData = {
          preferred_username:socket.request.signedCookies.username
        };
        socket.username = socket.userData.preferred_username;
        const channels = await db.getUserChannels(socket.username);
        for (const channel of channels){
          socket.join(channel.name);
        }
      }else if(testing){
        //In testing mode
        socket.userData = {
          name:"tester",
          preferred_username:"tester@nushigh.edu.sg"
        };
        socket.username = "tester@nushigh.edu.sg";
        const channels = await db.getUserChannels(socket.username);
        for (const channel of channels){
          socket.join(channel.name);
        }
      }else{
        //In production, verify token
        try{
          const tokenClaims = await auth.verifyToken(token);
          socket.userData = tokenClaims;
          socket.username = socket.userData.preferred_username;
          const channels = await db.getUserChannels(socket.username);
          console.log("Authed");
          for (let channel of channels){
            //Add user to rooms
            //Client will receive relevant events emitted to these rooms,
            //but not others
            socket.join(channel.name);
          }
        }catch(e){
          //Problem with token, perhaps spoofed token?
          //Anyway get rid of this socket
          //Redirect to auth url
          const scopes = ["user.read","openid","profile"];
          const url = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"+
          "response_type=code&"+
          `scope=https%3A%2F%2Fgraph.microsoft.com%2F${scopes.join("%20")}&`+
          `client_id=${clientId}&`+
          `redirect_uri=https://${HOSTNAME}/&`+
          "prompt=select_account&"+
          `response_mode=query`;
          console.log("Forced disconnect");
          socket.emit("authError",url);
          socket.disconnect();
        }
      }
    })()
      .then(async ()=>{
      //Administration
        require("./websocket-routes/admin")(socket,io);

        //Homework ops
        require("./websocket-routes/homework")(socket,io);

        //Student data
        require("./websocket-routes/students-api")(socket);
        //Stats
        require("./websocket-routes/analytics")(socket);

        //For tests
        require("./websocket-routes/tests")(socket);

        socket.ready = true;
        return socket.emit("ready");
      })
      .catch(uncaughtErrorHandler);

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
  });
  module.exports.getSocketById = id=>{
    for(const socketId in io.sockets.sockets){
      if(id===io.sockets.sockets[socketId].userData.preferred_username){
        return io.sockets.sockets[socketId];
      }
    }
  };
  return io;
};

//Function to get permission level
module.exports.getPermissionLvl = (email,channelData) => {
  if(email==="*") return 3;
  if(channelData.roots.includes(email)){
    return 3;
  }else if(channelData.admins.includes(email)){
    return 2;
  }else if(channelData.members.includes(email)){
    return 1;
  }else{
    return 0;
  }
};
