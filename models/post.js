const mongoose=require("mongoose");
const {Schema}=mongoose;
const postSchema=new mongoose.Schema({
    name:String,
    image:String,
    description:String,
    author:{
    id:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
    
},
    category:String, 
    status:String

})
module.exports=mongoose.model("post",postSchema);

