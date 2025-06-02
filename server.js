 
   
  import express from 'express';  
  const app = express();
  import ejs from 'ejs';  
  import axios from 'axios'; 
  import fs from 'fs';  
  
  import fetch from 'node-fetch'; 
  import got from 'got'; 
  import Flutterwave from 'flutterwave-node-v3'; 
  import dotenv from 'dotenv';
  dotenv.config();   
 import mongodb from 'mongodb';
  import mongoose from 'mongoose';   

  mongoose.connect(process.env.MONGOOSE_CONNECTION).then(()=>{console.log('success')}).catch((err)=>{console.error(err)});        
   
  const validationString = process.env.VALIDATION_STRING; 
  
  import cookieParser from 'cookie-parser';
  import cors from 'cors';  
   
  import url from 'url';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path'; 
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
     
  import session from 'express-session'; 
  import passport from'passport';
  import passportLocal from 'passport-local';
  //const LocalStrategy = passportLocal.Strategy;
  import { Strategy as LocalStrategy } from 'passport-local';
import passportLocalMongoose from 'passport-local-mongoose';
import { ensureLoggedIn } from 'connect-ensure-login';
import bcrypt from 'bcryptjs';
  const saltRounds = 12; 
 import jwt from 'jsonwebtoken'; 
import MemDb from './models/register.js';
import CommentDb from './models/comment.js';
import ProductDb from './models/product.js'; 
import SubsDb from './models/subscribe.js';
import CartDb from './models/cart.js';
import ContactDb from './models/contact.js'; 
import WishlistDb from './models/wishlist.js'; 

import OrdreqDb from './models/orderrequest.js';
 

import globalTok from './middlewares/global.js';  
  import authenticate from './middlewares/authentication.js';
import checkTok from './middlewares/authb.js';
import checkbTok from './middlewares/authc.js';
import checkcTok from './middlewares/authd.js';
import checkdTok from './middlewares/authe.js';
import admTok from './middlewares/authadmin.js';
import multer from 'multer';
import nodemailer from 'nodemailer'; 
import Product from './models/product.js'; 

//stripe integration  

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_API_KEY);  


const secretkey = process.env.FLW_SECRET_KEY;
const publickey = process.env.FLW_PUBLIC_KEY; 
const flw = new Flutterwave(publickey, secretkey);
   
    app.set('view engine', 'ejs');  
   app.use(express.urlencoded({extended:false}));
   app.use(express.json()); 
   app.use(cors());
   app.use(express.static(join(__dirname + '/public')));  
   app.use(cookieParser()); 
   app.use(globalTok);   
   

 
 

  //set the storage for multer files
 const storage = multer.diskStorage({
     destination : function( req, file, cb) {
           cb(null, 'public/uploads');
     },  

      filename : function (req, file, cb) {
         cb(null, Date.now() + '-' + file.originalname)
      },
     
 });

 //file fitering logic implementation

 const fileFilter = (req, file, cb) => {
   
     if(file.mimetype.startsWith('image/')){
      cb(null, true); // accept the file
     } 

      else{
         cb(new Error('Only image files are allowed!'), false); // reject the file

      }

          } 

  //create the multer instance
 const upload = multer({storage : storage, fileFilter : fileFilter});
 

   //home navigation
   app.get('/', async (req, res) => {   
      const prod = await ProductDb.find().sort({ dateAdded: 1 }).limit(10); // Oldest to newest
      console.log(res.locals.user);
      const justarrived = await ProductDb.find().sort({ dateAdded: -1 }).limit(10); // Newest to oldest
       //check if user has any wishlist history and show the number 
        if(!res.locals.user) {return res.render('./pages/index', { justarrived, products: prod});}
      
        const mywishlists = await WishlistDb.find({
         wisher : res.locals.user.userId, 
       });    
       const mycarts = await CartDb.find({
         carter : res.locals.user.userId, 
       });  

       if(mywishlists.length > 0 || mycarts.length > 0) {
        res.render('./pages/index', { justarrived, products: prod , mwl: mywishlists.length, mct : mycarts.length}); 
       } else {
      res.render('./pages/index', { justarrived, products: prod,  mwl : 0, mct : 0}); 
       } 
  });
      

       
    app.get('/contact', async (req,res)=>{ 
      if(!res.locals.user) {return res.render('./pages/contact');}
      
      const mywishlists = await WishlistDb.find({
       wisher : res.locals.user.userId, 
     });    
     const mycarts = await CartDb.find({
       carter : res.locals.user.userId, 
     });  

     if(mywishlists.length > 0 || mycarts.length > 0) {
      res.render('./pages/contact', { mwl: mywishlists.length, mct : mycarts.length}); 
     } else {
    res.render('./pages/contact', { mwl : 0, mct : 0}); 
     } 
      
   });  

   app.get('/about', (req,res)=>{
      res.render('./pages/about');
   });  
      


   app.get('/products', async (req,res)=>{
      const prods = await ProductDb.find();  
      if(!res.locals.user) {return res.render('./pages/shop', {prods}); }
      
      const mywishlists = await WishlistDb.find({
       wisher : res.locals.user.userId, 
     });    
     const mycarts = await CartDb.find({
       carter : res.locals.user.userId, 
     });  

     if(mywishlists.length > 0 || mycarts.length > 0) {
      res.render('./pages/shop', { mwl: mywishlists.length, mct : mycarts.length, prods : prods}); 
     } else {
    res.render('./pages/shop', { mwl : 0, mct : 0, prods : prods}); 
     } 
       
   });      
 

   //searching by male dresses category
   app.get('/collections/maledresses', async (req,res)=>{
    const prods = await ProductDb.find({category : 'maledresses'});  
    if(!res.locals.user) {return res.render('./pages/maledresses', {prods}); }
    
    const mywishlists = await WishlistDb.find({
     wisher : res.locals.user.userId, 
   });    
   const mycarts = await CartDb.find({
     carter : res.locals.user.userId, 
   });  

   if(mywishlists.length > 0 || mycarts.length > 0) {
    res.render('./pages/maledresses', { mwl: mywishlists.length, mct : mycarts.length, prods : prods}); 
   } else {
  res.render('./pages/maledresses', { mwl : 0, mct : 0, prods : prods}); 
   } 
     
 });      
   


 //searching by female dresses category
 app.get('/collections/femaledresses', async (req,res)=>{
  const prods = await ProductDb.find({category : 'femaledresses'});  
  if(!res.locals.user) {return res.render('./pages/femaledresses', {prods}); }
  
  const mywishlists = await WishlistDb.find({
   wisher : res.locals.user.userId, 
 });    
 const mycarts = await CartDb.find({
   carter : res.locals.user.userId, 
 });  

 if(mywishlists.length > 0 || mycarts.length > 0) {
  res.render('./pages/femaledresses', { mwl: mywishlists.length, mct : mycarts.length, prods : prods}); 
 } else {
res.render('./pages/femaledresses', { mwl : 0, mct : 0, prods : prods}); 
 } 
   
});      


//searching by kid wears category 
app.get('/collections/kidwears', async (req,res)=>{
  const prods = await ProductDb.find({category : 'kidwears'});  
  if(!res.locals.user) {return res.render('./pages/kidwears', {prods}); }
  
  const mywishlists = await WishlistDb.find({
   wisher : res.locals.user.userId, 
 });    
 const mycarts = await CartDb.find({
   carter : res.locals.user.userId, 
 });  

 if(mywishlists.length > 0 || mycarts.length > 0) {
  res.render('./pages/kidwears', { mwl: mywishlists.length, mct : mycarts.length, prods : prods}); 
 } else {
res.render('./pages/kidwears', { mwl : 0, mct : 0, prods : prods}); 
 } 
   
});      



//searching by shoes category 
app.get('/collections/shoes', async (req,res)=>{
  const prods = await ProductDb.find({category : 'shoes'});  
  if(!res.locals.user) {return res.render('./pages/shoes', {prods}); }
  
  const mywishlists = await WishlistDb.find({
   wisher : res.locals.user.userId, 
 });    
 const mycarts = await CartDb.find({
   carter : res.locals.user.userId, 
 });  

 if(mywishlists.length > 0 || mycarts.length > 0) {
  res.render('./pages/shoes', { mwl: mywishlists.length, mct : mycarts.length, prods : prods}); 
 } else {
res.render('./pages/shoes', { mwl : 0, mct : 0, prods : prods}); 
 } 
   
});      
  

//create payment page for customer using stripe
  // This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.
// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
   

app.post('/payment/:customer/:orderinfo', async (req, res) => {   
  const userEmailDoc = await MemDb.findOne({_id: req.params.customer});  
  const userEmail = userEmailDoc.regemail;
  const orderId = req.params.orderinfo; 
  const totalpayment = req.body.totalpayment;
  const orderInfo = await OrdreqDb.findOne({_id: orderId});     
  
  
  // Check if the order exists
  if (!orderInfo) {
      console.log("Order not found");
      return res.render('./pages/notanorder'); 
  }
  
  // Check if the user email exists
  if (!userEmail) {
      console.log("User email not found");
      return res.render('./pages/notanorder'); 
  }    
 
  
const protocol = req.protocol;
const host = req.get('host');
const WEB_DOMAIN = `${protocol}://${host}`; 
console.log(WEB_DOMAIN); 

// Get current timestamp
const currentUnixTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
// Set expiration to 15 hours later
const expiresAt = currentUnixTimestamp + (15 * 60 * 60); // 15 hours in seconds 

//create a unique transaction reference to attach to the payment  

const randd =   Math.floor(10000 + Math.random() * 9873762732); 
const trxRef = 'UNIQUE' + '-' + randd;  
//We need to has the transaction reference to avoid hackers exploitations

   const txRef = await bcrypt.hash(trxRef, saltRounds);
   

  try{   
    await OrdreqDb.findByIdAndUpdate( orderId, { trxRef: txRef }, {new: true} );
  const session = await stripe.checkout.sessions.create({  
    
    line_items: [
      {
          price_data: {
              currency: 'gbp', // Make sure to use 'gbp' for British pounds
              product_data: {
                  name: 'Unique Fashion product', // Provide a description or name for the product
              },
              unit_amount: Math.round(totalpayment * 100), // Convert to pence  
          }, 
          quantity: 1,
      },
  ], 
       
    metadata : {
        transactionReference : txRef,    
    },
    mode: 'payment', 
    expires_at: expiresAt,
    success_url: `${WEB_DOMAIN}/success_xbe87c3r2c67v3r2/${orderId}/${trxRef}`,
    cancel_url: `${WEB_DOMAIN}/cancel_ebgrdyuwregi4r3gg6g/${orderId}`, 
  });
   console.log(session);
   res.json({paymenturl: session.url}); 
}   catch(err) {   
    console.log(err);
    res.status(500).send('Ooops!, ,something went wrong. Please try again');
}
});  

  
app.use('/success_xbe87c3r2c67v3r2/:orderId/:trxRef', authenticate); 
app.get('/success_xbe87c3r2c67v3r2/:orderId/:trxRef', async (req,res)=>{ 
     const orderId = req.params.orderId;  
     const trxRef = req.params.trxRef;
     const orderInfo = await OrdreqDb.findOne({_id: orderId}); 

     if(!orderInfo) {  
         res.render('./pages/notanorder');
     }     
 
      console.log(orderInfo.trxRef); 
      console.log(trxRef);
      
     //validate transaction   
     const itsMatch = await bcrypt.compare(trxRef, orderInfo.trxRef);
if (itsMatch) { 
    const mywishlists = await WishlistDb.find({
      wisher : res.locals.user.userId, 
    });    
    const mycarts = await CartDb.find({
      carter : res.locals.user.userId, 
    });    
      await OrdreqDb.findByIdAndUpdate(orderId, {paymentStatus: 'success'}, {new: true});
     res.render('./pages/ordersuccess', { mwl: mywishlists.length, mct : mycarts.length});  
} else {
  res.render('./pages/notanorder');  
}  
 
  });       
  
  

  
  
