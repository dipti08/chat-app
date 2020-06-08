const socket= io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages') //this is the messages div of index.html

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{  //reuiqred for scrolling through the messages
    //new message element
    const $newMessage=$messages.lastElementChild

    //Height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //height of message container which gives us the total height we are able to scroll through
    const containerHeight=$messages.scrollHeight

    //how far we have scrolled that how close we are to the bottom --> (top-topOfScrollbar)+heightOfScrollbar will tell how close we are to the bottom or how we have scrolled
    //scrollTop will tell us the amount of distance we have scrolled from the top
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault() //prevent the default behaviour where the brwoser goes for the full page refresh

    // disable the form
    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{     //sendMessage is an event and the message is the callback function    
        //enable the form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=' '
        $messageFormInput.focus()

        //() is going to run when the message is acknowledged
        if(error){
            return console.log(error)
        }
        
        console.log('Message Delivered')
    }) 
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{        //'join' event is going to accept the username we want to use and the room we want to join and on the backend will attempt to get that done
    //if something goes wrong, the client can use that message to show to the user
    if(error){
        alert(error)
        location.href='/'   //redirect them to the home page
    }
}) 

