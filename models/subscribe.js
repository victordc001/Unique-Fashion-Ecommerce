
import express from 'express'; 
import mongoose from 'mongoose';  

const SubscribeSchema = new mongoose.Schema({
         
      name : {
        type : String,
      }, 

      email : {
          type : String,
      },
}); 

const Subs = mongoose.model('Subscribers', SubscribeSchema);
export default Subs;