app.use('/cancel_ebgrdyuwregi4r3gg6g/:orderId', authenticate); 
  app.get('/cancel_ebgrdyuwregi4r3gg6g/:orderId', async (req,res)=>{ 
    const orderId = req.params.orderId; 
    const orderInfo = await OrdreqDb.findOne({_id: orderId});
    if(!orderInfo) {
        res.render('./pages/notanorder');
    }  
 
    const mywishlists = await WishlistDb.find({
      wisher : res.locals.user.userId, 
    });    
    const mycarts = await CartDb.find({
      carter : res.locals.user.userId, 
    });     
     res.render('./pages/ordercancel', { mwl: mywishlists.length, mct : mycarts.length}); 
 });   
  


 //manage payment success orders by admin  

// Admin Page Route  
app.get('/admin_manageorders/r46i7cygbc', async (req, res) => {
    try {
        // Fetch orders with payment status 'success'
        const orders = await OrdreqDb.find({ paymentStatus: 'success', trackingCode: 'pending' }); 
        
        const mywishlists = await WishlistDb.find({
          wisher : res.locals.user.userId, 
        });    
        const mycarts = await CartDb.find({
          carter : res.locals.user.userId, 
        });  
      
        if(mywishlists.length > 0 || mycarts.length > 0) {
         res.render('./pages/manageorders', { mwl: mywishlists.length, mct : mycarts.length, orders}); 
        } else {
       res.render('./pages/manageorders', { mwl : 0, mct : 0, orders});    
        }  

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});  

 
// Update Tracking Code Route 
app.use('/manageorders/update/:orderId', admTok); 
app.post('/manageorders/update/:orderId', async (req, res) => {  
  const user = res.locals.user;
  if(user && user.role !== 'admin'){    
         return res.render('./pages/adminlogin');
  }
    const trackingCode = req.body.trackingCode;
    try {
        await OrdreqDb.findByIdAndUpdate(req.params.orderId, {trackingCode: trackingCode, trackingState: 'inTransit' }, {new: true});
        res.redirect('./pages/manageorders');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});  


app.use('/admin_manageTrackingState/r46i7cygbc', admTok); 
app.get('/admin_manageTrackingState/r46i7cygbc', async (req, res) => {
    try {
        // Fetch orders with payment status 'success'
        const orders = await OrdreqDb.find({ paymentStatus: 'success', trackingState: 'inTransit' }); 
        
        const mywishlists = await WishlistDb.find({
          wisher : res.locals.user.userId, 
        });    
        const mycarts = await CartDb.find({
          carter : res.locals.user.userId, 
        });  
      
        if(mywishlists.length > 0 || mycarts.length > 0) {
         res.render('./pages/manageTrackingState', { mwl: mywishlists.length, mct : mycarts.length, orders}); 
        } else {
       res.render('./pages/manageTrackingState', { mwl : 0, mct : 0, orders});    
        }  

    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});  
 
 

// Track Order Route 
app.use('/track-orders/:userId', authenticate); 
app.get('/track-orders/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Fetch orders for the user with payment status 'success'
        const orders = await OrdreqDb.find({
            customer: userId,
            paymentStatus: 'success'
        }).sort({dateAdded : -1});

        // Render the track orders page with the orders 
        const mywishlists = await WishlistDb.find({
          wisher : res.locals.user.userId, 
        });    
        const mycarts = await CartDb.find({
          carter : res.locals.user.userId, 
        });  
      
        if(mywishlists.length > 0 || mycarts.length > 0) {
         res.render('./pages/trackorders', { mwl: mywishlists.length, mct : mycarts.length, orders}); 
        } else {
       res.render('./pages/trackorders', { mwl : 0, mct : 0, orders});    
        }   
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error'); 
    }
}); 



//Tracking a package 
 app.use('/tracking_my_package/287b2d2gv67/iniqFasbnxdxnsqv/:trackingCode', authenticate); 
 app.get('/tracking_my_package/287b2d2gv67/iniqFasbnxdxnsqv/:trackingCode', async (req, res) => {
    const trackingNumber = req.params.trackingCode;

    const theOrder = await OrdreqDb.findOne({ trackingCode: trackingNumber });
    const theOrderState = theOrder ? theOrder.trackingState : null;

    const mywishlists = await WishlistDb.find({ wisher: res.locals.user.userId });
    const mycarts = await CartDb.find({ carter: res.locals.user.userId });

    res.render('./pages/trackpage', {
        mwl: mywishlists.length || 0,
        mct: mycarts.length || 0,
        theOrder,
        theOrderState,
        trackingNumber
    });
});

    

// Update Tracking State Route
app.use('/update-tracking-state', admTok);
app.post('/update-tracking-state', async (req, res) => {
    const user = res.locals.user;
    
    // Check if user is admin
    if (!user || user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    
    const { orderId, trackingCode, newStatus } = req.body;
    
    // Validate required fields
    if (!orderId || !trackingCode || !newStatus) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: orderId, trackingCode, and newStatus are required.'
        });
    }
    
    try {
        // Find the order first to verify it exists and has the correct tracking code
        const existingOrder = await OrdreqDb.findById(orderId);
        
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }
        
        // Verify tracking code matches (security check)
        if (existingOrder.trackingCode !== trackingCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tracking code for this order.'
            });
        }
        
        // Update the order with new tracking state
        const updateData = {
            trackingState: newStatus
        };
        
        // If status is delivered, you might want to add a delivery date
        if (newStatus === 'delivered') {
            updateData.deliveredAt = new Date();
        }
        
        const updatedOrder = await OrdreqDb.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );
        
        res.json({
            success: true,
            message: `Order status updated to ${newStatus} successfully.`,
            order: updatedOrder
        });
        
    } catch (error) {
        console.error('Error updating tracking state:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred while updating tracking state.'
        });
    }
});
 
