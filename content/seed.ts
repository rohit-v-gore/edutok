import type { Clip, Scene, Category, Source } from "@/lib/types";

// Hand-written launch catalogue. Every clip lists the primary sources it was written from.
type Def = {
  id: string;
  title: string;
  concept: string;
  company: string;
  channelId: string;
  category: Category;
  color: string;
  hashtags: string[];
  sources: Source[];
  scenes: Scene[];
};

const T = (emoji: string, caption: string, narration: string, kicker?: string): Scene => ({
  caption, narration, visual: { kind: "title", emoji, kicker },
});
const B = (caption: string, narration: string, items: string[]): Scene => ({ caption, narration, visual: { kind: "bullets", items } });
const F = (caption: string, narration: string, nodes: string[]): Scene => ({ caption, narration, visual: { kind: "flow", nodes } });
const S = (caption: string, narration: string, value: string, label: string): Scene => ({ caption, narration, visual: { kind: "stat", value, label } });
const C = (caption: string, narration: string, left: [string, string[]], right: [string, string[]]): Scene => ({
  caption, narration, visual: { kind: "compare", left: { title: left[0], items: left[1] }, right: { title: right[0], items: right[1] } },
});
const K = (caption: string, narration: string, lang: string, code: string): Scene => ({ caption, narration, visual: { kind: "code", lang, code } });
const G = (caption: string, narration: string, cells: string[], highlight?: number[]): Scene => ({ caption, narration, visual: { kind: "grid", cells, highlight } });

