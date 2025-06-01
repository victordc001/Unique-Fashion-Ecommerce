
import express from 'express'; 
import mongoose from 'mongoose';


const contactSchema = new mongoose.Schema({
      
        sendername : {
                  type : String,
                  required : true,
        }, 

        senderemail : {
            type : String,
            required : true,
        },

        sendersubject : {
            type : String,
            required : true,
        },

        sendermessage : {
            type : String,
            required : true,
        }

}); 

const Contact = mongoose.model('Contacters', contactSchema);
//module.exports = Contact;
export default Contact;
