import { BlurView } from "expo-blur";

export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <BlurView
      intensity={35}
      tint="dark"
      style={{
        borderRadius: 20,
        padding: 16,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
      }}
    >
      {children}
    </BlurView>
  );
}
