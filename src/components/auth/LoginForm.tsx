// import React from "react";

interface LoginFormProps {
  prop1: string;
  prop2: string;
}



/**
 * Use JSDoc styling right above the header if this component is important.
 * z`
 * Also, the name of the component should capitalized, and the file should be the same.
 * */
const LoginForm = (props: LoginFormProps) => {
  const { prop1, prop2 } = props;
  
    return (
        <div style={{ 
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: 32,
            border: "1px solid #6B6B6B",
            borderRadius: "8px",
            width: 792
            }}>
            <h1 style={{ 
                fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                color: "#234254", 
                fontSize: "36px", 
                fontWeight: 500, 
                marginTop: "50px"}}
            >
                Sign In
            </h1>
            <div className="flex flex-col text-left">
                <input 
                    placeholder="Email"
                    required
                    style={{ 
                        width: 588, 
                        height: 43, 
                        borderRadius: 8, 
                        border: "1px solid #6B6B6B",
                        fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                        color: "#6B6B6B", 
                        fontSize: "16px", 
                        fontWeight: 400,
                        padding: 12, 
                        marginLeft: "102px",
                        marginRight: "102px"
                        }}>
                </input>
            </div>
            <div className="flex flex-col text-left">
                <input 
                    placeholder="Password"
                    required
                    style={{ 
                        width: 588, 
                        height: 43, 
                        borderRadius: 8, 
                        border: "1px solid #6B6B6B",
                        fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                        color: "#6B6B6B", 
                        fontSize: "16px", 
                        fontWeight: 400,
                        padding: 12,
                        marginLeft: "102px",
                        marginRight: "102px"
                        }}>
                </input>
            <div style={{
                width: "174px",
                height: "44px"
            }}>
            </div>
            <div style={{
                width: "174px",
                height: "44px"
            }}>
            </div>
            </div>
            <div className="flex flex-row"
                style={{ 
                    gap: 16,
                    marginBottom: "60px" }}
                >
                <a href="http://localhost:3000/login"
                    style={{ 
                        fontSize: "16px",
                        fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                        fontStyle: "Roman",
                        color: "#000000"
                    }}>
                    Create an account
                </a>
                <div style={{
                    width: "0px",       
                    height: "22px",    // length of the line
                    border: "1px solid #000000",
                    backgroundColor: "#000000", // color of the line
                }}
                ></div>
                <a href="/login"
                    style={{ 
                        fontSize: "16px",
                        fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                        fontStyle: "Roman",
                        color: "#000000"
                    }}>
                    Forgot your password?
                </a>
            </div>
        </div>
        

    )
};

export default LoginForm;