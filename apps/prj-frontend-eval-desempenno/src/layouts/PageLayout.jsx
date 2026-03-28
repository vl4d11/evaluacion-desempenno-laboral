export default function PageLayout({children}) {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full flex flex-col gap-4 p-4 pt-6 pb-30">
          {children}
        </div>
      </div>
    </div>
  );
}
