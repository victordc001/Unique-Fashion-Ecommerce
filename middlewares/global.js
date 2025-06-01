 
 
import jwt from 'jsonwebtoken'; 

 const globalToken = (req, res, next)=>{
    //Extract the token from the browser set cookies
    const token = req.cookies.authToken;

    if(token) { 
    //verify and decode the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{

        if(err) {
            res.locals.user = null;
            console.log(err);
        }   
       res.locals.user = user; 
    });
    
 }     
 
    else{
        res.locals.user = null; 
    }
 
 next();

};

 export default globalToken;