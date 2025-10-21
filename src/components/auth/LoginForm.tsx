interface LoginFormProps {
  prop1: string;
  prop2: string;
}

const LoginForm = (props: LoginFormProps) => {
  const { prop1, prop2 } = props;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        border: "1px solid #6B6B6B",
        borderRadius: 8,
        width: 792,
        padding: "50px 102px 60px", // top, sides, bottom
        boxSizing: "border-box",
      }}
    >
      <h1
        style={{
          fontFamily: "Avenir, Helvetica, Arial, sans-serif",
          color: "#234254",
          fontSize: 36,
          fontWeight: 500,
          margin: 0,
        }}
      >
        Sign In
      </h1>

      {/* Email */}
      <input
        placeholder="Email"
        required
        style={{
          width: "100%",
          height: 43,
          borderRadius: 8,
          border: "1px solid #6B6B6B",
          fontFamily: "Avenir, Helvetica, Arial, sans-serif",
          color: "#6B6B6B",
          fontSize: 16,
          fontWeight: 400,
          padding: 12,
        }}
      />

      {/* Password */}
      <input
        placeholder="Password"
        required
        type="password"
        style={{
          width: "100%",
          height: 43,
          borderRadius: 8,
          border: "1px solid #6B6B6B",
          fontFamily: "Avenir, Helvetica, Arial, sans-serif",
          color: "#6B6B6B",
          fontSize: 16,
          fontWeight: 400,
          padding: 12,
        }}
      />

      {/* Button Placeholder */}
      <div
        style={{
          width: 174,
          height: 44,
          backgroundColor: "#E0E0E0", // placeholder
          borderRadius: 4,
        }}
      ></div>

      {/* Footer Links */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <a
          href="/login"
          style={{
            fontSize: 16,
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            color: "#000000",
            textDecoration: "none",
          }}
        >
          Create an account
        </a>
        <div
          style={{
            width: 1,
            height: 22,
            backgroundColor: "#000000",
          }}
        />
        <a
          href="/login"
          style={{
            fontSize: 16,
            fontFamily: "Avenir, Helvetica, Arial, sans-serif",
            color: "#000000",
            textDecoration: "none",
          }}
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
