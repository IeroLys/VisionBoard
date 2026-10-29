type AuthFieldProps = {
  name: string
  label: string
  type?: "text" | "email" | "password"
  autoComplete?: string
  error?: string
}

export default function AuthField({
  name,
  label,
  type = "text",
  autoComplete,
  error,
}: AuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 ml-2 block font-['Inter'] text-[20px] font-light text-black"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className="w-full rounded-[20px] border border-main-desaturated bg-[#E3F0FF] px-4 py-3 text-gray-700 transition-all focus:border-transparent focus:ring-2 focus:ring-main focus:outline-none"
      />
      {error && (
        <p
          id={`${name}-error`}
          className="mt-1.5 ml-2 font-['Inter'] text-[18px] text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  )
}
