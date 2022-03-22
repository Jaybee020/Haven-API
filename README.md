
# Haven 

This is the REST API of Haven space,an end to end encrypted messaging platform written in typescript.
## Download and Build on local
Clone the repository
```bash
    git clone https://github.com/Jaybee020/Haven-API.git
```

Install node dependencies
```bash
   npm install
```

To start the express server 

```bash
  npm start
```

Open your local browser and verify the server is running with `http://localhost:8000/`






## API Reference

#### Create a new user 

```http
POST /register
```
All parameters are to be in req.body
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. Username of new user |
| `email` | `string` | **Required**. Email of new user |
| `password` | `string` | **Required**. Password of new user |

response.body
```bash
    {message:"Your account was succesfully created"}
```

#### Log in existing user
```http
POST /login
```
All parameters are to be in req.body
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `email` | `string` | **Required**. Email of existing user |
| `password` | `string` | **Required**. Password of existing user |

response.body
```bash
{message:"Successful Login",token:token}
```
#### Logout existing user
```http
GET /logout
```
response.body
```bash
   { message: "Logging out user" }
```

#### get authenticated user details
```http
GET /user/auth
```
response.body
```bash
   userData: {username: req.user?.username,
   email: req.user?.email,}
```

#### get all user details
```http
GET /user/auth
```
response.body
```bash
   userData: {username: req.user?.username,
   email: req.user?.email,}
```

#### get all registered users
```http
GET /user/allUsers
```
response.body
```bash
   {allusers:{
            username:user.username,
            email:user.email,
            date_created:user.date_created}[]
    }
```

### Get the userdata of the specified user
```http
GET /user/:username
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user |


response.body
```bash
   {username:user.username,
    email:user.email,
    date_joined:user.date_created
    }
```

### Send a request to an existing user you are not friends with
```http
POST /user/sendRequest
```
All parameters are to be in req.body
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user |


response.body
```bash
   { message:"Your friend request has been created"}
```


### Get all sent and received request for specified user
```http
GET /user/friendRequest/:username
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user to send request to |

response.body
```bash
{   sent:{
        requester:Types.ObjectId,
        recipient:Types.ObjectId,
        date_created:Date,
        status:Boolean,
        date_accepted:Date,
}[],
    received:{
        requester:Types.ObjectId,
        recipient:Types.ObjectId,
        date_created:Date,
        status:Boolean,
        date_accepted:Date,
}[]
        }
```
### Accept a sent friendrequest from another user
```http
PUT /user/acceptRequest
```
All parameters are to be in req.body
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user to accept request|

response.body
```bash
{ message:"Your friend Request has been updated"}
```


### Get all friends of specified user
```http
GET /user/friends/:username
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user to see friends of|

response.body
```bash
{friends:Types.ObjectId[]}
```

### Delete a user from friends list
```http
DELETE /user/friend/:username
```
All parameters are to be in URL
| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `username` | `string` | **Required**. username of existing user to delete from friends|

response.body
```bash
{message:"Successfully removed"+username+"from your friends"}
```





## Demo
Working link at https://jaybee-haven.herokuapp.com



