import Image from "next/image";
// import { ReactComponent as BackArrow } from "@/assets/icons/heroicons-outline_arrow-left.svg"

interface SignupFormProps {
  prop1: string;
  prop2: string;
}



/**
 * Use JSDoc styling right above the header if this component is important.
 * z`
 * Also, the name of the component should capitalized, and the file should be the same.
 * */
const SignupForm = (props: SignupFormProps) => {
  const { prop1, prop2 } = props;
  
    return (
        <div style={{ 
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #6B6B6B",
            borderRadius: "8px",
            marginTop: "220px",
            marginBottom: "220px",
            width: 792,
            }}>
            <img src="/public/heroicons-outline_arrow-left.svg"/>
            <h1 style={{ 
                fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                color: "#234254", 
                fontSize: "36px", 
                fontWeight: 500, 
                marginTop: "74px",
                marginBottom: "24px",
                textAlign: "center"}}
            >
                Welcome to <br /> Boston Community Pediatrics!
            </h1>
            <p style={{
                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                color: "#000000", 
                fontSize: "24px", 
                fontWeight: 400,
                fontStyle: "Roman",
                textAlign: "center",
                marginBottom: "64px"
            }}>
                Create an account to start volunteering
            </p>
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 40,
                marginLeft: "102px",
                marginRight: "102px"
            }}>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 60
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="first name"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontWeight: 400,
                                fontStyle: "Roman",
                                color: "#6B6B6B",
                            }}
                        >
                            First Name
                        </label>
                        <input 
                        required
                        style={{ 
                            width: 264, 
                            height: 43, 
                            borderRadius: 8, 
                            border: "1px solid #6B6B6B",
                            fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                            color: "#6B6B6B", 
                            fontSize: "16px", 
                            fontWeight: 400,
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="last name"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Last Name
                        </label>
                        <input 
                        required
                        style={{ 
                            width: 264, 
                            height: 43, 
                            borderRadius: 8, 
                            border: "1px solid #6B6B6B",
                            fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                            color: "#6B6B6B", 
                            fontSize: "16px", 
                            fontWeight: 400,
                            padding: 12
                            }}>
                        </input>
                    </div>
                </div>
                <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="email"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Email
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="phone number"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Phone Number
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="date of birth"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Date of Birth
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="street address"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Street Address (optional)
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="apt, suit, etc"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Apt, suite, etc (optional)
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="city"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B"
                            }}
                        >
                            City (optional)
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 60
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="first name"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontWeight: 400,
                                fontStyle: "Roman",
                                color: "#6B6B6B",
                            }}
                        >
                            State (optional)
                        </label>
                        <input 
                        required
                        style={{ 
                            width: 264, 
                            height: 43, 
                            borderRadius: 8, 
                            border: "1px solid #6B6B6B",
                            fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                            color: "#6B6B6B", 
                            fontSize: "16px", 
                            fontWeight: 400,
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="zip code"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Zip code (optional)
                        </label>
                        <input 
                        required
                        style={{ 
                            width: 264, 
                            height: 43, 
                            borderRadius: 8, 
                            border: "1px solid #6B6B6B",
                            fontFamily: "Avenir, Helvetica, Arial, sans-serif", 
                            color: "#6B6B6B", 
                            fontSize: "16px", 
                            fontWeight: 400,
                            padding: 12
                            }}>
                        </input>
                    </div>
                </div>
                <p style={{ 
                    marginLeft: 324,
                    marginTop: 105,
                    marginBottom: 105, 
                    fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                    fontSize: "20px",
                    fontStyle: "Roman",
                    fontWeight: 400,
                    color: "#000000"
                }}>
                    Upload a profile photo <br /> (optional)
                </p>
                <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="street address"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Create Password
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "left"
                    }}>
                        <label
                            htmlFor="street address"
                            style={{
                                fontFamily: "Avenir, Helvetica, Arial, sans-serif",
                                fontSize: "16px",
                                fontStyle: "Roman",
                                fontWeight: 400,
                                color: "#6B6B6B",
                            }}
                        >
                            Confirm Password
                        </label>
                        <input 
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
                            padding: 12
                            }}>
                        </input>
                    </div>
            </div>
            <p style={{ // filler for button
                marginTop: "90px",
                marginBottom: "70px",
                fontSize: "16px"
            }}>button</p>
        </div>
    )
};

export default SignupForm;
