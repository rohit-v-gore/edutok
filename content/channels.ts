import type { Channel } from "@/lib/types";

export const channels: Channel[] = [
  { id: "infra", handle: "infra.decoded", name: "Infra Decoded", avatar: "🛠️", color: "#38bdf8", bio: "How the backends behind famous startups survive scale." },
  { id: "data", handle: "data.drop", name: "Data Drop", avatar: "🗄️", color: "#f59e0b", bio: "Databases, IDs, indexes and the clever tricks inside them." },
  { id: "ai", handle: "ai.unpacked", name: "AI Unpacked", avatar: "🧠", color: "#a78bfa", bio: "The math and hardware that make modern AI work." },
  { id: "hardware", handle: "hardware.lab", name: "Hardware Lab", avatar: "🚀", color: "#fb7185", bio: "Rockets, satellites and cars that ship software." },
  { id: "product", handle: "product.eng", name: "Product Engineering", avatar: "🎨", color: "#34d399", bio: "The engineering that makes great products feel magic." },
  { id: "studio", handle: "edutok.studio", name: "EduTok Studio", avatar: "✨", color: "#c6ff3d", bio: "Clips researched and written by EduTok's AI agents on request." },
];

export const channelById = (id: string) => channels.find((c) => c.id === id) ?? channels[channels.length - 1];