app.use('/manageorders/update-tracking-state', admTok);
app.post('/manageorders/update-tracking-state', async (req, res) => {
     
    const user = res.locals.user;
      const duser = res.locals.user;
     const memb = await MemDb.findOne({_id : duser.userId});   
    const useremail = memb.regemail;
    const username = memb.reguser;
    
    if (!user || user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    
    const { orderId, trackingCode, newStatus } = req.body;
    
    if (!orderId || !trackingCode || !newStatus) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields.'
        });
    }
    
    try {
        const existingOrder = await OrdreqDb.findById(orderId);
        
        if (!existingOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }
        
        if (existingOrder.trackingCode !== trackingCode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tracking code.'
            });
        }
        
        const updateData = { trackingState: newStatus };



        if (newStatus === 'delivered') {
                try{
     const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user:process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }
  });

     //set mail option
     const mailOptions = {
      from: 'ufashion744@gmail.com',
      to: useremail,
      subject: 'Order Delivered Successfully! 📦',
      html: `
    <img style='width:100%' src='https://res.cloudinary.com/drpmtitnn/image/upload/c_fill,g_auto,h_250,w_970/c_scale,co_rgb:ffffff/v1727764114/uniquea_x46mai.jpg'> <br><br>
    Hi <b>${username}</b>, <br><br>
    Great news! Your order has been successfully delivered! 🎉<br><br>
    <b>Order Details:</b><br>
    • Order ID: <b>${orderId}</b><br>
    • Tracking Code: <b>${trackingCode}</b><br>
    • Delivered on: <b>${new Date().toLocaleDateString()}</b><br><br>
    We hope you love your purchase! If you have any questions about your order or need assistance, 
    please don't hesitate to contact us.<br><br>
    Thank you for choosing Unique Fashion. We appreciate your business!<br><br>
    Best regards,<br>
     Unique Fashion Team<br><br> 
     <small>For any inquiries, please contact us at <strong>ufashion744@gmail.com</strong>.</small>
    <small>Please rate your shopping experience with us!</small>
`,
  };
  

  


     transporter.sendMail(mailOptions, (error, info)=>{
           if(error){
             console.log(error);
           } else{
               res.status(200).send('success');
           }
     });    
      res.json({msg : 'successfully delivered'});
    }  catch(err) { 
        console.log(err);
    }
  }
        


        const updatedOrder = await OrdreqDb.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        );
        
        res.json({
            success: true,
            message: `Order status updated successfully.`,
            order: updatedOrder
        });
        
    } catch (error) {
        console.error('Error updating tracking state:', error);
        res.status(500).json({
            success: false,
            message: 'Server error occurred.'
        });
    }
});



   //sorting products 
   app.get('/sorting/:condition', async (req,res)=>{
         const dval = req.params.condition;
         console.log(dval);  
           
         var result; 
         try{
         if(dval === 'priceasc'){ 
         result = await ProductDb.find().sort({priceuk : 1});
         } else if(dval === 'pricedesc'){ 
          result = await ProductDb.find().sort({priceuk : -1});
       } else if(dval === 'dateadded'){ 
            result = await ProductDb.find().sort({dateAdded : -1});
        }   

        res.json({msg : 'success', result});   
      }  catch(err) {
           console.log(err);
           res.status(400).send('Something went wrong, please check your internet connection and try again');
      }
  });   





  
   //sorting products 
   app.get('/sortingmale/:condition', async (req,res)=>{
    const dval = req.params.condition;
    console.log(dval);  
      
    var result; 
    try{
    if(dval === 'priceasc'){ 
    result = await ProductDb.find({category : 'maledresses'}).sort({priceuk : 1});
    } else if(dval === 'pricedesc'){ 
     result = await ProductDb.find({category : 'maledresses'}).sort({priceuk : -1});
  } else if(dval === 'dateadded'){ 
       result = await ProductDb.find({category : 'maledresses'}).sort({dateAdded : -1});
   }   

   res.json({msg : 'success', result});   
 }  catch(err) {
      console.log(err);
      res.status(400).send('Something went wrong, please check your internet connection and try again');
 }
}); 



  
   //sorting products 
   app.get('/sortingfemale/:condition', async (req,res)=>{
    const dval = req.params.condition;
    console.log(dval);  
      
    var result; 
    try{
    if(dval === 'priceasc'){ 
    result = await ProductDb.find({category : 'femaledresses'}).sort({priceuk : 1});
    } else if(dval === 'pricedesc'){ 
     result = await ProductDb.find({category : 'femaledresses'}).sort({priceuk : -1});
  } else if(dval === 'dateadded'){ 
       result = await ProductDb.find({category : 'femaledresses'}).sort({dateAdded : -1});
   }   

   res.json({msg : 'success', result});   
 }  catch(err) {
      console.log(err);
      res.status(400).send('Something went wrong, please check your internet connection and try again');
 }
}); 
 


   //sorting products 
   app.get('/sortingkid/:condition', async (req,res)=>{
    const dval = req.params.condition;
    console.log(dval);  
      
    var result; 
    try{
    if(dval === 'priceasc'){ 
    result = await ProductDb.find({category : 'kidwears'}).sort({priceuk : 1});
    } else if(dval === 'pricedesc'){ 
     result = await ProductDb.find({category : 'kidwears'}).sort({priceuk : -1});
  } else if(dval === 'dateadded'){ 
       result = await ProductDb.find({category : 'kidwears'}).sort({dateAdded : -1});
   }   

   res.json({msg : 'success', result});   
 }  catch(err) {
      console.log(err);
      res.status(400).send('Something went wrong, please check your internet connection and try again');
 }
});  



   //sorting products 
   app.get('/sortingshoe/:condition', async (req,res)=>{
    const dval = req.params.condition;
    console.log(dval);  
      
    var result; 
    try{
    if(dval === 'priceasc'){ 
    result = await ProductDb.find({category : 'shoes'}).sort({priceuk : 1});
    } else if(dval === 'pricedesc'){ 
     result = await ProductDb.find({category : 'shoes'}).sort({priceuk : -1});
  } else if(dval === 'dateadded'){ 
       result = await ProductDb.find({category : 'shoes'}).sort({dateAdded : -1});
   }   

   res.json({msg : 'success', result});   
 }  catch(err) {
      console.log(err);
      res.status(400).send('Something went wrong, please check your internet connection and try again');
 }
}); 



    //view details of each products  
    app.get('/collections/:category/:productname/:productid', async (req,res)=>{
          const productId = req.params.productid;  

           // Validate the productId
    if (!mongoose.isValidObjectId(productId)) {
      return res.render('./pages/notaproduct'); // or you can send a 404 response
  }
          
          try{ 
              const dproduct = await ProductDb.findOne({_id: productId});
             
        // Validate if the product exists and matches the category and productname
        if (!dproduct || dproduct.category !== req.params.category || dproduct.productName !== req.params.productname) {
          return res.render('./pages/notaproduct'); // Render 404 page
      }
               const youmaylike = await ProductDb.find({
                  category: dproduct.category,
                  _id: { $ne: dproduct._id }
                });

               if(!res.locals.user) { return  res.render('./pages/detail', { produ : dproduct, yml : youmaylike}); } 
          
               const mywishlists = await WishlistDb.find({
                  wisher : res.locals.user.userId, 
                });    
                const mycarts = await CartDb.find({
                  carter : res.locals.user.userId, 
                });  
              
                if(mywishlists.length > 0 || mycarts.length > 0) {
                 res.render('./pages/detail', { mwl: mywishlists.length, mct : mycarts.length, produ : dproduct, yml : youmaylike}); 
                } else {
               res.render('./pages/detail', { mwl : 0, mct : 0, produ : dproduct, yml : youmaylike});    
                }  
               
          }  catch(err) {
            return res.render('./pages/errorpage');
          }
    });
 
        

   app.get('/explore', (req,res)=>{
      res.render('./pages/explore.ejs');
   }); 
     
  

   app.get('/socialhandle', (req,res)=>{
      res.redirect('https://wa.me/+2349122928923');
   });   


   //cookie displayed reveal

   app.post('/cookiedisplayed', async (req,res)=>{
          const ckd = req.body.ckdp; 
          const duser = res.locals.user;
          try{ 
            const result = await MemDb.findByIdAndUpdate(
              duser.userId,
              { $set: { cookieDisplayed: ckd } },
              { new: true, upsert: true } // `upsert` will create a new document if none is found
          );  
           //update in the cookie immediately 
           duser.cookieDisplayed = ckd; 
           console.log(duser.cookieDisplayed);
          res.json({msg : 'ok'});
             console.log(result);
          } catch(err) {
             console.error(err);
          }
   });
  
       
             

   app.post('/processingpayment', async (req,res)=>{
       const aamnt = req.body.amount;
       const rand =   Math.floor(10000 + Math.random() * 9873762732);
       const timestamp = Date.now().toString();
       const txRef = rand + '-' + timestamp;  
       const ouser = res.locals.user; 
       const duser = await MemDb.findOne({_id : ouser.userId});
       //firstly save the transaction reference in the mongodb along with the order information for later query
      await PaymentDb.create({ 
         txref : txRef,
         user : ouser.userId, 
         myServices : req.body.orderedServices,
         day : req.body.day,
         session : req.body.session, 
         });   
   
       try {
           const response = await got.post("https://api.flutterwave.com/v3/payments", {
               headers: {
                   Authorization: `Bearer ${secretkey}`
               },
               json: {
                   tx_ref: txRef,
                   amount: aamnt,
                   currency: "EUR", 
                   redirect_url: `${req.protocol}://${req.get('host')}/3ece3-x87b78ex86g3t3x683xr26b83286g32r2r3xb873286t23r86tbr2t342-x3f67`, //we will use this url to query transaction id returned and make request to flutterwave payment verification endpoint
                   customer: {
                       email: duser.regemail, 
                       name:  duser.reguser,
                   },
                   customizations: {
                       title: "Onosco Psychotherapy Services",
                       logo: "/images/onoscologo.jpg"
                   }
               }
           }).json();
   
           // Assuming response contains link property for redirection 
           const redirectUrl = response.data.link; 
           res.json({redirectUrl});
       } catch (err) {
           console.log(err.response.body);
           // Handle error accordingly, maybe send an error response
           res.status(500).send("Error processing payment");
       }
   });
     
 
   

   app.get('/3ece3-x87b78ex86g3t3x683xr26b83286g32r2r3xb873286t23r86tbr2t342-x3f67', async (req, res) => {
      const ouser = res.locals.user;
      console.log(ouser);
      try { 
          const { status, tx_ref, transaction_id } = req.query; 

          if(status === 'cancelled'){
               res.redirect('/checkout');
          }  else {
            
          // Check if the payment is for us
          const reference = await PaymentDb.findOne({ txref: tx_ref }).populate('myServices').populate('user').exec(); 
          
          if (!reference) {
              res.send('Transaction reference is not recognized'); 
          }
  
          const confirmation = await flw.Transaction.verify({ id: transaction_id });
          const paidAmount = confirmation.data.amount;
          const orderedServices = reference.myServices;
    
          let expectedAmount = 0;
  
          for (const service of orderedServices) {
            expectedAmount += service.servicePrice;
        }

  
          if (confirmation.data.status === "successful" &&
              paidAmount === expectedAmount && // extracted from txref
              confirmation.data.currency === 'EUR') { 
              // Check if the txref returned in the verification is still available in the database
              const transactionReference = confirmation.data.tx_ref;
              const confirmAgain = await PaymentDb.findOne({ txref: transactionReference });
  
              if (!confirmAgain) {
                  res.send('paymenterror'); 
              }
              

              const servicename = 'onosco';
              const randid =   Math.floor(10000 + Math.random() * 685312);
              const myorderid = servicename + randid;

              const updatedPaymentStatus = {
                status: 'available',
                orderid : myorderid,
             };  
 
               const updatedReference =  await PaymentDb.findByIdAndUpdate(reference._id, updatedPaymentStatus, { new: true });
                //clear all user's carts  
                const cartsToDelete = await CartDb.find({ user: ouser.userId }); 
                for (const cart of cartsToDelete) {
                  const cartid = cart._id;
                  await CartDb.deleteMany({ _id: cartid });
              }
               res.redirect(`/paymentresponse/2e6tv7te26re8r3e8v53e853vsgbgdbdxny383edb5r3br3rbe7re3drb673er36/${'successful'}/${reference.txref}`);
                console.log(updatedReference);
                
          } else {
              if (paidAmount > expectedAmount) {
                  // Refund the user
                  const refunding = paidAmount - expectedAmount;
                  res.redirect(`/paymentresponse/2e6tv7te26re8r3e8v53e853vsgbgdbdxny383edb5r3br3rbe7re3drb673er36/${'refunding'}/${reference.txref}`);
               } else if (paidAmount < expectedAmount) {
                  // Debit user manually
                  const balancing = expectedAmount - paidAmount;
                  res.send('debiting');
              }
          }  
          }
      } catch (err) {
          console.log(err);
          res.status(500).send('An error occurred');
      }
      
  });    


  app.get('/paymentresponse/2e6tv7te26re8r3e8v53e853vsgbgdbdxny383edb5r3br3rbe7re3drb673er36/:status/:reference', async (req,res)=>{
   const status = req.params.status;
   const txrefid = req.params.reference; 
   const userpaymentdetails = await PaymentDb.findOne({ txref: txrefid }).populate('myServices').populate('user').exec();
   
   if(!userpaymentdetails){ 
         res.send('transaction reference not recognized');
   }
 console.log(userpaymentdetails);
   if(status === 'successful'){ 
      const adata = {
         img : '/images/onoscologo.jpg',
         greentext : 'Payment Successful',
         text : 'Thank you for choosing Onosco Psychotherapy services.',
         textb : 'Please check your email for payment details as your order ID will be used to track your order when you make yourself available for the service',
       }  
        //send email to the user with the payment details  
        
const emailTemplate = fs.readFileSync(join(__dirname, 'views', 'pages', 'orderemail.ejs'), 'utf8');
const renderedEmailBody = ejs.render(emailTemplate, {userpaymentdetails});
// Create a SMTP transporter
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.sendinblue.com', 
    port: 587,
    auth: {
      user:process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASS,
  }
});

// Define email options
 const emailAddresses = [ 
   userpaymentdetails.user.regemail,
   'alexaroh@yahoo.com',
   'victoremmy1876@gmail.com',
];
const mailOptions = {
    from: 'onoscopsychotherapyservices@gmail.com',
    to: emailAddresses.join(', '),
    subject: 'Order informations',
    html: renderedEmailBody,
     };

// Send email
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error occurred:', error);
    } else {
        console.log('Email sent:', info.response);
    }
});


     res.render('./pages/response', {adata}); 
  } else if(status === 'refunding'){
   const adata = {
       img : '/images/onoscologo.jpg',
       greentext : 'Refunding Payment..',
       text : 'Our system discovered the amount you paid is more than the amount expected, please be patient as we refund the remainder back to your account',
       textb : '',
      }
     res.render('./pages/response', {adata});
  } else{} 

  });  

  app.use('/trackorder/e3x8tbot484c367tc46vo8covbt6843684rcb7t546ot8b3o43o8', admTok);
  app.get('/trackorder/e3x8tbot484c367tc46vo8covbt6843684rcb7t546ot8b3o43o8', (req,res)=>{
       const user = res.locals.user;
       if(user && user.role === 'admin'){
        res.render('./pages/trackorder');
       }  

 else {
 res.redirect('/admin-control-login');
}

  });
 

  app.get('/trackorder/:orderid', async (req,res)=>{
       const user = res.locals.user; 
       const orderId = await req.params.orderid; 
            const orderinfo = await PaymentDb.findOne({ orderid : orderId}).populate('myServices').exec();
            if(orderinfo){
               res.json({ message : orderinfo._id});
            }   else {
                res.status(404).json({message : 'Order information not found in the database, Please try again with the valid order ID given after the service transaction..You can check your email for confirmation'});
            }
         
  }); 
 

  app.get('/settleorder/:orderid', async (req,res)=>{
   const user = res.locals.user; 
   try{ 
   const orderId = await req.params.orderid; 
        const orderinfo = await PaymentDb.findOne({ _id: orderId});
        if(orderinfo){
           await PaymentDb.findByIdAndDelete(orderId);
           res.status(200).send('Successfully settled');
        }   else {
            res.status(404).send('Order information not found in the database, Please try again with the valid order ID given after the service transaction..You can check your email for confirmation');
        }
      }  
      catch(err) {
          res.status(400).send('something went wrong, please try again');
      }
}); 
   
    

  app.get('/orderinformation/:idhere', async (req,res)=>{ 
   const user = res.locals.user;
   if(!user && user.role === 'admin'){
       res.redirect('/admin-control-login');
   }
    const orderid = req.params.idhere;
    const theorder = await PaymentDb.findOne({_id : orderid}).populate('myServices').exec();
    if(!theorder){
        res.redirect('/notfound/he87ed3ub');
    }  
    res.render('./pages/orderview', {theorder});
  });
  

   
    //Apply middleware to redirect user to dashboard if cookie is already set
    app.use('/login', checkTok); 
    //navigate to login page 
     app.get('/login', (req,res)=>{
          res.render('./pages/login');
     });  
       

       //Apply middleware to redirect user to dashboard if cookie is already set
    app.use('/signup', checkbTok);
      app.get('/signup', (req,res)=>{
             res.render('./pages/signup');
      }); 
 

    //admin access
           
