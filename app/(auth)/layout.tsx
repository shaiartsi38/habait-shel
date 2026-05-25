export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(196,133,122,0.09) 0%, #080608 70%)",
      }}
    >
      {children}
    </div>
  );
}
