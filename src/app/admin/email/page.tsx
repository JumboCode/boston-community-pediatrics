import LoginForm from "@/components/auth/LoginForm"
import Button from "@/components/common/buttons/Button";

export default function EmailPage() {
  return (
    <main className="flex items-center justify-center min-h-screen ">
      <form>
        <div className="flex flex-col gap-[24px]">
          <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Sent to
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                From
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Subject
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[44px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />
            </div>
            <div className="flex flex-row items-start justify-between w-[714px]">
              <label
                className="text-base font-normal text-medium-black mb-1"
              >
                Message
              </label>
              <input
                name="first-name"
                id="first-name"
                required
                className="w-[588px] h-[204px] rounded-lg border border-medium-gray p-3 text-base text-medium-gray placeholder:text-medium-gray focus:outline-none focus:ring-2 focus:ring-bcp-blue/30 focus:border-bcp-blue"
              />

            </div>
          </div>
          <div className = "flex flex-col pl-[126px] pt-[20px]" >

              <Button
                    label="Copy Email Addresses"
                    altStyle="mt-6 w-[183px] h-[44px] text-black bg-light-gray rounded-lg font-large flex items-center justify-center"
              />
          </div>
      </form>
    </main>
  );
}