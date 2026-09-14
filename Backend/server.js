import app from "./app.js";
import connectDB from "./config/database.js";
import env from "./config/env.js";




await connectDB();

app.listen(env.port, "0.0.0.0", () => {
  console.log(`Server is running on Port ${env.port}`);
});
