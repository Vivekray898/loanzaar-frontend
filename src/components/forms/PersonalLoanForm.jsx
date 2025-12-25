"use client"

export default function PersonalLoanForm() {
  return (
    <section className="bg-white rounded-2xl shadow-md p-6">
      
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Check Your Eligibility
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Takes less than 2 minutes
        </p>
      </header>

      <form className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="Enter your city"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full mt-4 py-3 rounded-xl bg-black text-white font-medium text-sm hover:bg-gray-900 transition"
        >
          Continue
        </button>
      </form>

      {/* Trust Line */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Your information is 100% secure and encrypted
      </p>
    </section>
  )
}
"use client"

export default function PersonalLoanForm() {
  return (
    <section className="bg-white rounded-2xl shadow-md p-6">
      
      <header className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Check Your Eligibility
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Takes less than 2 minutes
        </p>
      </header>

      <form className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number
          </label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            placeholder="Enter your city"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          className="w-full mt-4 py-3 rounded-xl bg-black text-white font-medium text-sm hover:bg-gray-900 transition"
        >
          Continue
        </button>
      </form>

      {/* Trust Line */}
      <p className="mt-4 text-xs text-gray-500 text-center">
        Your information is 100% secure and encrypted
      </p>
    </section>
  )
}
