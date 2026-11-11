import { notFound } from "next/navigation";
import { channels } from "@/content/channels";
import { allClips } from "@/lib/clip-store";
import ChannelView from "@/components/profile/ChannelView";

export const dynamic = "force-dynamic";

export default async function ChannelPage({ params }: { params: { id: string } }) {
  const channel = channels.find((c) => c.id === params.id);
  if (!channel) notFound();
  const clips = (await allClips()).filter((c) => c.channelId === channel.id);
  return <ChannelView channel={channel} clips={clips} />;
}