//Apply middleware to redirect admin to login if cookie is not yet set
app.use('/admin-control', admTok);
app.use('/admin-control-edit-673xxsbjxswv325r327r', admTok);
 
//Apply middleware to redirect admin to dashboard if cookie is already set
app.use('/admin-control-login', checkcTok);

//Apply middleware to redirect admin to dashboard if cookie is already set
app.use('/admin-control-register', checkdTok);


     app.get('/admin-control-login', (req,res)=>{
              res.render('./pages/adminlogin.ejs', {validationString});
     });
    

     app.get('/admin-control-register', (req,res)=>{
      res.render('./pages/adminsignup.ejs');
});

   
 

app.get('/onosco-blog', async (req,res)=>{   
   //fetch data from mongodb  
     try{ 
   const blogpost = await BlogDb.find(); 
   console.log(blogpost); 
   res.render('./pages/blog', {blogpost}
   );  
     }  

      catch (err) {
          console.log(err);
    } 

});  

 

 

app.get('/onosco-blog/:postId', async (req, res) => {
    try {
        const postid = req.params.postId; 

       //check if post exists
        const post = await BlogDb.findOne({ _id: postid }); 
            //check if the post has comments and render in ejs
            const comments = await CommentDb.find({ post : postid}).populate('post').populate('user').populate('parentComment').exec(); 
         //check for related posts
         const relatedposts = await BlogDb.find({ _id : { $ne: post._id } });

        if (post) {
            console.log(post);   
            res.render('./pages/fullpost', { post , comments, relatedposts }); 
        }  

        else {
            // Handle case when post is not found
            res.status(404).send('Post not found');
        } 

    } catch (err) {
        console.log(err);
        // Handle other errors
        res.status(500).send('Internal Server Error');
    }
});    
     

app.get('/admin-control/collections/:productname/:productid', async (req, res) => {
   try {
       const productId = req.params.productid; 
    
       //check if post exists
       const prod = await ProductDb.findOne({ _id: productId }); 
    
       if (prod) {  
         const mywishlists = await WishlistDb.find({
            wisher : res.locals.user.userId, 
          });    
          const mycarts = await CartDb.find({
            carter : res.locals.user.userId, 
          });  
        
          if(mywishlists.length > 0 || mycarts.length > 0) {
           res.render('./pages/productedit', { mwl: mywishlists.length, mct : mycarts.length, prod : prod}); 
          } else {
         res.render('./pages/productedit', { mwl : 0, mct : 0, prod : prod});  
 
          }  
          
       }  

       else {
           // Handle case when post is not found
           res.status(404).send('Product not found');
       } 

   } catch (err) {
       console.log(err);
       // Handle other errors
       res.status(500).send('Internal Server Error');
   }
});   

 
 

app.get('/testimonies', (req,res)=>{
   res.render('./pages/maintst.ejs'); 
});  
 

//handle contacting action
app.post('/contactee', async (req,res)=>{
   const condata = req.body; 
   console.log(condata); 
   console.log(req.body);

   try{
         await ContactDb.create(condata);
         res.status(200).send('Message Sent Successfully');
   } 

    catch(err){
       res.status(400).send('Error sending message'); 
       console.log(err);
    }
});   


//handle subscribing action
app.post('/subsbg', async (req,res)=>{
   const condata = req.body; 
   console.log(condata);  
   try{
         await SubsDb.create(condata);
         res.status(200).send('Subscribed Successfully');
   } 

    catch(err){
       res.status(400).send('Error Subscribing, please try again'); 
       console.log(err);
    }
}); 



 
  //post a comment text with reference to post and the user (initiator)

  app.post('/comment/:postId', async (req,res)=>{
        const postid = req.params.postId;
        console.log(postid);
        const commentText = req.body.txtbodyy;
        const user = res.locals.user;
        if(!user){ 
            return res.status(403).send('This section is only for authenticated users please login to also engage');
        }  

        await CommentDb.create({
         txtbodyy : commentText,
         post : postid,
         user : user.userId,
        });   
            res.redirect(`/onosco-blog/${postid}`);
  });


 
      //post a reply text with reference to its corresponding comment, post and initiator  (user)
          
      app.post('/reply/:postId/:commentId', async (req,res)=>{
         const postid = req.params.postId;
         const commentid = req.params.commentId; 
         const replyText = req.body.repinpp;
         const user = res.locals.user;
         if(!user){ 
             return res.status(403).send('This section is only for authenticated users please login to also engage');
         }  
 
         await CommentDb.create({
          txtbodyy : replyText,
          post : postid,
          parentComment : commentid,
          user : user.userId,
         });   
             res.redirect(`/blogposts/${postid}`);
   });
        



      app.post('/postingtestimony', (req,res)=>{
   const testimonybody = req.body;
   console.log(testimonybody);
}); 

  

