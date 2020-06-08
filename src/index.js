const path=require('path') //this is a core node module so no need to install it
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage, generateLocationMessage}=require("./utils/messages")
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app) //we have created the server outside the express library and configuring it to use our express app
const io=socketio(server) //now our server supports web sockets

const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//connecting the client. 'io.on coonections' allows us to run some code when the client is connected
io.on('connection',(socket)=>{  //socket is an object and contains o=info about the new connection. So, we can use methods on the socket to communicate with the new clients.If I have 5 different clients connected to the server then this code will tun 5 times that one time for each new connection
    console.log('New WebSocket connection')

    socket.on('join',(options,callback)=>{
        const{error,user}=addUser({id:socket.id,...options}) //value of the id comes from the socket id itself

        if(error){
            return callback(error)
        }

        socket.join(user.room)   //socket.join will only have access on the server. This will allow us to join a chatroom and we pass the name of the room we are trying to join

        socket.emit('message',generateMessage('Admin','Welcome!'))  //using Admin as the static username for us
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        //adding the new user to the sidebar
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        //letting the client know that they were able to join
        callback() //calling without any argument that is without any error
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()  //to acknowledge the event
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback() //letting the client know that the event has been acknowledged
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`)) //no need to use broadcast as the user has already left and the message has to be sent to the remaining connected clients
            io.to(user.room).emit('roomData',{  //to remove the users from the sidebar when then leave the chatroom
                room:user.room,
                users:getUsersInRoom(user.room) 
            })
        }
    })

})

//instead of using app.listen, we are using server.listen to start the http server created above
server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})