import Image from "next/image";
import BackArrow from "@/assets/icons/arrow-left.svg";
import ProfilePlaceholder from "@/assets/icons/pfp-placeholder.svg"
import Link from "next/link";
import Button from "@/components/common/buttons/Button";

const EventForm = () => {
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
        Create a new event
      </h1>
      <p className="text-black text-2xl font-normal text-center mb-16">
        Add carousel and button component here later...
      </p>

      {/* Form fields */}
      <div className="flex flex-col gap-10 mx-[102px]">
        {/* Event Title */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="event title"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event title
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Event Date */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="date"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event date
          </label>
          <input
            id="event date"
            type="date"
            required
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* time */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="dob"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Event time
          </label>
          <input
            id="event time"
            type="time"
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
            Event description
          </label>
          <input
            id="street"
            className="w-[588px] h-[175px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>

        {/* Street Address */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Street Address
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
            Apt, suite, etc
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
            City
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
              State
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
              Zip code 
            </label>
            <input
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>

        {/* Position name */}
        <div className="flex flex-row gap-[60px]">
            <div className="flex flex-col items-start">
                <label
                    htmlFor="name"
                    className="text-base font-normal text-[#6B6B6B] mb-1"
                >
                    Position name
                </label>
                <input
                    id="position name"
                    type="name"
                    required
                    className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
                />
            </div>
        </div>

    {/* Position date */}
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right */}
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-date"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Position date
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Date input below */}
    <input
        id="position-date"
        type="date"
        required
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>
    
        {/* Position time */}
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right */}
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-time"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Position time
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Date input below */}
    <input
        id="position-time"
        type="time"
        required
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>
        

        <div className="flex flex-col items-start">
          <label
            htmlFor="street"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Position description
          </label>
          <input
            id="description"
            className="w-[588px] h-[175px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
         {/* Street Address */}
    <div className="flex flex-col gap-2">
    {/* Top row: label on left, checkbox + text on right */}
    <div className="flex items-center justify-between">
        <label
        htmlFor="position-street"
        className="text-base font-normal text-[#6B6B6B]"
        >
        Street Address
        </label>

        <div className="flex items-center gap-2">
        <Button
            label="Same as event"
            altStyle="bg-transparent text-[#6B6B6B] font-medium px-0 hover:bg-transparent focus:outline-none"
            // onClick={handleCheckboxChange}
        />
        <input
            type="checkbox"
            className="w-5 h-5 accent-[#234254] cursor-pointer"
        />
        </div>
    </div>

    {/* Street input below */}
    <input
        id="position-street"
        type="street"
        required
        className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
    />
    </div>

        {/* Apt/Suite */}
        <div className="flex flex-col items-start">
          <label
            htmlFor="apt"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Apt, suite, etc
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
            City
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
              State
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
              Zip code 
            </label>
            <input
              id="zip"
              inputMode="numeric"
              className="w-[264px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
            />
          </div>
        </div>
        <div className="flex flex-col items-start">
          <label
            htmlFor="participants"
            className="text-base font-normal text-[#6B6B6B] mb-1"
          >
            Maximum number of participants
          </label>
          <input
            id="number of participants"
            className="w-[588px] h-[43px] rounded-lg border border-[#6B6B6B] p-3 text-base text-[#6B6B6B] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#234254]/30 focus:border-[#234254]"
          />
        </div>
      </div>

      {/* Button placeholder */}
      <div className="flex flex-col items-start mt-[56px] mb-[56px]">
        <Button
            label=" + Add another position"
            altStyle="bg-[#CAD1D4] text-[#000000] text-[16px] w-[201px] h-[44px] font-medium px-4 py-2 rounded-lg hover:bg-[#b9c0c3]"
        />
      </div>

    </div>
    );
};
export default EventForm;