app.post('/postingregistration', async (req, res) => {
  try {
    // Hash the password asynchronously
    const hash = await bcrypt.hash(req.body.regpass, saltRounds);

    // Create a new user in the database
    await MemDb.create({
      reguser: req.body.reguser,
      regemail: req.body.regemail,
      regpass: hash,
      firstname: req.body.firstname,
      lastname: req.body.lastname, 
      role : 'client',
    });
   
    res.json({msg : 'success'});

        //send welcome message
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }
  });

  // Set mail option 
    const mailOptions = {
      from: 'ufashion744@gmail.com',
      to: req.body.regemail,
      subject: 'Welcome to Unique Fashion!',
      html: `
          <img style='width:100%' src='https://res.cloudinary.com/drpmtitnn/image/upload/c_fill,g_auto,h_250,w_970/c_scale,co_rgb:ffffff/v1727764114/uniquea_x46mai.jpg'> <br><br>
          Hi <b>${req.body.reguser}</b>, <br><br>
          Welcome to Unique Fashion! We're thrilled to have you on board. 
          Here are some details to get you started:<br>
          <ul>
          <li>Email: ${req.body.regemail}</li>
          <li>Password: Your Password </li>   
          </ul><br>
          If you have any questions or need assistance, feel free to reach out to us.<br><br>
          Thank you for joining us!<br>
          Best regards,<br>
          Unique Fashion Team
      `,
  };
  

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
      } else {
          res.status(200).json({ msg : 'success' });
      }
  });     
  //send welcome message end

  }
  
  catch (error) { 
    if (error.code === 11000 && error.keyPattern.regemail) {
      // Duplicate key error for email field
      res.status(400).send('Email is already in use');
    }
    
    else if (error.code === 11000 && error.keyPattern.reguser) {
      // Duplicate key error for username field
      res.status(400).send('Username is already taken');
    } 
    
    else {
      // Other errors
      console.error('Error:', error);
      res.status(500).send('Something went wrong, try again');
    }
    
  }
});          

   //verify the user after registration

   app.get('/verification/:memberemail', async (req,res)=>{ 

  
              const membemail = req.params.memberemail;
              try{
              const memb = await MemDb.findOne({regemail : membemail});  

              if(memb){  

               //Let's check if the member is already verified or we carry out the verification
               if(memb.verified === false){
                     const verifytoken = jwt.sign({userId : memb._id}, process.env.JWT_SECRET_KEY, {
                        expiresIn : '15m'});  
                 const verifyLink = `${req.protocol}://${req.get('host')}/verifyemail/?auser=${memb._id}&token=${verifytoken}`;
    
                 
    //create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user:process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }  
  });  

  
    //set mail option
    const mailOptions = {
      from: 'ufashion744@gmail.com',
      to: memb.regemail,
      subject: 'Verify Email',
      text: `To verify your email, click on this link: ${verifyLink}. Note that it expires after 15 minutes.`
   };    

   //Now let's send the email to the memeber 
   transporter.sendMail(mailOptions, async (error, info)=>{
      if(error){
        console.log(error);
      } else{
          const response = 'Click on the link sent to your registered email for your account verification, please check spam if link is not found.';
          res.render('./pages/verify', {resp : response}); 
      }
});  

   
     }   else { 
          //i.e the member is already verified  
          //we dont just assign a cookie to the user because is possible he is coming from the register route so setting cookie directly is not professional enough cos user has not entered password..so let's verify login success
           if(memb.loginsuccess === 1) { 
            await MemDb.findByIdAndUpdate(memb._id, {loginsuccess:0});
           //if user is coming from login route turn login success back to 0 and redirect to dashboard by setting cookie
          const token = jwt.sign({ userId : memb._id, reguser : memb.reguser, firstname : memb.firstname, cookieDisplayed : memb.cookieDisplayed, lastname : memb.lastname, points : memb.points, regemail : memb.regemail, role : 'client'}, process.env.JWT_SECRET_KEY, {
            expiresIn : '5d',
         });  

         res.cookie('authToken', token, {httpOnly : true, secure : true}); 
            
            // Take them to thier dashboard
            res.redirect('/dashboard'); 
      } else { 
         //if user is coming from register route , let's take him back to login cos is not possible he is verified at the beginning
         res.redirect('/login');        
      }
  
 }
              }   else {
               const response = 'Email not available in our database, unable to send verification email';
               res.render('./pages/verify', {resp : response});
              }    
      }
            
            catch(err){
               const response = 'OOPS.. An error occured during verification, Refresh the page.';
               res.render('./pages/verify', {resp : response});
               console.log(err);
            }   
            
           
    });
   
  
    //lET'S VERIFY USERS 
     app.get('/verifyemail', async (req,res)=>{
      const memb = req.query.auser; 
                const token = req.query.token;
                //verify the token by jwt
                jwt.verify(token , process.env.JWT_SECRET_KEY, async (err, user)=>{
                          if(err){
                              const response = 'OOPS...The link is invalid!';
                              console.log(err);
                              res.render('./pages/verified', {resp : response});  
                          }  
                         
                      else{   
                     await MemDb.findByIdAndUpdate(memb, {verified : true}); 
                     const response = 'Congratulations. You have been successfully verified..Begin to explore your favorite products on Unique fashion today!';  
                     //let's be sure whether to take user to dashboard directly or /login route by verifying login success
                     const dmemb = await MemDb.findOne({_id : memb});
                      if(dmemb.loginsuccess == 1) {   
                        await MemDb.findByIdAndUpdate(memb, {loginsuccess:0});
                        console.log('eligible'); 
                       //if user is coming from login route turn login success back to 0 and redirect to dashboard by setting cookie
                      const token = jwt.sign({ userId : memb._id, reguser : memb.reguser, firstname : memb.firstname, lastname : memb.lastname, points : memb.points, regemail : memb.regemail, role : 'client'}, process.env.JWT_SECRET_KEY, {
                        expiresIn : '3d',
                     });  
            
                     res.cookie('authToken', token, {httpOnly : true, secure : true}); 
                        
                        // Take them to thier dashboard
                        const link = 'dashboard'; 
                        res.render('./pages/verified', {resp : response, link : link}); 
                  } else { 
                     //if user is coming from register route , let's take him back to login cos is not possible he is verified at the beginning
                    const link = 'login';    
                    res.render('./pages/verified', {resp : response, link : link});   
                  }
   
                   }  
               });   
 
     });
  



//post admin sign up

app.post('/postingadregistration', async (req, res) => {
   try {
     // Hash the password asynchronously
     const hash = await bcrypt.hash(req.body.regpass, saltRounds);
 
     // Create a new user in the database
     await MemDb.create({
       reguser: req.body.reguser,
       regemail: req.body.regemail,
       regpass: hash,
       firstname: req.body.firstname,
       lastname: req.body.lastname,
       role : 'admin',
     });
  
     res.send('success');
   }
   
   catch (error) { 
     if (error.code === 11000 && error.keyPattern.regemail) {
       // Duplicate key error for email field
       res.status(400).send('Email is already in use');
     }
     
     else if (error.code === 11000 && error.keyPattern.reguser) {
       // Duplicate key error for username field
       res.status(400).send('Username is already taken');
     } 
     
     else {
       // Other errors
       console.error('Error:', error);
       res.status(500).send('Something went wrong, try again');
     }
     
   }
 });
 


app.post('/logino', async (req, res)=>{ 
  
   try { 
   const memb = await MemDb.findOne({ regemail: req.body.regemail});
   if(memb) {
      
     await bcrypt.compare(req.body.regpass, memb.regpass, async function (err, auser){

             if(err){  
               res.status(500).send('Something went wrong!');
             } 

              else{ 

               if(auser){  
                  //user passed the challenge of correct credentials entry
                  await MemDb.findByIdAndUpdate(memb._id, {loginsuccess:1});
          //check for verification
          res.status(200).json({message : 'good'});
         }   

         else{
            res.status(401).send('Invalid username or password, please check well and re-provide the correct credentials');     
         }

         }

     }); 
   }       


   else{
      res.status(404).send('User does not exist in our record');      
   }


}   

   catch (err) {
      console.log(err);
   }

});    




  //handle admin login

  
app.post('/adlogino', async (req, res)=>{ 
  
   try { 
   const memb = await MemDb.findOne({regemail : req.body.regemail});  
   if(memb &&memb.role === 'admin') {
      
     await bcrypt.compare(req.body.regpass, memb.regpass, function(err, auser){

             if(err){
               res.status(500).send('Something went wrong!');
             } 

              else{ 

               if(auser){  
           const token = jwt.sign({ userId : memb._id, reguser : memb.reguser, firstname : memb.firstname, lastname : memb.lastname, regemail : memb.regemail, cookieDisplayed : memb.cookieDisplayed, points : memb.points,  role : 'admin'}, process.env.JWT_SECRET_KEY, {
                  expiresIn : '3d',
               }); 
               res.cookie('authToken', token, {httpOnly : true, secure : true});
                  res.status(200).json({message : 'success'}); 
        
         }

         else{
            res.status(401).send('Invalid username or password');     
         }

         }

     }); 
   }       


   else{
      res.status(404).send('Admin does not exist in our record');      
   }


}   

   catch (err) {
      console.log(err);
   }

});   


  
  //apply the middleware to the protected route 
  app.use('/dashboard', authenticate); 
//protected endpoint
app.get('/dashboard', async (req, res)=>{
   const uuser = res.locals.user;   

   const mywishlists = await WishlistDb.find({
    wisher : res.locals.user.userId, 
  });    
  const mycarts = await CartDb.find({
    carter : res.locals.user.userId, 
  });  

  if(mywishlists.length > 0 || mycarts.length > 0) {
   res.render('./pages/dashboard', { mwl: mywishlists.length, mct : mycarts.length, uuser : uuser}); 
  } else {
 res.render('./pages/dashboard', { mwl : 0, mct : 0, uuser : uuser});  
  } 
     
});   
  
 //apply the middleware to the protected route 
 app.use('/updateprofile', authenticate); 
app.get('/updateprofile', async (req,res)=>{
   const user = res.locals.user;  
   
   const memb = await MemDb.findOne({_id: user.userId});
   const mywishlists = await WishlistDb.find({
      wisher : res.locals.user.userId, 
    });    
    const mycarts = await CartDb.find({
      carter : res.locals.user.userId, 
    });  
  
    if(mywishlists.length > 0 || mycarts.length > 0) {
     res.render('./pages/updateprofile', { mwl: mywishlists.length, mct : mycarts.length, memb : memb}); 
    } else {
   res.render('./pages/updateprofile', { mwl : 0, mct : 0, memb : memb});  
 }     
}); 
 

app.use('/updateprofiledata', authenticate);  
app.post('/updateprofiledata',  async (req,res)=>{
     const parseddata = req.body;
     //Now let's start updaring the user information 
     const duser = res.locals.user;
     const memb = await MemDb.findOne({_id : duser.userId});   
     
  try{  
   //update username  
      parseddata.reguser ? await MemDb.findByIdAndUpdate(duser.userId, {reguser : parseddata.reguser})
      : await MemDb.findByIdAndUpdate(duser.userId, {reguser : memb.reguser});

       //update firstname  
       parseddata.firstname ? await MemDb.findByIdAndUpdate(duser.userId, {firstname : parseddata.firstname})
       : await MemDb.findByIdAndUpdate(duser.userId, {firstname : memb.firstname});

        //update lastname  
      parseddata.lastname ? await MemDb.findByIdAndUpdate(duser.userId, {lastname : parseddata.lastname})
      : await MemDb.findByIdAndUpdate(duser.userId, {regemail : memb.lastname}); 
      res.status(200).json({message : 'ok'});
  }   catch(err) {
      res.status(500).send('An Error Occured , pls try again.');
  }
});  
  
app.use('/updatesecurity', authenticate);
app.get('/updatesecurity', async (req,res)=>{  

   const mywishlists = await WishlistDb.find({
      wisher : res.locals.user.userId, 
    });    
    const mycarts = await CartDb.find({
      carter : res.locals.user.userId, 
    });  
  
    if(mywishlists.length > 0 || mycarts.length > 0) {
     res.render('./pages/updatepswd', { mwl: mywishlists.length, mct : mycarts.length}); 
    } else {
   res.render('./pages/updatepswd', { mwl : 0, mct : 0});  
 }    
}); 

 
app.post('/updateprofilepassword', async (req,res)=>{
       const updd = req.body; 
       const duser = res.locals.user;  
       //let's check if the old password entered is correct 
       try{
         const memb = await MemDb.findOne({_id: duser.userId}); 
         await bcrypt.compare(updd.oldpswd, memb.regpass, async function (err, auser){ 

              if(err){
                  res.status(401).send('OOPS..Something went wrong');
              } 
               

    else{
              if(auser){  
               console.log(updd.mainpswd);
               const memb = await MemDb.findOne({_id: duser.userId}); 
               //user passed the challenge of correct credentials entry
               await MemDb.findByIdAndUpdate(memb._id, 
                  {regpass: await bcrypt.hash(updd.mainpswd, saltRounds)}
               );
       //check for verification
       res.status(200).json({message : 'good'});
      }   

         else{
         res.status(401).send('OOPS..Old Password doesn"t match with existing one!');     
         }
   }

                 
         });  
       } catch (err) {
           res.status(500).send('An error occured');
       }
});  


