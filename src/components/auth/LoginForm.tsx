const LoginForm = () => {
  return (
    <div className="flex flex-col items-center gap-8 border border-[#6B6B6B] rounded-lg w-[792px] pt-[50px] px-[102px] pb-[60px] box-border">
      <h1 className="text-[#234254] text-[36px] font-medium m-0">Sign In</h1>

      {/* Email */}
      <input
        placeholder="Email"
        required
        className="w-full h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />

      {/* Password */}
      <input
        placeholder="Password"
        required
        type="password"
        className="w-full h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
      />

      {/* Button Placeholder */}
      <div className="w-[174px] h-[44px] bg-[#E0E0E0] rounded" />

      {/* Footer Links */}
      <div className="flex flex-row items-center gap-4">
        <a
          href="/login"
          className="text-base text-black no-underline hover:underline"
        >
          Create an account
        </a>
        <div className="w-px h-[22px] bg-black" />
        <a
          href="/forgot-password"
          className="text-base text-black no-underline hover:underline"
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
