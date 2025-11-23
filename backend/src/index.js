import dotenv from "dotenv";
dotenv.config({ path: "./.env" });      
import connectDB from "./db/index.js";   
import app from "./app.js";


console.log("🚀 App starting...");

connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err)=>{
    console.log("Error in DB connection", err)
});