app.post('/upldpfp', upload.single('profilePicture'), async (req,res)=>{
      const pfp = req.file;
      console.log(pfp);  
      const duser = res.locals.user;
      try{
         await MemDb.findByIdAndUpdate(duser.userId, {
            'profilepicture.originalname': pfp.originalname,
            'profilepicture.mimetype': pfp.mimetype,
            'profilepicture.size': pfp.size,
            'profilepicture.path': `/uploads/${pfp.filename}`,
        }, { new: true });  
               res.status(200).json({msg : 'uploaded'});
      }   catch (err) {
            console.log(err);
            res.status(500).json({msg : 'error occured'});
      }
});
 

 
 
app.use('/carts', authenticate); 
app.get('/carts', async(req, res)=>{  
    
    //send along the geolocation api key for autocomplete feature in the address input box
    //we would be using HERE api for this feature.
    const hereApi = process.env.HERE_API_KEY;

   const ouser = res.locals.user; 
   const carts = await CartDb.find({carter : ouser.userId}).populate('carter').populate('product').exec(); 
   
      const mywishlists = await WishlistDb.find({
         wisher : res.locals.user.userId, 
       });    
       const mycarts = await CartDb.find({
         carter : res.locals.user.userId, 
       });  
     
       if(mywishlists.length > 0 || mycarts.length > 0) {
        res.render('./pages/cart', { mwl: mywishlists.length, mct : mycarts.length, carts : carts, hereApi}); 
       } else {
      res.render('./pages/cart', { mwl : 0, mct : 0, carts : carts, hereApi});  
    }      
});     

 


app.use('/wishlist', authenticate); 
app.get('/wishlist', async(req, res)=>{ 
   const ouser = res.locals.user; 
   const wishlists = await WishlistDb.find({wisher : ouser.userId}).populate('wisher').populate('product').exec(); 
   
      const mywishlists = await WishlistDb.find({
         wisher : res.locals.user.userId, 
       });    
       const mycarts = await CartDb.find({
         carter : res.locals.user.userId, 
       });  
     
       if(mywishlists.length > 0 || mycarts.length > 0) {
        res.render('./pages/wishlist', { mwl: mywishlists.length, mct : mycarts.length, wli : wishlists}); 
       } else {
      res.render('./pages/wishlist', { mwl : 0, mct : 0, wli : wishlists});  
    }      
});     

 
 

  app.use('/checkout-edit', authenticate); 
app.get('/checkout-edit/:cartid', async(req, res)=>{  
   const cartId = await req.params.cartid; 
   const thecart = await CartDb.findOne({ _id : cartId}).populate('service').populate('user').exec(); 
   if(thecart){ 
      res.render('./pages/editcart', {thecart}
      );
   }   
   else{
      res.redirect('/dashboard');
   }
});    


app.use('/checkout-delete', authenticate); 

app.get('/checkout-delete/:cartid', async(req, res)=>{  
   const cartId = await req.params.cartid; 
   const thecart = await CartDb.findOne({ _id : cartId}); 
   if(thecart){ 
      await CartDb.findByIdAndDelete(cartId);  
      res.redirect('/checkout');
   }   
   else{
      res.redirect('/dashboard');
   }
});  

   

   app.use('/postcart', authenticate);
 app.post('/postcart', async (req,res)=>{
   const theuser = await res.locals.user;
     const serviceId = await req.body.cartId; 

     try{
     const service = await ServiceDb.findOne({_id : serviceId});
     if(service){
          await CartDb.create({
               //provided that session , duration and population field are already set to default
            //now let's save the service the cart belongs to and user that carted it
            service : serviceId,
            user : theuser.userId,
            });
            res.status(200).send('added');
     } 
     else{
       res.status(400).send('Unable to add to cart'); 
     }
   } 

   catch(err){
      res.status(400).send(err); 
   } 
});
 

//log out user
app.get('/logout', (req, res) => {
   // Check if the 'authToken' cookie is present
   const token = req.cookies.authToken;
   
   if (token) {
       // Clear the cookie
       res.clearCookie('authToken'); 
       // Assuming you have middleware that sets `res.locals.user`
       const user = res.locals.user; 
       if (user && user.role === 'admin') {
           res.redirect('/admin-control-login');
           return;
       }
       if (user && user.role === 'admin') {
         res.redirect('/login');
         return;
     }
   }

   // Redirect to the login page if no valid token or user is found
   res.redirect('/login');
});


 
     

app.post('/uploadaproduct', upload.array('producimgv'), async (req,res)=>{  

    
     const uploadedfiles = req.files.map(file=>({
      originalname : file.originalname,
      mimetype : file.mimetype,
      size : file.size,
      path : 'uploads/' + file.filename,  
     })); 
      
     //stringified formData requires manual parsing to be also available in req.body
     const sizes = JSON.parse(req.body.sizes); // This should be an array of objects (size options)
   

   try{ 

     const newProd = {
          productName : req.body.productname, 
          productDescription : req.body.proddesc,
          priceuk : req.body.prodpriceuk,   
          pricena : req.body.prodpricena,  
          category : req.body.prodcategory,  
          productWeight : req.body.prodweight,  
          productHeight : req.body.prodheight, 
          productLength : req.body.prodlength, 
          productWidth : req.body.prodwidth, 
          productImage : uploadedfiles,  
          variation : [
              {
                 sizes : sizes,
              },
          ],
      }   

       
       if(!req.files){
         console.log('file not received'); 
       }

       else{
      await ProductDb.create(newProd);
       res.status(200).json({message : 'success'});   
       console.log(newProd);
       }

   }
 

    catch(err){
       console.log(err); 
       res.status(500).send(err); 
    }
   
   

});      
   

//let's handle the deletion of a product 
 app.delete('/deletingprod/:productid', async (req, res)=>{ 
   try{
       const dproductid = req.params.productid;
       //retrieve and delete the product
       await ProductDb.findByIdAndDelete(dproductid);  
       res.status(200).json({msg : 'success'});
   } catch(err) {
           res.status(500).send('An error occured , check your internet connection');
   }
 });      


 
  //let's handle the removal of an item from wishlist
 app.delete('/delete-wishlist-item/:itemid', async (req, res)=>{ 
  try{
      const dproductid = req.params.itemid;
      //retrieve and delete the product
      await WishlistDb.findByIdAndDelete(dproductid);  
      res.status(200).json({msg : 'success'});
  } catch(err) {
          res.status(500).send('An error occured , check your internet connection');
  }
});     




  //let's handle the removal of an item from cart
  app.delete('/delete-cart-item/:itemid', async (req, res)=>{ 
    try{
        const dproductid = req.params.itemid;
        //retrieve and delete the product
        await CartDb.findByIdAndDelete(dproductid);  
        res.status(200).json({msg : 'success'});
    } catch(err) {
            res.status(500).send('An error occured , check your internet connection');
    }
  });   

  

  //modifying a cart  
  app.post('/modifyingcarti/:itemid', async (req, res)=>{ 
    try{
        const dproductid = req.params.itemid; 
        console.log(dproductid); 
 

        const dnewdata = {
            quantity : req.body.quantity,
            size : req.body.sizename, 
            totalprice :  req.body.sizeprice,
        }

        //retrieve and update the product
        const nnn = await CartDb.findByIdAndUpdate(dproductid, dnewdata, {new:true});  
        console.log(nnn); 
        res.status(200).json({msg : 'success'});
    } catch(err) {
            res.status(500).send('An error occured , check your internet connection');
            console.log(err);
    }
  });   

  

  app.post('/submit-an-order', async (req, res) => { 
    console.log(req.body);  
    try {
        // Ensure cartDetails is an array
        const cartItems = req.body.cartDetails.map(item => ({
            product: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            size: item.size,
            itemWeight: item.weight,  
            length: item.length || '10cm',    
            width: item.width || '10cm',       
            height: item.height || '10cm',     
            totalPrice: item.totalPrice + '£',
        }));

        const savedData = await OrdreqDb.create({
            customer: res.locals.user.userId, 
            cartDetails: cartItems, // Directly using the structured array
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            mobile: req.body.mobile,
            address1: req.body.address1,
            address2: req.body.address2,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,  
            dateAdded: Date.now(),       // Current date
        });

        console.log(savedData);
        //delete user's carts
        await CartDb.deleteMany({
            carter : res.locals.user.userId
        });
        res.json({ msg: 'success' });
    } catch (err) {
      if (err.name === 'ValidationError') {  
         const errorMessages = Object.values(err.errors).map(error => error.message);
         res.status(500).send(errorMessages.join(', '));
      }
        console.error(err);     
    }
});  

  

app.use('/orderrequests', admTok);

app.get('/orderrequests', async (req, res) => {
  const user = res.locals.user; // Ensure this is set by the middleware
  console.log('User details:', user); // Log user details

  try {
    const orders = await OrdreqDb.find({
      ordreqStatus: 'reviewing'
    });
    const mywishlists = await WishlistDb.find({ wisher: user.userId });
    const mycarts = await CartDb.find({
       carter: user.userId
      });

    if (user && user.role === 'admin') {  
      console.log('User is an admin');
      res.render('./pages/orderrequest', { 
        mwl: mywishlists.length, 
        mct: mycarts.length, 
        orders 
      });
    } else { 
      console.log('User is not an admin, redirecting to login');
      res.render('./pages/adminlogin', { 
        mwl: mywishlists.length, 
        mct: mycarts.length, 
        validationString // Ensure this is defined somewhere
      });  
    }
  } catch (error) {
    console.error("Error processing order requests:", error);
    res.status(500).send("Internal Server Error");
  }
});  


//decline order and send reason to user email
  
