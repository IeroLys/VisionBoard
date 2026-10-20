import Link from "next/link";

export default function MainPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      
        <label className="text-[30px] text-main font-['Inter']"><b>Vision Board</b></label>
        <div className="flex flex-col gap-4 text-sm leading-loose">

          <div className="mt-[20px] flex flex-row items-center justify-center">
            <div className="flex items-center justify-center w-[100px] h-[100px] rounded-[15px] bg-overcast-sky border-3 border-main-desaturated">
              <label className="mt-[0px] text-[30px] text-main font-['Inter']">📷</label>
            </div>

            <div className="flex flex-col justify-center ml-[10px] w-[550px] h-[100px] rounded-[15px] bg-overcast-sky border-3 border-main-desaturated p-8">
              <Link href="/user"  className="text-[20px] font-['Inter'] text-main-desaturated hover:underline">
                Jhon Doe
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center w-[660px] h-[400px] bg-white rounded-[15px] bg-overcast-sky border-3 border-main-desaturated p-2">
            <label className="block text-sm text-[20px] text-main-desaturated text-center font-['Inter']">У вас пока нет проектов, начать работу?</label>
            <Link href="/register"  className="block ml-[2px] mt-[5px] text-sm text-[20px] mb-3 text-center font-['Inter'] text-main-desaturated hover:underline">
              <b>Регистрация</b>
            </Link>
          </div>

        </div>
    </div>
  )
}
