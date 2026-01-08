import Message from "../models/Message";
import User from "../models/User.js";

//Get all users except the logged user 
export const getUsersForSidebar = async(req, res)=> {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password");

        //Count the number of non seen messages 
        const unseenMessages = {}
        const promises = filteredUsers.map(async ()=>{
            const messages = await Message.find({senderId: user._id,  
                receiverId:userId, seem: false})
                if(messages.length > 0){
                    unseenMessages[user._id] = messages.length;
                }
        })
        await Promise.all(promises)
        res.json({success: true, users: filteredUsers , unseenMessages })
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message })
    }
}
//Get all messages for selected user 
export const getMessages = async (req , res) => {
    try {
        const {id: selectedUserId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or : [
                {senderId:myId, receiverId, selectedUserId}
            ]
        })



    } catch (error) {
        console,log(error.message);
        res.json({success: false, message: error.message})
    }
}