app.post('/decline-order/:currentOrderId/:userEmail', async (req, res)=> {
      const orderId = req.params.currentOrderId;  
      const useremail = req.params.userEmail; 
      const username = res.locals.user.reguser;
      console.log(useremail);
      const reason = req.body.reason;
      //send user email with reason
        //create SMTP transporter 
        try{
     const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user:process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }
  });

     //set mail option
     const mailOptions = {
      from: 'ufashion744@gmail.com',
      to: useremail,
      subject: 'Order Declined',
      html: `
          <img style='width:100%' src='https://res.cloudinary.com/drpmtitnn/image/upload/c_fill,g_auto,h_250,w_970/c_scale,co_rgb:ffffff/v1727764114/uniquea_x46mai.jpg'> <br><br>
          Hi <b>${username}</b>, <br><br>
          We regret to inform you that your order has been declined. 
          The reason for the decline is: <b>${reason}</b>.<br><br>
          If you have any questions or need further assistance, feel free to reach out to us.<br><br>
          Thank you for your understanding.<br>
          Best regards,<br>
          Unique Fashion Team
      `,
  };
  

  


     transporter.sendMail(mailOptions, (error, info)=>{
           if(error){
             console.log(error);
           } else{
               res.status(200).send('success');
           }
     });   

     //Delete the order info from database
      await OrdreqDb.findByIdAndDelete(orderId);
      res.json({msg : 'successfully declined'});
    }  catch(err) {
        res.status(400).send(err); 
        console.log(err);
    }
}); 


   

  //Accept order and return payment guide to user's email  
  app.post('/accept-order/:currentOrderId/:userEmail', async (req, res) => {
    const orderId = req.params.currentOrderId;   
    const useremail = req.params.userEmail; 
    const shippingFee = parseFloat(req.body.shippingFee).toFixed(2);  
    const totalPrice = parseFloat(req.body.totalPrice).toFixed(2); 
    const totalPayment = (parseFloat(shippingFee) + parseFloat(totalPrice)).toFixed(2);  
    const username = res.locals.user.reguser; 

    const orderInfo = await OrdreqDb.findOne({_id: orderId});
    
    // Constructing the order summary with quantity and size
    const orderDetails = orderInfo.cartDetails.map(item => {
        return `<li>${item.productName}: <b>£${parseFloat(item.totalPrice).toFixed(2)}</b> (Quantity: ${item.quantity}, Size: ${item.size})</li>`;
    }).join('');

    // URL construction 
    const acceptedOrdersPaymentPagelink = `${req.protocol}://${req.get('host')}/checkout_accepted_orders/${res.locals.user.userId}`;
    console.log(acceptedOrdersPaymentPagelink);
    try {    
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.sendinblue.com', 
            port: 587,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASS,
            }
        });
   
        // Set mail option
        const mailOptions = {
            from: 'ufashion744@gmail.com',
            to: useremail,
            subject: 'Order Accepted',
            html: `
                <img style='width:100%' src='https://res.cloudinary.com/drpmtitnn/image/upload/c_fill,g_auto,h_250,w_970/c_scale,co_rgb:ffffff/v1727764114/uniquea_x46mai.jpg'> <br><br>
                Hi <b>${username}</b>, <br><br>
                We are happy to inform you that your order has been successfully accepted. 
                Here are the details of your order:<br><ul>${orderDetails}</ul><br>
                The shipping fee is <b>£${shippingFee}</b>, which makes your order payment a total of: <b>£${totalPayment}</b>.<br>
                Click on the button below to proceed to payment:<br><br>
                <a href='${acceptedOrdersPaymentPagelink}'><button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">CHECKOUT</button></a><br><br>
                If you have any questions or need further assistance, feel free to reach out to us.<br><br>
                Thank you for your understanding.<br>
                Best regards,<br>
                Unique Fashion Team
            `,
        };
      
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                res.status(200).send('success');
            }
        });    
        const shippingFeeInPounds = shippingFee + '£'; 
        // Update the order info in the Database 
        const updatedOrderinfo = await OrdreqDb.findByIdAndUpdate(orderId, {ordreqStatus: 'accepted', shippingFee: shippingFeeInPounds} ,{new : true});
         console.log(updatedOrderinfo);
        res.json({ msg: 'successfully accepted' });
    } catch (err) {
        res.status(400).send(err); 
        console.log(err);
    }
});  




//let the checkout happens in a page  
app.use('/checkout_accepted_orders/:userId', authenticate); 
app.get('/checkout_accepted_orders/:userId', async (req, res) => {
  const userId = req.params.userId;

  // Fetch the order information from the database
  const orderInfos = await OrdreqDb.find({ customer: userId, ordreqStatus: 'accepted', paymentStatus : 'pending' });
     

  if (!orderInfos) {
      return res.render('./pages/notanorder');
  } 


  const mywishlists = await WishlistDb.find({
    wisher : res.locals.user.userId, 
  });    
  const mycarts = await CartDb.find({
    carter : res.locals.user.userId, 
  });  
 

  // Render the checkout page with order details
  res.render('./pages/checkoutaccepted', {
      userId,  
      orderDoc : orderInfos,  
      mwl: mywishlists.length,
      mct : mycarts.length,
  });
});   


//Delete an order info from the accepted orders' page
 app.delete('/delete_an_orderr/:orderId', async (req,res)=>{
        const orderId = req.params.orderId;
        try{
            await OrdreqDb.findByIdAndDelete(orderId);
            res.json({msg : 'success'});
        } catch(err) {
            res.status(500).send('Oops, an error occurred');
        }
 });




 //let's handle the deletion of a product image
 app.delete('/deletingprodimg/:imgId/:imglength', async (req, res) => {
   console.log('Fetching');

   try {
       const imgId = req.params.imgId;  // Image ID to delete 
       // Check if at least one image remains
       const imglnt = req.params.imglength;
       if (imglnt <= 1) {
           return res.status(400).send('Can\'t delete all images; at least one should be left.');
       }

       // Find the product containing the image
       const product = await ProductDb.findOne({ 'productImage._id': imgId });
       if (!product) {
           return res.status(404).send('Product or image not found.');
       }

       // Remove the image using $pull
       await ProductDb.updateOne(
           { _id: product._id },
           { $pull: { productImage: { _id: imgId } } }
       );
  
       res.status(200).json({ msg: 'Image deleted successfully' });
   } catch (err) {
       console.error(err);
       res.status(500).send('An error occurred; check your server logs.');
   }
});

  

app.post('/postingcontent', upload.single('postImage'), async (req,res)=>{
 

   try{ 

     const newPost = {
          posttitle : req.body.posttitle, 
          postbody : req.body.postbody,
          author : req.body.author, 
          postImage : {
               originalname : req.file.originalname,
               mimetype : req.file.mimetype,
               size : req.file.size,
               path : 'uploads/' + req.file.filename,
          },
      }   

       
       if(!req.file){
         console.log('file not received'); 
       }

       else{
      await BlogDb.create(newPost);
      res.status(307).json({message : 'success'});  
      console.log('success');  
     console.log(newPost);
       }

   }
 

    catch(err){
       console.log(err);
    }
   
   

});      
 

app.use('/admin-control-product', admTok);
app.get('/admin-control-product', async (req,res)=>{
   const user = res.locals.user; 

   if(user && user.role === 'admin'){    

      const mywishlists = await WishlistDb.find({
         wisher : res.locals.user.userId, 
       });    
       const mycarts = await CartDb.find({
         carter : res.locals.user.userId, 
       });  
     
       if(mywishlists.length > 0 || mycarts.length > 0) {
        res.render('./pages/postproduct', { mwl: mywishlists.length, mct : mycarts.length}); 
       } else {
      res.render('./pages/postproduct', { mwl : 0, mct : 0});  
    }    
   }  else {
     res.redirect('/admin-control-login');
  }

});
   



//Adding to wishlist  
app.post('/addwishlist', async (req,res)=>{
  const productId = req.body.prodId;  
  const duser = res.locals.user;  
    
  if(!duser) {
   return res.status(402).send('This action is only for authenticated users'); 
} 

  try{ 
   const checklist = await WishlistDb.findOne({
         wisher : duser.userId,   
         product : productId,
   });      
   if(checklist) {
       res.status(302).send('Can\'t add a product to wishlist twice');
   } else {     

         //A random size to store in the wishlist  model since the  button is not clearly revealing the whole info yet.
   const unproduct = await ProductDb.findOne({ _id: productId}); 
   // Collect all sizes from variations
   const allSizes = unproduct.variation
   .map(variation => variation.sizes)  // Get sizes array
   .flat();  // Flatten the nested arrays into a single array
 const sizelength = Math.floor(Math.random() * allSizes.length);   
 const randomsizeresult = allSizes[sizelength];
 const sizeName = randomsizeresult.sizeName;
 const totalPrice = randomsizeresult.priceAdjustmentUk;

    //first add to wishlist
     await WishlistDb.create({
       wisher : duser.userId,
       product : productId, 
       quantity : 1, 
       size : sizeName, 
       totalprice : totalPrice,
   }); 
//then update the home icon 
     const mywishlists = await WishlistDb.find({
       wisher : res.locals.user.userId, 
     });  
     console.log(mywishlists);
        if(mywishlists.length > 0) {
       res.status(200).json({mwl : mywishlists.length, colour : 'red'}); 
      } else { 
      res.status(200).json({mwl : 0, colour : 'black'});  
      }
   }
 }  catch(err) { 
      console.log(err);
      res.status(500).send('Something went wrong , please check your internet connection')
  }
});  


   

//Adding to cart 
app.post('/addingtocart', async (req,res)=>{
   const productId = req.body.prodId;  
   const duser = res.locals.user;   
   //A random size to store in the cart model since the add to cart button is not clearly revealing the whole cart info yet.
   const unproduct = await ProductDb.findOne({ _id: productId}); 
     // Collect all sizes from variations
     const allSizes = unproduct.variation
     .map(variation => variation.sizes)  // Get sizes array
     .flat();  // Flatten the nested arrays into a single array
   const sizelength = Math.floor(Math.random() * allSizes.length);   
   const randomsizeresult = allSizes[sizelength];
   const sizeName = randomsizeresult.sizeName;
   const totalPrice = randomsizeresult.priceAdjustmentUk;
     
   if(!duser) {
    return res.status(402).send('This action is only for authenticated users'); 
 } 
 
   try{ 
    const checklist = await CartDb.findOne({
          carter : duser.userId,   
          product : productId, 
    });      
    if(checklist) {  
        res.status(302).send('Can\'t add a product to cart twice, you can edit the quantity in your cart page');
    } else {   
     //Add to cart with A CONDITION that checks if size and price is passed in req.body or we randomly choose from the ones attached to the product  
       if(req.body.price && req.body.size) {
     await CartDb.create({
        carter : duser.userId,
        product : productId, 
        quantity : req.body.quantity, 
        size : req.body.size, 
        totalprice : req.body.price,
    });      
   }   else {
   //size and total price is generated here randomly cos no req.body info for them
   await CartDb.create({
      carter : duser.userId,
      product : productId, 
      quantity : 1, 
      size : sizeName, 
      totalprice : totalPrice, 
       
  }); 
}
      const mycarts = await CartDb.find({
        carter : res.locals.user.userId, 
      });  
      console.log(mycarts);
         if(mycarts.length > 0) {
        res.status(200).json({mwl : mycarts.length, colour : 'red'}); 
       } else { 
       res.status(200).json({mwl : 0, colour : 'black'});  
       }
    }
  }  catch(err) { 
       console.log(err);
       res.status(500).send('Something went wrong , please check your internet connection')
   }
 });   
 



   //Adding to cart from wishlist 
