import Image from "next/image";
import BackArrow from "@/assets/icons/arrow-left.svg";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg"
import Link from "next/link";

/**
 * Use JSDoc styling right above the header if this component is important.
 * z`
 * Also, the name of the component should capitalized, and the file should be the same.
 * */
const SignupForm = () => {
  return (
    <div className="flex flex-col items-center border border-[#6B6B6B] rounded-lg mt-[220px] mb-[220px] w-[792px] relative">
      {/* Back arrow */}
      <div className="w-full flex justify-start mt-7 pl-[30px] cursor-pointer">
        <Link href="/">
          <Image src={BackArrow} alt="Back arrow" className="w-[30.86px] h-6" />
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-[#234254] text-[36px] font-medium mt-[74px] mb-6 text-center leading-tight">
        Welcome to <br /> Boston Community Pediatrics!
      </h1>
      <p className="text-black text-2xl font-normal text-center mb-16">
        Create an account to start volunteering
      </p>

      {/* Form fields */}
      <div className="flex flex-col gap-10 mx-[102px]">
        {/* First / Last */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="first-name"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              First Name
            </label>
            <input
              id="first-name"
              required
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="last-name"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Last Name
            </label>
            <input
              id="last-name"
              required
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="email"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="phone"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* DOB */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="dob"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Date of Birth
          </label>
          <input
            id="dob"
            type="date"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Languages Spoken
          </label>
          <input
            id="street"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Street Address (optional)
          </label>
          <input
            id="street"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Apt/Suite */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Apt, suite, etc (optional)
          </label>
          <input
            id="apt"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* City */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="city"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            City (optional)
          </label>
          <input
            id="city"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* State / Zip */}
        <div className="flex flex-row gap-[60px]">
          <div className="flex flex-col items-start">
            <label
              htmlFor="state"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              State (optional)
            </label>
            <input
              id="state"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>

          <div className="flex flex-col items-start">
            <label
              htmlFor="zip"
              className="text-base font-normal text-[#6B6B6B] mb-1"
            >
              Zip code (optional)
            </label>
            <input
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Upload helper text */}
        <p className="flex items-center gap-[60px] text-[20px] text-[#6B6B6B]">
          <Image
            src={ProfilePlaceholder}
            alt="Profile placeholder"
            className="w-[264px] h-[264px] left"
          />
        <span>
          Upload a profile photo <br /> (optional)
        </span>
      </p>

        {/* Password */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="password"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Create password
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        <div className="flex flex-col items-start">
          <label
            htmlFor="confirm-password"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
      </div>

      {/* Button placeholder */}
      <p className="mt-[90px] mb-[70px] text-base">button</p>
    </div>
  );
};

export default SignupForm;
