/** Loading placeholder in the same layout as the app pages. */
export default function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4" aria-busy="true">
      <span className="sr-only">Загрузка...</span>
      <div className="w-full max-w-[1100px] flex flex-col gap-8 animate-pulse">
        <div className="w-full h-[160px] bg-overcast-sky rounded-[20px] p-8 flex flex-col justify-center gap-3">
          <div className="h-4 w-40 bg-white/70 rounded-full" />
          <div className="h-8 w-64 bg-white/70 rounded-full" />
        </div>
        <div className="w-full min-h-[500px] bg-white rounded-[20px] border border-main p-8 flex justify-center">
          <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            {Array.from({ length: cards }).map((_, i) => (
              <div key={i} className="bg-overcast-sky rounded-[15px] h-[160px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