app.post('/addacartfromwishlist', async (req,res)=>{
  const productId = req.body.prodId;   
  console.log(productId);
  //A random size to store in the cart model since the add to cart button is not clearly revealing the whole cart info yet.
  const unproduct = await ProductDb.findOne({ _id: productId}); 
   

  try{ 
   const checklist = await CartDb.findOne({
         carter : res.locals.user.userId,   
         product : productId,
   });      
   if(checklist) {  
       res.status(302).send('Can\'t add a product to cart twice, you can edit the quantity in your cart page');
   } else {    
    await CartDb.create({
       carter : res.locals.user.userId,
       product : productId, 
       quantity : req.body.quantity, 
       size : req.body.size, 
       totalprice : req.body.price,
   });   
   
     const mycarts = await CartDb.find({
       carter : res.locals.user.userId, 
     });  
     
        if(mycarts.length > 0) {
       res.status(200).json({mwl : mycarts.length}); 
      } else { 
      res.status(200).json({mwl : 0});  
      }
   }
 }  catch(err) { 
      console.log(err);
      res.status(500).send('Something went wrong , please check your internet connection')
  }
});   





  


app.post('/postingservice', upload.single('serviceImage'), async (req,res)=>{
 

   try{ 

     const newService = {
          serviceName : req.body.serviceName, 
          servicePrice : req.body.servicePrice,
          serviceDescription: req.body.serviceDescription, 
          serviceImage : {
               originalname : req.file.originalname,
               mimetype : req.file.mimetype,
               size : req.file.size,
               path : 'uploads/' + req.file.filename,
          },
      }   

       
       if(!req.file){
         console.log('file not received'); 
       }

       else{
      await ServiceDb.create(newService);
      res.status(200).send({message : 'success'});  
     console.log(newService);
       }

   }
 

    catch(err){
       console.log(err);
    }
   
   

});      


  
  
    //editing post


    //first make the post informations available to the editing page
app.get('/admin-control-edit-6gv119jsbv532vgewti26/:postId', async (req,res)=>{
   const postid = req.params.postId; 
   const user = res.locals.user;
   if(user && user.role === 'admin'){ 

   const thepost = await BlogDb.findOne({ _id : postid });

   if(thepost){
   res.render('./pages/admin-control-edit', {thepost});
   }
   
   else{
      res.status(404).send('post not found');
   }
}  else{ 
   res.render('./pages/adminlogin.ejs', {validationString});
}

 
}); 

//update
app.put('/posting-edited-content/:cartId', async (req, res) => {
   const cartId = req.params.cartId;
    // Corrected variable name to camelCase
   try {
       const cart = await CartDb.findById(cartId);
        // Using findById instead of findOne with _id
       if (cart) {
           const updatedCart = {
               session: req.body.session,
               day: req.body.day,
           };
           const updated = await CartDb.findByIdAndUpdate(cartId, updatedCart, { new: true });
           if (updated) {
               res.status(200).send('Success');
           } else {
               res.status(500).send('Error updating cart');
           }
       } else {
           res.status(404).send('Cart not found'); // Changed status code to 404 for resource not found
       }
   } catch (err) {
       console.error(err); // Log the error for debugging
       res.status(500).send('Something went wrong');
   }
});
  






//update

app.put('/posting-edited-contentb/:postId', upload.single('videofile'), async (req,res)=>{
   const postid = req.params.postId;  
   try{   
   const post = await BlogDb.findOne({ _id : postid});
   if(post) {
     const updatedPost = {
          posttitle : req.body.posttitle,
          bibleverse : req.body.bibleverse,
          postbody : req.body.postbody,
          author : req.body.author, 
          postImage: req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: 'uploads/' + req.file.filename,
        } : post.postImage,
      }  
        const updated = await BlogDb.findByIdAndUpdate(postid, updatedPost, {new : true});
        res.status(200).send('Success');
      } 

       else{ 
      res.status(307).send('Error updating contents');   
       }
        
   }
 

   catch(err){ 
      console.log(err);
      res.status(500).send('Something went wrong');
  }
   
   

});   
    

  
//update

app.put('/posting-edited-contentc/:serviceId', upload.single('productImage'), async (req,res)=>{
   const serviceid = req.params.serviceId;
   console.log(JSON.parse(req.body.sizes));  
   try{   
   const service = await ProductDb.findOne({ _id : serviceid});
   if(service) {
     const updatedPost = {
          productName: req.body.productName, 
          priceuk: req.body.priceUk,  
          pricena: req.body.priceNa,   
          productDescription: req.body.prodDesc, 
          productWeight: req.body.prodWeight,  
          variation: [
              { 
               sizes : JSON.parse(req.body.sizes),  //necessary to parse stringified formData, it requires manual handling, dont forget victor
           }
      ],
        
      }  
      
      
      if (req.file) {
         await ProductDb.updateOne(
             { _id: serviceid },
             { $push: { productImage: {
                 originalname: req.file.originalname,
                 mimetype: req.file.mimetype,
                 size: req.file.size,
                 path: 'uploads/' + req.file.filename
             } } }
         );
     }
     


        const updated = await ProductDb.findByIdAndUpdate(serviceid, updatedPost, {new : true});
        res.status(200).json({msg : 'Success'});
      } 

       else{ 
      res.status(307).send('Error updating contents');   
       }
        
   }
 

   catch(err){ 
      console.log(err);
      res.status(500).send('Something went wrong');
  }
   
   

});    


//delete a size group from the variation 

app.delete('/adelete/:groupId/:overallsizegrouplength', async (req,res)=>{
   const groupid = req.params.groupId;
   console.log(groupid); 

   // Find a document that contains the groupid in the array
   const tg = await ProductDb.findOne({
      'variation.sizes._id': groupid
  });

    
       if (!tg) {
          return res.status(404).send('Document not found');
      }
    
   try{  
      const sizeslength = req.params.overallsizegrouplength;
       if(sizeslength > 1){
            // Remove the size from the array
            await ProductDb.updateOne(
               { 'variation.sizes._id': groupid},
               { $pull: { 'variation.$.sizes': { _id: groupid } } }
           );
           res.status(200).json({'message' : 'sucessful'});
       } 

       else{
         res.status(404).send('Make sure you are not deleting all the size groups, at least one should be left unremoved');
       }
   }  
   
   catch(err){
       res.status(500).send('Something went wrong');
       console.log(err);
   }
});



   //Delete Blog post

   app.delete('/admin-control-delete-v62gw278yxe5/:postId', async (req,res)=>{
         const postid = req.params.postId;
         try{ 
            const thepost = await BlogDb.findOne({ _id: postid});
             if(thepost){
                 await BlogDb.findByIdAndDelete(postid);
                 res.status(200).json({'message' : 'sucessful'});
             } 

             else{
               res.status(404).send('Post not found');
             }
         }  
         
         catch(err){
             res.status(500).send('Something went wrong');
         }
   });
     

   app.get('/upcomingevents', (req,res)=>{
      res.render('./pages/upcoming');
   });  

   app.get('/reset-password', (req,res)=>{
      res.render('./pages/fp');
   }); 
 
   

    app.post('/submitemail', async (req,res)=>{ 
         
    try{
           //check if email is available in database
      const email = req.body.anemail;
      const mememail = await MemDb.findOne({ regemail: email}); 
      if(mememail){
      //create token to reset password
      const resetToken = jwt.sign({userid : mememail._id}, process.env.JWT_SECRET_KEY, {
         expiresIn : '15m'});  
         //create reset link from reset token
         const resetLink = `${req.protocol}://${req.get('host')}/resetpassword/?auser=${mememail._id}&token=${resetToken}`;

     ///create SMTP transporter
     const transporter = nodemailer.createTransport({
      host: 'smtp-relay.sendinblue.com', 
      port: 587,
      auth: {
          user:process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASS,
      }
  });

     //set mail option
     const mailOptions = {
      from: 'ufashion744@gmail.com',
      to: mememail.regemail,
      subject: 'Reset password',
      text: `To reset your password, click on this link: ${resetLink}. Note that it expires after 15 minutes.`
   }; 


     transporter.sendMail(mailOptions, (error, info)=>{
           if(error){
             console.log(error);
           } else{
               res.status(200).send('success');
           }
     });
   } else{
       res.status(404).send('Email not available in our database');
   }
 }

   catch(err){
      res.status(500).send(err);
      console.log(err);
   } 
   }); 



   //verify the token
   app.get('/resetpassword', async (req,res)=>{
      const duser = req.query.auser;
      const ouser = await MemDb.findOne({_id: duser});

      if(ouser){
         const token = req.query.token;
         jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
               if(err){ 
                  console.log(err);
                  res.status(404).redirect('/notfound');
               } 
               res.render('./pages/setpass', {ouser});
         });
      }

      else{
         res.status(404).redirect('/notfound');
      }
   }); 

    
 

   app.put('/submitpass/:userId', async(req,res)=>{
         const onewpassword = req.body.regpass;
         const newpassword = await bcrypt.hash(onewpassword, saltRounds);
         const userid = req.params.userId;
          const user = await MemDb.findOne({_id: userid});
          const newpswd = {
             regpass : newpassword,
          }
          
          if(user){
              const updatedpswd = await MemDb.findByIdAndUpdate(userid, newpswd, {new : true});
                res.json({message : 'ok'});
              console.log(updatedpswd);  
            } else{
             res.status(400).send('Error resetting password');
          }
   });
     



     app.get('/terms', (req,res)=>{
       res.render('./pages/terms');
     });

   // Wildcard route to handle all other routes (Not found pages)
   app.get('/*', (req,res)=>{
      res.render('./pages/notfound.ejs');
   });     


app.listen(3000 , '0.0.0.0', ()=>{
   console.log('listening to the port 3000');
});   