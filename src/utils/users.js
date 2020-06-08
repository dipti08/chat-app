const users = []

//addUser,removeUser,getUser,getUserInRoom

const addUser=({id,username,room})=>{
    //clean the date
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate the data
    if(!username||!room){
        return{
            error:'Username and room are required'
        }
    }

    //check for existing user
    //conditions: the user has to be in the same room the person is trying to join. It is ok if there are two Dipti as long as they are in the separate rooms
    const existingUser=users.find((user)=>{  
        return user.room===room && user.username===username
    })

    //validate username
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //store user
    const user={id,username,room}
    users.push(user)
    return {user}
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>{   //findIndex is faster than the filter method
        return user.id===id
    })

    if(index!==-1)
    {
        return users.splice(index,1)[0] //extract the individual that we will be removing
    }
}

const getUser=(id)=>{
    return users.find((user)=>{     //find returns a match if there is one otherwise it will return undefined if there is not match. So, it works very well.
        return user.id===id
    }) 
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

//console.log(users)

//####addUser example#####
// const res=addUser({
//     id:44,
//     username:'dipti',
//     room:'magic shop'
// })
// console.log(res)

//####removeUser example#####
// const removedUser=removeUser(22)
// console.log(removeUser)
// console.log(users)

