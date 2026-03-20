export default function CeoAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