const defs: Def[] = [
  {
    id: "stripe-idempotency", title: "Why Stripe never charges you twice", concept: "Idempotency keys", company: "Stripe",
    channelId: "infra", category: "Infrastructure", color: "#635bff", hashtags: ["payments", "apis", "distributed-systems"],
    sources: [{ title: "Stripe blog: Designing robust and predictable APIs with idempotency", url: "https://stripe.com/blog/idempotency" }],
    scenes: [
      T("💳", "The double-charge problem", "Your phone sends a payment request, the network drops, and you never hear back. Did the charge go through? Retrying blindly could bill the customer twice.", "Stripe"),
      F("Idempotency key", "Stripe's answer: the client generates a unique key for the operation and sends it with every attempt, including retries.", ["Client", "Idempotency-Key: a8f…", "Stripe API"]),
      K("One header", "It is literally one extra header. Same key, same operation.", "http", "POST /v1/charges\nIdempotency-Key: 5f1c9b2e-…\n\namount=2000&currency=usd"),
      F("First call wins", "The first request with a key does the work and the result is saved. Any retry with the same key just gets the saved result back, so the charge can only happen once.", ["Request #1 → charge", "Save result", "Retry → replay result"]),
      B("Why it matters", "That turns 'maybe it happened' into a safe retry. It's the same pattern you'll want in any API that moves money or sends messages.", ["Retries become safe", "No duplicate side effects", "Keys expire after ~24h"]),
    ],
  },
  {
    id: "figma-multiplayer", title: "How Figma lets 100 people edit one file", concept: "Real-time multiplayer sync", company: "Figma",
    channelId: "product", category: "Product", color: "#a259ff", hashtags: ["realtime", "crdt", "collaboration"],
    sources: [{ title: "Figma blog: How Figma's multiplayer technology works", url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/" }],
    scenes: [
      T("🎨", "Everyone editing at once", "In Figma, dozens of people can drag, resize and recolor the same design at the same time. So who wins when two people change the same thing?", "Figma"),
      F("A server per document", "Each open document gets its own process on Figma's servers. Every client keeps a WebSocket open to it and streams changes both ways.", ["Your browser", "WebSocket", "Doc server", "Teammates"]),
      G("Objects = property maps", "A file is a big map of object IDs to properties: x, y, fill, text and so on. Conflicts are tracked per property, not per whole object.", ["id:42", "x: 120", "y: 80", "fill: #A259FF", "text: 'Hi'", "parent: 7"], [2, 3]),
      C("Last writer wins, per property", "If you change the color while I move the box, both edits survive. Only two edits to the very same property conflict, and the server's order decides.", ["You", ["fill → blue"]], ["Me", ["x → 300"]]),
      B("CRDT-inspired, not pure CRDT", "Figma borrowed ideas from CRDTs but kept a central server as the source of truth, which made the system much simpler to build and reason about.", ["Central authority", "Per-property merges", "Instant local edits"]),
    ],
  },
  {
    id: "discord-trillions", title: "How Discord stores trillions of messages", concept: "Database migration at scale", company: "Discord",
    channelId: "infra", category: "Infrastructure", color: "#5865f2", hashtags: ["databases", "rust", "scylladb"],
    sources: [{ title: "Discord blog: How Discord stores trillions of messages", url: "https://discord.com/blog/how-discord-stores-trillions-of-messages" }],
    scenes: [
      T("💬", "Trillions of messages", "Every Discord message ever sent has to be readable in milliseconds. By 2022 that was trillions of messages.", "Discord"),
      B("The Cassandra pain", "Their Cassandra cluster had grown to 177 nodes. Garbage-collection pauses and hot partitions in busy channels kept causing latency spikes.", ["GC pauses", "Hot partitions", "Constant on-call toil"]),
      F("Rust data services", "They put Rust 'data services' in front of the database. If thousands of users request the same message at once, the service coalesces them into a single query.", ["API", "Rust data service", "1 query", "Database"]),
      C("Cassandra → ScyllaDB", "Then they migrated to ScyllaDB, a Cassandra-compatible database written in C++ with no garbage collector.", ["Before", ["177 Cassandra nodes", "p99 reads 40–125ms"]], ["After", ["72 ScyllaDB nodes", "p99 reads ~15ms"]]),
      S("Fewer machines, faster reads", "Less hardware and far steadier latency: proof that the boring layer between your app and your database matters.", "72", "nodes instead of 177"),
    ],
  },
  {
    id: "whatsapp-erlang", title: "How 50 engineers ran WhatsApp for 900M users", concept: "Erlang & the BEAM", company: "WhatsApp",
    channelId: "infra", category: "Infrastructure", color: "#25d366", hashtags: ["erlang", "concurrency", "messaging"],
    sources: [{ title: "Wired: Why WhatsApp only needs 50 engineers for its 900M users", url: "https://www.wired.com/2015/09/whatsapp-serves-900-million-users-50-engineers/" }],
    scenes: [
      S("A tiny team", "In 2015 WhatsApp served about 900 million people with roughly 50 engineers. A big reason: the language they built on.", "900M", "users · ~50 engineers"),
      T("☎️", "Erlang: built for phone switches", "Erlang was created at Ericsson for telephone exchanges, systems that must handle huge numbers of simultaneous connections and never go down.", "Erlang / BEAM"),
      G("Millions of tiny processes", "Erlang processes are not OS threads. They're extremely lightweight, so each chat connection can get its own isolated process.", Array.from({ length: 12 }, (_, i) => `proc ${i + 1}`), [3, 7, 10]),
      F("Let it crash", "If a process fails, a supervisor restarts it. One bad connection can't take the server down with it.", ["Process crashes", "Supervisor notices", "Restart in ms"]),
      S("2 million connections", "WhatsApp famously tuned single servers to hold over two million TCP connections at once.", "2M+", "connections on one server"),
    ],
  },
  {
    id: "netflix-chaos", title: "Netflix breaks its own servers on purpose", concept: "Chaos engineering", company: "Netflix",
    channelId: "infra", category: "Infrastructure", color: "#e50914", hashtags: ["reliability", "sre", "cloud"],
    sources: [{ title: "Netflix Chaos Monkey", url: "https://netflix.github.io/chaosmonkey/" }],
    scenes: [
      T("🐒", "Meet Chaos Monkey", "After moving to the cloud, Netflix built a tool whose only job is to randomly kill servers in production.", "Netflix"),
      B("Why would you do that?", "In the cloud, machines disappear without warning. Netflix decided it was better to find out on a Tuesday afternoon than during a Friday night premiere.", ["Instances die anyway", "Find weaknesses early", "Engineers on hand to fix"]),
      F("The loop", "Kill an instance, watch whether customers notice, fix whatever broke, and repeat until failures are boring.", ["Kill instance", "Observe impact", "Fix weakness", "Repeat"]),
      B("The Simian Army", "It grew into a whole toolkit: simulating latency, losing an entire availability zone, even a full region.", ["Latency injection", "Zone outage", "Region evacuation"]),
      T("🧪", "Chaos engineering", "This became a discipline: run controlled experiments on production to build confidence that the system can survive turbulence.", "Now an industry practice"),
    ],
  },
  {
    id: "uber-h3", title: "Why Uber divides the world into hexagons", concept: "H3 geospatial index", company: "Uber",
    channelId: "data", category: "Data", color: "#000000", hashtags: ["geospatial", "maps", "pricing"],
    sources: [{ title: "Uber Engineering: H3, Uber's hexagonal hierarchical spatial index", url: "https://www.uber.com/blog/h3/" }],
    scenes: [
      T("🗺️", "Where is demand?", "To price rides and position drivers, Uber has to bucket millions of locations into areas, fast.", "Uber"),
      C("Squares vs hexagons", "With a square grid, diagonal neighbors are farther away than side neighbors. Every hexagon's six neighbors sit at the same distance.", ["Squares", ["8 neighbors", "2 different distances"]], ["Hexagons", ["6 neighbors", "1 distance"]]),
      G("A hierarchy of cells", "H3 tiles the globe at 16 resolutions, from continent-sized cells down to a few square meters, each with a compact 64-bit ID.", ["res 0", "res 3", "res 6", "res 9", "res 12", "res 15"], [3]),
      F("Counting supply & demand", "Map every request and every driver to a cell ID, count per cell, and you have a live heatmap for surge pricing and dispatch.", ["GPS point", "H3 cell id", "Aggregate", "Price & dispatch"]),
      B("Open source", "Uber open-sourced H3 in 2018 and it's now used far beyond ride-hailing.", ["Logistics", "Mapping", "Analytics"]),
    ],
  },
  {
    id: "cloudflare-anycast", title: "One IP address, 300+ cities", concept: "Anycast routing", company: "Cloudflare",
    channelId: "infra", category: "Infrastructure", color: "#f38020", hashtags: ["networking", "cdn", "ddos"],
    sources: [{ title: "Cloudflare Learning Center: What is Anycast?", url: "https://www.cloudflare.com/learning/cdn/glossary/anycast-network/" }],
    scenes: [
      T("🌐", "Same address everywhere", "When you visit a site behind Cloudflare, the IP you connect to is announced from data centers all over the world at once.", "Cloudflare"),
      C("Unicast vs anycast", "Normally one IP means one location. With anycast, many locations advertise the same IP and the internet's routing picks a nearby one.", ["Unicast", ["1 IP → 1 server"]], ["Anycast", ["1 IP → many sites", "Nearest one answers"]]),
      F("BGP does the steering", "Each data center announces the same IP block over BGP. Routers simply forward your packets along the shortest path they know.", ["You", "Your ISP", "Nearest PoP"]),
      B("DDoS shock absorber", "A flood of attack traffic gets split across hundreds of locations instead of landing on one, so no single site drowns.", ["Traffic spreads out", "Capacity adds up", "Failover is automatic"]),
      S("Global by default", "Cloudflare runs this across more than 300 cities, so most users are only milliseconds away.", "300+", "cities, one IP"),
    ],
  },
  {
    id: "notion-blocks", title: "Everything in Notion is a block", concept: "Block data model & sharding", company: "Notion",
    channelId: "data", category: "Data", color: "#e5e5e5", hashtags: ["postgres", "sharding", "data-model"],
    sources: [{ title: "Notion blog: Herding elephants, lessons learned from sharding Postgres at Notion", url: "https://www.notion.com/blog/sharding-postgres-at-notion" }],
    scenes: [
      T("🧱", "Blocks all the way down", "In Notion, every paragraph, to-do, image and even page is a block. Pages are just blocks that contain other blocks.", "Notion"),
      K("A block record", "Each block has an ID, a type, its properties, an ordered list of child IDs and a pointer to its parent.", "json", '{\n  "id": "b7…",\n  "type": "to_do",\n  "properties": { "title": "Ship it" },\n  "content": ["c1…", "c2…"],\n  "parent": "p9…"\n}'),
      B("Why it's powerful", "Because everything is the same shape, you can drag, nest, link and turn any block into any other type.", ["Turn a list into a page", "Embed anywhere", "One permission model"]),
      S("Billions of rows", "That design means a huge number of rows. In 2021 Notion split its Postgres database into 480 logical shards across 32 machines.", "480", "logical shards"),
      F("Shard by workspace", "Every block is routed by its workspace ID, so one team's blocks live together and queries rarely cross shards.", ["Block", "workspace_id", "Shard N", "Postgres host"]),
    ],
  },
  {
    id: "snowflake-separation", title: "Snowflake's big idea: storage ≠ compute", concept: "Separating storage and compute", company: "Snowflake",
    channelId: "data", category: "Data", color: "#29b5e8", hashtags: ["data-warehouse", "cloud", "olap"],
    sources: [{ title: "Snowflake docs: Micro-partitions & data clustering", url: "https://docs.snowflake.com/en/user-guide/tables-clustering-micropartitions" }],
    scenes: [
      T("❄️", "The old warehouse problem", "Classic data warehouses bundled disks and CPUs in the same boxes. Need more compute? You also bought storage you didn't need.", "Snowflake"),
      F("Three layers", "Snowflake splits it apart: data sits in cheap cloud object storage, queries run on independent 'virtual warehouses', and a services layer coordinates.", ["Cloud storage", "Virtual warehouses", "Services layer"]),
      B("Scale each side alone", "Spin up a big cluster for a heavy report and pause it when done, without copying data. Many teams can query the same data at once without fighting.", ["Pay per second of compute", "Isolated workloads", "One copy of data"]),
      G("Micro-partitions", "Tables are stored as small columnar micro-partitions with min and max stats per column, so queries can skip the partitions that can't match.", ["Jan 1–3", "Jan 4–6", "Jan 7–9", "Jan 10–12", "Jan 13–15", "Jan 16–18"], [3]),
      T("☁️", "Built for the cloud", "This 'separate storage and compute' architecture is now the default for modern data platforms.", "A pattern worth knowing"),
    ],
  },
  {
    id: "nvidia-cuda", title: "Why AI runs on graphics cards", concept: "GPUs & CUDA", company: "NVIDIA",
    channelId: "ai", category: "AI", color: "#76b900", hashtags: ["gpu", "parallelism", "deep-learning"],
    sources: [{ title: "NVIDIA CUDA Zone", url: "https://developer.nvidia.com/cuda-zone" }],
    scenes: [
      C("CPU vs GPU", "A CPU has a few very powerful cores. A GPU has thousands of simpler ones designed to do the same operation on lots of data at once.", ["CPU", ["Few big cores", "Great at branching logic"]], ["GPU", ["Thousands of cores", "Great at bulk math"]]),
      G("Neural nets are matrix math", "Training a neural network is mostly multiplying huge matrices. Every cell of the output can be computed independently, which is perfect for a GPU.", Array.from({ length: 16 }, (_, i) => `${(i * 7) % 10}`), [0, 5, 10, 15]),
      T("🟩", "CUDA (2007)", "NVIDIA's CUDA let programmers write general code for GPUs instead of disguising math as graphics. Researchers adopted it fast.", "The software moat"),
      S("The AlexNet moment", "In 2012, AlexNet, trained on two consumer GPUs, crushed the ImageNet competition and kicked off the deep learning boom.", "2", "GTX 580 GPUs"),
      B("The moat today", "Years of CUDA libraries, tools and developer habits are a big part of why NVIDIA dominates AI hardware.", ["cuDNN, cuBLAS", "Every major framework", "Huge developer base"]),
    ],
  },
  {
    id: "transformers-attention", title: "Attention: the idea behind ChatGPT", concept: "Transformers & self-attention", company: "OpenAI / Google",
    channelId: "ai", category: "AI", color: "#10a37f", hashtags: ["llm", "transformers", "nlp"],
    sources: [{ title: "Vaswani et al., Attention Is All You Need (2017)", url: "https://arxiv.org/abs/1706.03762" }],
    scenes: [
      T("🔤", "Predict the next word", "Models like GPT are trained on one simple task: given some text, predict the next token. Do it trillions of times and remarkable skills emerge.", "Large language models"),
      F("Self-attention", "For every word, the model asks: which other words in this sentence matter for understanding me? It mixes in information from those words.", ["'it'", "looks back at…", "'the animal'"]),
      F("Queries, keys, values", "Each token becomes a query, a key and a value. Matching queries to keys gives attention weights, which blend the values.", ["Query", "× Keys → weights", "Σ weights × Values"]),
      C("Why it beat RNNs", "Older recurrent networks read one word at a time. Transformers look at every position in parallel, which suits GPUs and scales much further.", ["RNN", ["Sequential", "Forgets long context"]], ["Transformer", ["Parallel", "Direct links across text"]]),
      S("2017", "The 2017 Google paper 'Attention Is All You Need' introduced the Transformer. Nearly every modern LLM is built on it.", "2017", "Transformer paper"),
    ],
  },
  {
    id: "rlhf", title: "How chatbots learned to follow instructions", concept: "RLHF", company: "OpenAI",
    channelId: "ai", category: "AI", color: "#0ea5e9", hashtags: ["llm", "alignment", "reinforcement-learning"],
    sources: [{ title: "Ouyang et al., Training language models to follow instructions with human feedback (2022)", url: "https://arxiv.org/abs/2203.02155" }],
    scenes: [
      T("🤖", "Smart isn't the same as helpful", "A raw language model just continues text. Ask it a question and it might write three more questions instead of answering.", "From GPT-3 to assistants"),
      F("Step 1: show examples", "First, people write good answers to sample prompts, and the model is fine-tuned to imitate them.", ["Prompt", "Human-written answer", "Fine-tune"]),
      F("Step 2: rank answers", "Next, the model writes several answers and people rank them. A separate reward model learns to predict which answers humans prefer.", ["4 answers", "Humans rank", "Reward model"]),
      F("Step 3: reinforce", "Finally, the model is optimized with reinforcement learning to produce answers the reward model scores highly.", ["Generate", "Score", "Update policy"]),
      S("Small but preferred", "In OpenAI's 2022 InstructGPT paper, people preferred answers from a 1.3B-parameter tuned model over the 175B-parameter original.", "1.3B > 175B", "in human preference"),
    ],
  },
  {
    id: "spacex-reuse", title: "How SpaceX lands rockets", concept: "Propulsive booster landing", company: "SpaceX",
    channelId: "hardware", category: "Hardware", color: "#1e293b", hashtags: ["rockets", "reusability", "control-systems"],
    sources: [{ title: "SpaceX: Falcon 9", url: "https://www.spacex.com/vehicles/falcon-9/" }],
    scenes: [
      T("🚀", "Throwing away the airplane", "For decades, rockets were used once and dropped into the ocean, like scrapping a jet after every flight.", "SpaceX"),
      F("The return trip", "After separation, a Falcon 9 booster flips, relights engines to head back, fires again to slow its plunge through the atmosphere, then lands.", ["Boostback burn", "Entry burn", "Landing burn"]),
      B("Steering a falling tube", "Grid fins at the top steer it through the air, and the engines gimbal to keep it upright. The landing burn is timed to reach zero speed right at the ground.", ["Grid fins", "Engine gimbal", "Hoverslam timing"]),
      S("December 21, 2015", "The first orbital-class booster landing happened in December 2015. The first reflight of a landed booster followed in 2017.", "2015", "first landing"),
      S("Reuse at scale", "Individual boosters have now flown more than 20 times, which is a big part of why SpaceX launches so often.", "20+", "flights per booster"),
    ],
  },
  {
    id: "starlink-phased-array", title: "How a Starlink dish tracks satellites without moving", concept: "Phased-array antennas & LEO", company: "SpaceX Starlink",
    channelId: "hardware", category: "Hardware", color: "#0f172a", hashtags: ["satellites", "rf", "networking"],
    sources: [{ title: "Starlink technology", url: "https://www.starlink.com/technology" }],
    scenes: [
      C("Why low orbit?", "Old satellite internet used satellites 36,000 km up. Starlink flies around 550 km, so signals travel a much shorter distance.", ["Geostationary", ["~36,000 km", "~600ms round trip"]], ["Starlink LEO", ["~550 km", "Tens of ms"]]),
      B("A moving target", "Low satellites cross the sky in minutes, so the dish must constantly hand off from one to the next.", ["Fast-moving satellites", "Frequent handoffs", "Thousands in orbit"]),
      G("Phased array", "The dish is a grid of many small antennas. Shifting the timing of each one steers the combined beam electronically, with no motors.", Array.from({ length: 16 }, () => "◉"), [5, 6, 9, 10]),
      F("Lasers in space", "Newer satellites pass data to each other with lasers, so traffic can cross oceans before coming down to a ground station.", ["Dish", "Satellite", "Laser link", "Satellite", "Ground station"]),
      T("📡", "Software-defined sky", "The result is internet almost anywhere, built on a mix of rocket economics, radio physics and routing software.", "Starlink"),
    ],
  },
  {
    id: "tesla-ota", title: "Teslas that improve while parked", concept: "Over-the-air updates & fleet data", company: "Tesla",
    channelId: "hardware", category: "Hardware", color: "#cc0000", hashtags: ["cars", "ota", "machine-learning"],
    sources: [{ title: "Tesla support: Software updates", url: "https://www.tesla.com/support/software-updates" }],
    scenes: [
      T("🚗", "A car that gets updates", "Most cars are frozen the day they leave the factory. Teslas download new software over Wi‑Fi or cellular, like a phone.", "Tesla"),
      B("What OTA can change", "Updates have changed things like the user interface, battery and charging behavior, safety features and driver assistance.", ["New features", "Bug and safety fixes", "Efficiency tweaks"]),
      F("The data engine", "Cars in the fleet can flag tricky situations. Those clips are labeled, used to retrain neural networks, and the improved models ship back out.", ["Fleet finds edge case", "Label & retrain", "Ship OTA", "Repeat"]),
      B("Shadow mode", "Tesla has described running new models silently alongside the active one, comparing their decisions with what the driver actually did.", ["New model runs silently", "Compare to driver", "No control of the car"]),
      T("🔁", "Hardware as a platform", "The lesson for startups: ship hardware that can keep getting better, and design the feedback loop from day one.", "Software-defined vehicles"),
    ],
  },
  {
    id: "shopify-modular-monolith", title: "Shopify kept its monolith and won", concept: "Modular monolith", company: "Shopify",
    channelId: "infra", category: "Infrastructure", color: "#95bf47", hashtags: ["architecture", "rails", "microservices"],
    sources: [{ title: "Shopify Engineering: Deconstructing the monolith", url: "https://shopify.engineering/deconstructing-monolith-designing-software-maximizes-developer-productivity" }],
    scenes: [
      T("🛍️", "Microservices aren't mandatory", "Shopify runs one of the largest Ruby on Rails codebases in the world, and chose not to break it into microservices.", "Shopify"),
      C("Monolith vs microservices", "Microservices add network calls, deployments and failure modes. A monolith is simpler to run, but can rot into a tangled ball of code.", ["Microservices", ["Independent deploys", "Network complexity"]], ["Monolith", ["Simple ops", "Risk of tangling"]]),
      G("Components with borders", "Their answer: a modular monolith. The code is split into components with clear public interfaces and owners, all in one app.", ["Checkout", "Orders", "Billing", "Shipping", "Inventory", "Online Store"], [0, 2]),
      K("Enforced by tooling", "They open-sourced Packwerk, a tool that flags code reaching into another component's private internals.", "yaml", "# package.yml\nenforce_dependencies: true\nenforce_privacy: true\ndependencies:\n  - components/orders"),
      B("Pods for scale", "For scaling, shops are spread across 'pods', isolated slices with their own databases, so one huge flash sale can't sink everyone.", ["Isolated pods", "Own MySQL per pod", "Contain blast radius"]),
    ],
  },
  {
    id: "google-pagerank", title: "The algorithm that started Google", concept: "PageRank", company: "Google",
    channelId: "data", category: "Data", color: "#4285f4", hashtags: ["search", "graphs", "algorithms"],
    sources: [{ title: "Brin & Page, The Anatomy of a Large-Scale Hypertextual Web Search Engine (1998)", url: "http://infolab.stanford.edu/~backrub/google.html" }],
    scenes: [
      T("🔎", "Search in 1998 was bad", "Early search engines mostly matched keywords, so pages could just repeat a word a hundred times to rank first.", "Google"),
      F("Links are votes", "Larry Page and Sergey Brin treated a link from one page to another as a vote of confidence.", ["Page A", "links to", "Page B (+1 vote)"]),
      B("Not all votes are equal", "A vote from an important page counts more. And a page's importance comes from the votes it receives, so it's defined recursively.", ["Important pages vote louder", "Score spread across links", "Iterate until stable"]),
      F("The random surfer", "Picture someone clicking links at random and sometimes jumping to a random page. PageRank is the share of time they'd spend on each page.", ["Click a link (85%)", "Jump anywhere (15%)", "Long-run visit share"]),
      T("🏆", "A startup from a paper", "That idea, published as a Stanford research paper, became the core of the most valuable search engine ever built.", "1998"),
    ],
  },
  {
    id: "dropbox-sync", title: "How Dropbox syncs huge files instantly", concept: "Block-level sync & dedup", company: "Dropbox",
    channelId: "data", category: "Data", color: "#0061ff", hashtags: ["storage", "hashing", "sync"],
    sources: [{ title: "Dropbox Tech: Inside the Magic Pocket", url: "https://dropbox.tech/infrastructure/inside-the-magic-pocket" }],
    scenes: [
      T("📦", "Change one slide, upload 1GB?", "If you edit one page of a giant file, re-uploading the whole thing would be painfully slow.", "Dropbox"),
      G("Split into blocks", "Dropbox splits files into blocks of up to 4MB and fingerprints each block with a cryptographic hash.", ["blk 1 ✓", "blk 2 ✓", "blk 3 ✎", "blk 4 ✓", "blk 5 ✓", "blk 6 ✓"], [2]),
      F("Only send what changed", "The client compares hashes with the server and uploads only the blocks it doesn't already have.", ["Hash blocks", "Ask server", "Upload missing only"]),
      B("Free deduplication", "If the same block already exists, there's nothing to store twice. Identical content collapses to a single copy.", ["Faster uploads", "Less bandwidth", "Less storage"]),
      S("Magic Pocket", "In 2016 Dropbox moved most user data off Amazon S3 onto Magic Pocket, its own exabyte-scale storage system.", "Exabytes", "on in-house storage"),
    ],
  },
  {
    id: "instagram-ids", title: "How Instagram makes unique IDs without a central server", concept: "Sharded ID generation", company: "Instagram",
    channelId: "data", category: "Data", color: "#e1306c", hashtags: ["postgres", "ids", "sharding"],
    sources: [{ title: "Instagram Engineering: Sharding & IDs at Instagram", url: "https://instagram-engineering.com/sharding-ids-at-instagram-1cf5a71e5a5c" }],
    scenes: [
      T("📸", "Who hands out the IDs?", "With data spread across many database shards, Instagram needed unique IDs that could be made anywhere and still sort by time.", "Instagram"),
      G("64 bits, three parts", "Their 64-bit ID packs three fields together.", ["41 bits: time (ms)", "13 bits: shard id", "10 bits: sequence"], [0]),
      B("What each part does", "Time makes IDs sortable. Shard ID tells you where the row lives. The sequence allows 1,024 new IDs per shard per millisecond.", ["Sortable by creation time", "Encodes its own location", "No coordination needed"]),
      K("Generated inside Postgres", "The ID is generated by a function inside Postgres, so each shard mints its own IDs with no extra service.", "sql", "id := (now_ms - epoch) << 23\n    | shard_id << 10\n    | (nextval(seq) % 1024);"),
      B("Logical vs physical shards", "They created thousands of logical shards mapped onto far fewer physical servers, so growing later meant moving shards, not re-splitting data.", ["Thousands of logical shards", "Few physical hosts", "Rebalance by moving"]),
    ],
  },
  {
    id: "docker-containers", title: "What a container actually is", concept: "Containers: namespaces & cgroups", company: "Docker",
    channelId: "infra", category: "Infrastructure", color: "#2496ed", hashtags: ["containers", "linux", "devops"],
    sources: [{ title: "Docker docs: What is Docker?", url: "https://docs.docker.com/get-started/docker-overview/" }],
    scenes: [
      T("🐳", "'It works on my machine'", "Docker launched in 2013 to make software run the same everywhere, from a laptop to production.", "Docker"),
      C("Not a mini VM", "A virtual machine runs a whole separate operating system. A container is just a normal process that the Linux kernel isolates.", ["Virtual machine", ["Own kernel", "Boots in seconds–minutes"]], ["Container", ["Shared kernel", "Starts in milliseconds"]]),
      B("Namespaces: what you can see", "Namespaces give the process its own view of process IDs, network, mounts and hostname, so it thinks it's alone.", ["pid", "net", "mnt", "uts", "user"]),
      B("cgroups: what you can use", "Control groups cap how much CPU, memory and I/O the process can use.", ["CPU limits", "Memory limits", "I/O limits"]),
      G("Layered images", "Images are stacks of read-only layers, so a hundred containers can share the same base layers on disk.", ["your app", "dependencies", "python runtime", "debian base"], [0]),
    ],
  },
  {
    id: "kafka-log", title: "LinkedIn's simple idea that runs the internet's data", concept: "Kafka & the log", company: "LinkedIn",
    channelId: "infra", category: "Infrastructure", color: "#0a66c2", hashtags: ["streaming", "kafka", "event-driven"],
    sources: [{ title: "Jay Kreps, The Log: What every software engineer should know about real-time data", url: "https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying" }],
    scenes: [
      T("📜", "Spaghetti pipelines", "LinkedIn had dozens of systems each wired directly to many others. Every new data source meant building a pile of new pipelines.", "LinkedIn"),
      G("Just an append-only log", "Kafka's core idea is a log: new events are only ever appended to the end, and each one gets an offset number.", ["0", "1", "2", "3", "4", "5", "6", "7 ←"], [7]),
      F("Producers and consumers", "Producers write events once. Any number of consumers read at their own pace, each remembering its own offset.", ["Producers", "Kafka topic", "Search", "Analytics", "Feed"]),
      B("Why it's fast", "Appending and reading sequentially is very friendly to disks, and topics are split into partitions spread across many machines.", ["Sequential disk I/O", "Partitioned topics", "Batching"]),
      T("🔗", "A central nervous system", "Open-sourced in 2011, Kafka became the default backbone for streaming data at thousands of companies.", "2011"),
    ],
  },
  {
    id: "duolingo-hlr", title: "How Duolingo knows you're about to forget", concept: "Spaced repetition models", company: "Duolingo",
    channelId: "ai", category: "AI", color: "#58cc02", hashtags: ["edtech", "machine-learning", "memory"],
    sources: [{ title: "Settles & Meeder, A Trainable Spaced Repetition Model for Language Learning (ACL 2016)", url: "https://research.duolingo.com/papers/settles.acl16.pdf" }],
    scenes: [
      T("🦉", "The forgetting curve", "Memories fade over time, but each well-timed review makes them fade more slowly.", "Duolingo"),
      K("Half-life regression", "Duolingo's 2016 model predicts the chance you still remember a word: two to the power of minus time since practice, divided by that word's memory half-life.", "math", "p = 2^(−Δ / h)\n\nΔ = time since last practice\nh = predicted half-life"),
      B("Learning each half-life", "The half-life is predicted from your history with the word, like how often you've seen it and got it right, plus features of the word itself.", ["Times seen", "Times correct", "Word difficulty"]),
      F("Review at the right moment", "When your predicted recall drops, the word comes back into your lessons, just before you would have forgotten it.", ["Predict recall", "Drops below target", "Schedule review"]),
      T("📈", "Better retention", "In their experiments the trained model predicted recall far better than fixed rules, and learners engaged more. Good learning products are built on models of memory.", "Edtech meets ML"),
    ],
  },
];

export const seedClips: Clip[] = defs.map((d, i) => ({
  ...d,
  createdAt: new Date(Date.UTC(2026, 9, 1 + i)).toISOString(),
}));
