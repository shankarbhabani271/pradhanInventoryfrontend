
import React, { useState } from "react";
import { User ,Phone,Mail,FileText, Building2, Send} from "lucide-react";
import { Description } from "@radix-ui/react-dialog";







const Userdetails = () => {

 const [form, setForm] = useState({
  name: "",
  phone: "",
  email: "",
  company: "",
  description: ""
});
    const handleChange = (e) =>{
        setForm({...form,[e.target.name]:e.target.value})
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();
        console.log(form);
        try{
            const res = await fetch("http://localhost:8080/api/userdetails",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(form)
            });
            const data = await res.json();
            alert(data.message);

            //clear form after success
    

        }catch(error){
            alert("Error saving data");
        }
    
    };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-5">
        {/* User info */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">User Details</h2>
          <p className="  text-gray-500 text-sm">
            fill in the details below and we'll get back to you
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1 text-gray-700 flex items-center gap-2">
              <User size={16} />
              <span>Full Name</span>
            </label>
            <input
            name="name"
            onChange={handleChange} 
              type="text"
              placeholder="Enter Your full name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-400 mt-1">
              please provide your complete name for identification
            </p>

            {/*Phone number */}
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Phone size={16} />
                <span>Phone Number</span>
              </label>
              <input
              name="phone"
              onChange={handleChange} 
                type="text"
                placeholder="Enter Your phone number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Used for contact and follow-up communication
              </p>
            </div>
            {/* Email */}
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Mail size={16} />
                <span>Email Address</span>
              </label>
              <input
              name="email"
              onChange={handleChange} 
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                We will send update and responses to this email
              </p>
            </div>
            {/* company*/}
            <div>
              <label className="block font-medium mb-1 flex items-center gap-2">
                <Building2 size={16} />
                <span>Company Name</span>
              </label>
              <input
              name="company"
              onChange={handleChange} 
                type="text"
                placeholder="Enter Your company name"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Please provide your company name for better understanding of
                your needs
              </p>
            </div>
            {/*Description */}
            <label className="block font-medium mb-1 flex items-center gap-2">
                <FileText size={16} />
                <span>Description</span>
              </label>
            <textarea
            name="description"
            onChange={handleChange} 
              placeholder="Enter your message "
              className="w-full px-4 py-2 border rounded-lg focus-within:none focus-within:ring-2 focus-within:ring-blue-500"
            ></textarea>
            <p className="text-sm text-gray-400 mt-1">
              provide detailed information about your needs or inquiry
            </p>
            <br />
            <div>
              <div>
                <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 trans flex items-center justify-center gap-2 ">
                  <Send size={16} />
                  <span>Submit</span>
                </button>
                <p className="text-sm text-gray-400 mt-1 pl-6">
                  Your information is kept secure and used only for
                  communication purposes.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Userdetails;
